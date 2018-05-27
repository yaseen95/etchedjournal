import * as React from 'react';
import { FormField } from '../utils/form-field';
import { Spinner } from '../utils/spinner';
import { EtchedCryptoUtils, StretchedKey } from '../../crypto/etched-crypto';
import { EtchedUser } from '../../models/etched-user';
import { EtchedApi } from '../../etched-api';
import { EtchEncrypter } from '../../crypto/crypto';
import { Redirect } from 'react-router';

interface PassphraseProps {
  etchedApi: EtchedApi;
  setUser(user: EtchedUser): void;
  setEncrypter(encrypter: EtchEncrypter): void;
}

interface PassphraseState {
  passphrase: string;
  passphraseConfirm: string;
  submitClicked: boolean;
  formErrorMessage: string;
  generatingMasterKey: boolean;
  keyGenerated: boolean;
}

const MIN_PASSPHRASE_LENGTH = 20;
const MAX_PASSPHRASE_LENGTH = 256;  // What "an oddly specific number"

/** How long it should look like it's stretching the password */
const HASHING_STRENGTH_ILLUSION = 3000;  // DEMO purposes only!

export class ConfigurePassphrase extends React.Component<PassphraseProps, PassphraseState> {

  constructor(props: PassphraseProps) {
    super(props);

    this.state = {
      passphrase: '',
      passphraseConfirm: '',
      submitClicked: false,
      formErrorMessage: '',
      generatingMasterKey: false,
      keyGenerated: false,
    };
  }

  onPassphraseChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({passphrase: event.target.value});
  }

  onPassphraseConfirmChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({passphraseConfirm: event.target.value});
  }

  handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    this.setState({submitClicked: true});

    // TODO: Use zxcvbn to enforce decent passwords

    if (this.state.passphrase.length < MIN_PASSPHRASE_LENGTH) {
      this.setState({formErrorMessage: `Passphrase is too short. Must be more than 
      ${MIN_PASSPHRASE_LENGTH} characters.`});
    } else if (this.state.passphrase.length > MAX_PASSPHRASE_LENGTH) {
      this.setState({formErrorMessage: `Passphrase is too long. Must be less than 
      ${MAX_PASSPHRASE_LENGTH} characters.`});
    } else if (this.state.passphrase !== this.state.passphraseConfirm) {
      this.setState({formErrorMessage: `Passphrases don't match.`});
    } else {
      // Passphrase looks good.
      this.setState({formErrorMessage: ''});
      this.setState({generatingMasterKey: true});

      const startTime = Date.now();
      EtchedCryptoUtils.hashPassphrase(this.state.passphrase)
        .then((key: StretchedKey) => {

          const endTime = Date.now();

          let timeout = 0;
          if (endTime - startTime <= HASHING_STRENGTH_ILLUSION) {
            timeout = HASHING_STRENGTH_ILLUSION - (endTime - startTime);
          }

          setTimeout(() => {
            // TODO-HIGH: Don't log this
            // Obviously don't do this
            console.log(`Generated key ${key.toString()}`);
            this.setEncryptionProperties(key);
          },         timeout);
        });
    }
    // Prevent page refresh on form submit.
    event.preventDefault();
  }

  setEncryptionProperties(key: StretchedKey) {

    this.props.etchedApi.configureEncryption(key.algo, key.salt, key.iterations, key.keySize)
      .then(u => {
        this.props.setEncrypter(new EtchEncrypter(key.hash));
        this.props.setUser(u);
        this.setState({generatingMasterKey: false, keyGenerated: true});
      });
  }

  displayError = () => {
    if (!this.state.submitClicked || this.state.formErrorMessage === '') {
      return;
    }

    return (
      <p className="help">{this.state.formErrorMessage}</p>
    );
  }

  render() {
    if (this.state.generatingMasterKey) {
      return <Spinner text="Generating Encryption Key"/>;
    } else if (this.state.keyGenerated) {
      return <Redirect to="/"/>;
    }

    let error = this.displayError();
    return (
      <div className="columns is-centered">
        <div className="column is-12-mobile is-4-desktop">
          <h4>Configure Passphrase</h4>
          <form className="control" onSubmit={this.handleSubmit}>
            <FormField>
              <label>Passphrase</label>
              <input
                className="input"
                type="password"
                placeholder="Passphrase"
                name="passphrase"
                value={this.state.passphrase}
                // Have to set tabIndex otherwise tab navigation goes from this to wiki link
                tabIndex={1}
                onChange={this.onPassphraseChanged}
              />
              <p className="help">
                Etched uses a <a href="https://en.wikipedia.org/wiki/Passphrase">passphrase</a> to
                protect your data. A sequence of random words (e.g. correct horse battery staple) is
                a good idea. The longer the password the better. It must be a minimum of 20
                characters.
              </p>
            </FormField>
            <FormField>
              <label>Confirm Passphrase</label>
              <input
                className="input"
                type="password"
                placeholder="Passphrase"
                name="passphraseConfirm"
                tabIndex={2}
                value={this.state.passphraseConfirm}
                onChange={this.onPassphraseConfirmChanged}
              />
            </FormField>
            <FormField>
              {error}
              <button className="button is-primary" tabIndex={3}>Submit</button>
            </FormField>
          </form>
        </div>
      </div>
    );
  }
}
