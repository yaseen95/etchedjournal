import * as React from 'react';
import { ClassAttributes } from 'react';
import './App.css';
// import { EtchEncrypter } from './crypto/crypto';
// import { EtchedCryptoUtils } from './crypto/etched-crypto-utils';
import { EtchedApi } from './EtchedApi';
import { Entry } from './models/entry';
import { EntryComponent } from './components/entry/entry';

// let msg = 'The quick brown fox jumps over the lazy dog';
// let passphrase = 'Bonsoir Elliot';
// let masterKey = EtchedCryptoUtils.hashPassphrase(passphrase).hash;
// let encryptor = new EtchEncrypter(masterKey);
// let etch = encryptor.encrypt(msg);
// let decryptedEtch = encryptor.decrypt(etch);
let etchedApi = new EtchedApi();

class App extends React.Component<{}, { entries: Entry[] | null }> {
  constructor(props: ClassAttributes<{}>) {
    super(props);
    this.state = {
      entries: null
    };
  }

  render() {
    if (this.state.entries == null) {
      this.getEntries();
    }

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Etched Journal</h1>
        </header>
        {this.renderEntries()}
      </div>
    );
  }

  getEntries() {
    etchedApi.getEntries().then(entries => {
      setTimeout(function (x: React.Component) { x.setState({entries: entries}); }, 2000, this);
    });
  }

  renderEntries() {
    if (this.state.entries == null) {
      return <div><h2>No entries</h2></div>;
    }

    let renderedEntries = [];
    for (let i = 0; i < this.state.entries.length; i++) {
      let e = this.state.entries[i];
      renderedEntries.push(
        <EntryComponent entry={e}/>
      );
    }
    return <div>{renderedEntries}</div>;
  }
}

export default App;
