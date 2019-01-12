import unittest
from unittest import mock

from botocore.exceptions import ClientError

from deploy.deployer import CognitoDeployer, Flavor


class DeployerTestCase(unittest.TestCase):
    deployer: CognitoDeployer
    mock_session: object
    mock_cfn: object

    def setUp(self):
        self.mock_cfn = mock.Mock()

        self.mock_session = mock.Mock()
        self.mock_session.client = mock.Mock(return_value=self.mock_cfn)

        self.deployer = CognitoDeployer(flavor=Flavor.DEV, session=self.mock_session,
                                        no_prompt=True)

    def test_stack_exists_true(self):
        self.mock_cfn.describe_stacks = mock.Mock(return_value={'Stacks': ['foo']})
        result = self.deployer._check_stack_exists()
        self.assertTrue(result)
        self.mock_cfn.describe_stacks.assert_called_with(StackName=self.deployer.stack_name)

    def test_stack_exists_false_when_no_stack_exists(self):
        # If a stack doesn't exist, it throws a client error
        self.mock_cfn.describe_stacks = mock.Mock(side_effect=ClientError({}, None))
        result = self.deployer._check_stack_exists()
        self.assertFalse(result)
        self.mock_cfn.describe_stacks.assert_called_with(StackName=self.deployer.stack_name)

    # TODO: Add more tests
