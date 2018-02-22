import * as React from 'react';
import { FormField } from '../utils/form-field';
import { Spinner } from '../utils/spinner';
import { StretchedKey } from '../../crypto/etched-crypto';
import * as PassphraseHasher from 'worker-loader!./worker';

interface PassphraseState {
  passphrase: string;
  passphraseConfirm: string;
  submitClicked: boolean;
  formErrorMessage: string;
  generatingMasterKey: boolean;
  hasher: Worker;
}

const MIN_PASSPHRASE_LENGTH = 20;
const MAX_PASSPHRASE_LENGTH = 256;  // What "an oddly specific number"

export class ConfigurePassphrase extends React.Component<{}, PassphraseState> {

  constructor(props: {}) {
    super(props);

    let worker = new PassphraseHasher();
    worker.onmessage = (message: StretchedKey) => {
      this.onPassphraseHashed(message);
    };

    this.state = {
      passphrase: '',
      passphraseConfirm: '',
      submitClicked: false,
      formErrorMessage: '',
      generatingMasterKey: false,
      hasher: worker,
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
    if (this.state.passphrase.length < MIN_PASSPHRASE_LENGTH) {
      this.setState({formErrorMessage: `Passphrase is too short. Must be more than 
      ${MIN_PASSPHRASE_LENGTH} characters.`});
    } else if (this.state.passphrase.length > MAX_PASSPHRASE_LENGTH) {
      this.setState({formErrorMessage: `Passphrase is too long. Must be less than 
      ${MAX_PASSPHRASE_LENGTH} characters.`});
    } else if (this.state.passphrase !== this.state.passphraseConfirm) {
      this.setState({formErrorMessage: `Passphrases don't match.`});
    } else {
      // Password looks good.
      this.setState({formErrorMessage: ''});
      this.setState({generatingMasterKey: true});
      this.state.hasher.postMessage(this.state.passphrase);
    }
    // Prevent page refresh on form submit.
    event.preventDefault();
  }

  onPassphraseHashed(stretchedKey: StretchedKey) {
    console.log(`Generated key ${stretchedKey.toString()}`);
    this.setState({generatingMasterKey: false});
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
      return (
        <div className="columns is-centered">
          <div className="column is-12-mobile is-4-desktop">
            <Spinner text="Generating Encryption Key"/>
          </div>
        </div>
      );
    }

    let error = this.displayError();
    return (
      <div className="columns is-centered">
        <div className="column is-12-mobile is-4-desktop">
          <h4>Configure Passphrase</h4>
          <form
            className="control"
            onSubmit={this.handleSubmit}
          >
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
