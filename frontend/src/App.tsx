import * as React from 'react';
import { ClassAttributes } from 'react';
import './App.css';
import { EtchEncrypter } from './crypto/crypto';
import { EtchedCryptoUtils } from './crypto/etched-crypto-utils';
import { EtchedApi } from './etched-api';
import { Entry } from './models/entry';
import { EntryComponent } from './components/entry/entry';
import { RegisterComponent } from './components/register/register';

let etchedApi = new EtchedApi();

interface AppState {
  entries: Entry[] | null;
  fetchedData: boolean;
  encrypter: EtchEncrypter | null;
  etchedApi: EtchedApi;
}

class App extends React.Component<{}, AppState> {
  constructor(props: ClassAttributes<{}>) {
    super(props);
    this.state = {
      entries: null,
      fetchedData: false,
      encrypter: null,
      etchedApi: new EtchedApi()
    };
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Etched Journal</h1>
        </header>
        <section className="section">
          <div className="container">
            {this.renderEntries()}
            <RegisterComponent etchedApi={this.state.etchedApi}/>
          </div>
        </section>
      </div>
    );
  }

  componentDidMount() {
    if (!this.state.fetchedData) {
      this.getEntries();
    }
  }

  getEntries() {
    let msg = 'The quick brown fox jumps over the lazy dog';
    let passphrase = 'Bonsoir Elliot';
    let masterKey = EtchedCryptoUtils.hashPassphrase(passphrase).hash;
    let encrypter = new EtchEncrypter(masterKey);
    let etch = encrypter.encrypt(msg);

    this.setState({encrypter: encrypter});
    etchedApi.postEtch(1, etch);

    etchedApi.getEntries()
      .then(entries => {
        setTimeout(component => { component.setState({entries: entries}); }, 2000, this);
        this.setState({fetchedData: true});
      });
  }

  renderEntries() {
    let renderedEntries = [];

    if (this.state.entries == null || this.state.encrypter == null) {
      renderedEntries.push(<h2>No entries</h2>);
    } else {
      for (let i = 0; i < this.state.entries.length; i++) {
        let e = this.state.entries[i];
        renderedEntries.push(
          <EntryComponent key={e.id} entry={e} encrypter={this.state.encrypter} api={this.state.etchedApi}/>
        );
      }
    }
    return (
      <div className="columns">
        <div className="column is-12">{renderedEntries}</div>
      </div>
    );
  }
}

export default App;
