import * as React from 'react';
import { FormField } from '../utils/form-field';
import { Spinner } from '../utils/spinner';
import { EtchedCryptoUtils, StretchedKey } from '../../crypto/etched-crypto';
import { EtchEncrypter } from '../../crypto/crypto';
import { Redirect } from 'react-router';
import { EtchedUser } from '../../models/etched-user';
import { PassphraseHashProperties } from '../../crypto/etched-crypto';

interface PassphraseProps {
  user: EtchedUser;
  setEncrypter(encrypter: EtchEncrypter): void;
}

interface PassphraseState {
  passphrase: string;
  submitClicked: boolean;
  formErrorMessage: string;
  generatingMasterKey: boolean;
  keyGenerated: boolean;
  keyState?: string;
}

const MIN_PASSPHRASE_LENGTH = 20;
const MAX_PASSPHRASE_LENGTH = 256;  // What "an oddly specific number"

const KEY_STATE_VALID = 'VALID';
// const KEY_STATE_INVALID = 'INVALID';

/** How long it should look like it's stretching the password */
const HASHING_STRENGTH_ILLUSION = 3000;  // DEMO purposes only!

export class EnterPassphrase extends React.Component<PassphraseProps, PassphraseState> {

  constructor(props: PassphraseProps) {
    super(props);

    this.state = {
      passphrase: '',
      submitClicked: false,
      formErrorMessage: '',
      generatingMasterKey: false,
      keyGenerated: false,
    };

    if (!this.props.user.encryptionConfigured()) {
      throw Error(`Encryption is not configured for ${this.props.user.id}`);
    }
  }

  onPassphraseChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({passphrase: event.target.value});
  }

  handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    this.setState({submitClicked: true});

    if (this.state.passphrase.length < MIN_PASSPHRASE_LENGTH) {
      this.setState({formErrorMessage: `Passphrase is too short. Must be more than 
      ${MIN_PASSPHRASE_LENGTH} characters.`});
    } else if (this.state.passphrase.length > MAX_PASSPHRASE_LENGTH) {
      this.setState({formErrorMessage: `Passphrase is too long. Must be less than 
      ${MAX_PASSPHRASE_LENGTH} characters.`});
    } else {
      // Passphrase looks good.
      this.setState({formErrorMessage: '', generatingMasterKey: true});

      let user = this.props.user;
      let passphrase = this.state.passphrase;

      let properties: PassphraseHashProperties = {
        algo: user.algo!!,
        iterations: user.iterations!!,
        keySize: user.keySize!!,
        stretcherAlgo: 'sha-1',
      };

      const startTime = Date.now();
      EtchedCryptoUtils.hashPassphrase(passphrase, user.salt!!, properties)
        .then((key: StretchedKey) => {
          const endTime = Date.now();

          let timeout = 0;
          if (endTime - startTime <= HASHING_STRENGTH_ILLUSION) {
            timeout = HASHING_STRENGTH_ILLUSION - (endTime - startTime);
          }

          // TODO: We assume passphrase is valid... Need to actually compare it to something.

          setTimeout(() => {
            this.props.setEncrypter(new EtchEncrypter(key.hash));
            this.setState({
              keyGenerated: true,
              keyState: KEY_STATE_VALID,
              generatingMasterKey: false,
            });
          },         timeout);
        });
    }
    // Prevent page refresh on form submit.
    event.preventDefault();
  }

  displayError = () => {
    if (!this.state.submitClicked || this.state.formErrorMessage === '') {
      return;
    }

    return (
      <p className="help is-danger">{this.state.formErrorMessage}</p>
    );
  }

  render() {
    if (this.state.generatingMasterKey) {
      return <Spinner text="Generating Encryption Key"/>;
    } else if (this.state.keyGenerated && this.state.keyState === KEY_STATE_VALID) {
      return <Redirect to="/"/>;
    }

    let error = this.displayError();
    return (
      <div className="columns is-centered">
        <div className="column is-12-mobile is-4-desktop">
          <h4>Enter Passphrase</h4>
          <form className="control" onSubmit={this.handleSubmit}>
            <FormField>
              <label>Passphrase</label>
              <input
                className="input"
                type="password"
                placeholder="Passphrase"
                name="passphrase"
                value={this.state.passphrase}
                onChange={this.onPassphraseChanged}
              />
            </FormField>
            <FormField>
              {error}
            </FormField>
            <FormField>
              <button className="button is-primary">Submit</button>
            </FormField>
          </form>
        </div>
      </div>
    );
  }
}
