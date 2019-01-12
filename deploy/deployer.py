import argparse
import enum
import json
import logging
import os
import sys
import time
from datetime import datetime
from pathlib import Path

import boto3
from botocore.exceptions import ClientError
from prompt_toolkit import prompt

_LOG_FORMAT = '%(asctime)s %(name)s %(levelname)s - %(message)s'
_COGNITO_CFN_PATH = './deploy/cognito.yml'


class Flavor(enum.Enum):
    DEV = 'dev'
    STAGING = 'staging'
    PROD = 'prod'


class DeployError(RuntimeError):
    pass


class NoChangesError(DeployError):
    pass


# If a change set does not have any changes it will throw an error with the following reason
_NO_CHANGES_REASON = "The submitted information didn't contain changes. Submit different " \
                     "information to create a change set."


def _gen_change_set_id() -> str:
    return datetime.utcnow().strftime('%Y%m%d-%H%M%S')


class CognitoDeployer:

    def __init__(self, flavor: Flavor, session: boto3.Session, no_prompt: bool):
        """

        :param flavor: flavor to deploy to
        :param session: boto3 session to use
        :param no_prompt: automatically execute change sets without prompting
        """
        self.flavor = flavor
        self.session = session
        self.no_prompt = no_prompt

        self.log = logging.getLogger('CognitoDeployer')
        self.log.setLevel(logging.INFO)

        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.INFO)
        formatter = logging.Formatter(fmt=_LOG_FORMAT)
        # https://stackoverflow.com/a/42461942
        formatter.default_msec_format = '%s.%03d'
        handler.setFormatter(formatter)
        self.log.addHandler(handler)

        self.cfn = session.client('cloudformation')
        self.stack_name = f'{self.flavor.value}-etched-cognito'
        self.change_set_name = f'{self.stack_name}-{_gen_change_set_id()}'

    def deploy(self):
        stack_exists = self._check_stack_exists()

        self._create_change_set(stack_exists)
        try:
            change_set = self._wait_for_change_set_available()
        except NoChangesError:
            return

        if not stack_exists:
            # Execute the change set if a stack doesn't exist
            self._execute_change_set()
        else:
            self.log.info(json.dumps(change_set['Changes'], sort_keys=True, indent=2))

            if self.no_prompt:
                # Execute the change set without prompting
                self._execute_change_set()
            else:
                execute_change = self._prompt_execute_change_set()

                if execute_change:
                    self._execute_change_set()
                else:
                    self.log.info(f'Not executing change set {self.change_set_name}. Deleting.')
                    self._delete_change_set()

    def _check_stack_exists(self) -> bool:
        try:
            self.log.info('Checking if stack %s exists', self.stack_name)
            result = self.cfn.describe_stacks(StackName=self.stack_name)
            return len(result['Stacks']) != 0
        except ClientError:
            return False

    def _create_change_set(self, stack_exists: bool) -> None:
        change_set_type = 'UPDATE' if stack_exists else 'CREATE'
        self.log.info('stack exists: %s', stack_exists)

        self.log.info('Creating change set %s', self.change_set_name)
        with Path(_COGNITO_CFN_PATH).open() as template_file:
            self.cfn.create_change_set(
                StackName=self.stack_name,
                TemplateBody=template_file.read(),
                Parameters=[
                    {'ParameterKey': 'Flavor', 'ParameterValue': self.flavor.value}
                ],
                Capabilities=['CAPABILITY_IAM'],
                ChangeSetName=self.change_set_name,
                ChangeSetType=change_set_type
            )

    def _wait_for_change_set_available(self) -> dict:
        available = False
        response = None

        while not available:
            # TODO: Handle pagination when there are many change sets
            response = self.cfn.describe_change_set(ChangeSetName=self.change_set_name,
                                                    StackName=self.stack_name)

            if response['ExecutionStatus'] == 'AVAILABLE':
                available = True
            else:
                if response['ExecutionStatus'] == 'UNAVAILABLE':
                    if self._is_no_changes_change_set(response):
                        self.log.info('No changes to deploy')
                        self._delete_change_set()
                        raise NoChangesError()
                    elif response['Status'] == 'FAILED':
                        self.log.error(f"Change set failed: {json.dumps(response['StatusReason'])}")
                        raise DeployError(json.dumps(response, default=str))

                    self.log.info('Waiting for change set to be available')
                    time.sleep(5)
                else:
                    self.log.error('Unexpected execution status: %s', json.dumps(response))
                    raise DeployError('Unexpected execution status')
        return response

    def _is_no_changes_change_set(self, response: dict) -> bool:
        return response['Status'] == 'FAILED' and response['StatusReason'] == _NO_CHANGES_REASON

    def _execute_change_set(self):
        self.log.info(f'Executing change set {self.change_set_name}')

        self.cfn.execute_change_set(ChangeSetName=self.change_set_name,
                                    StackName=self.stack_name)

        while True:
            try:
                self.cfn.describe_change_set(StackName=self.stack_name,
                                             ChangeSetName=self.change_set_name)
                time.sleep(5)
            except self.cfn.exceptions.ChangeSetNotFoundException as ce:
                self.log.info('Applying change set')
                self._wait_for_stack_update()
                return

    def _prompt_execute_change_set(self) -> bool:
        valid_answer = False
        answer = None
        while not valid_answer:
            answer = prompt('Apply change set? (y/yes n/no) ')
            if answer in ['yes', 'y', 'n', 'no']:
                valid_answer = True

        if answer == 'yes' or answer == 'y':
            return True
        return False

    def _delete_change_set(self) -> None:
        self.log.info(f'Deleting change set {self.change_set_name}')
        self.cfn.delete_change_set(StackName=self.stack_name,
                                   ChangeSetName=self.change_set_name)

    def _wait_for_stack_update(self):
        while True:
            stacks = self.cfn.describe_stacks(StackName=self.stack_name)
            stack = stacks['Stacks'][0]
            status = stack['StackStatus']
            if status in ['UPDATE_IN_PROGRESS', 'CREATE_IN_PROGRESS']:
                self.log.info('Waiting for stack update to finish')
                time.sleep(5)
            elif status in ['UPDATE_COMPLETE', 'CREATE_COMPLETE']:
                self.log.info('Stack updated successfully')
                return
            else:
                raise DeployError(f'Stack update failed: {json.dumps(stack, default=str)}')


def main():
    if not os.getcwd().endswith('/etchedjournal'):
        print('Must run from root directory of repository')
        sys.exit(1)

    parser = argparse.ArgumentParser(description='Deploys etched')
    parser.add_argument('flavor', type=lambda f: Flavor(f), help='flavor to deploy')
    parser.add_argument('--aws-profile', type=str, required=False, default='default',
                        help='AWS profile to use during deploy. Uses the default profile if not '
                             'supplied.')
    parser.add_argument('--aws-region', type=str, required=False, default=None,
                        help='AWS region to deploy to. Uses the default for the profile if not '
                             'supplied.')
    parser.add_argument('--no-prompt', action='store_true', default=False,
                        help='Disables prompt and apply any change sets automatically')
    args = parser.parse_args()

    session = boto3.session.Session(profile_name=args.aws_profile, region_name=args.aws_region)
    deployer = CognitoDeployer(flavor=args.flavor, session=session, no_prompt=args.no_prompt)
    try:
        deployer.deploy()
    except DeployError as de:
        print(de)
        sys.exit(1)


if __name__ == '__main__':
    main()
