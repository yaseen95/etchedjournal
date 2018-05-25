import * as React from 'react';
import { ClassAttributes } from 'react';
import './App.css';
import { EtchEncrypter } from './crypto/crypto';
import { EtchedApi } from './etched-api';
import { Entry } from './models/entry';
import { EntryComponent } from './components/entry/entry';
import { RegisterComponent } from './components/register/register';
import { EtchedUser } from './models/etched-user';
import { ConfigurePassphrase } from './components/configure-passphrase/configure-passphrase';
import { StretchedKey } from './crypto/etched-crypto';
import { Login } from './components/login/login';

interface AppState {
  entries: Entry[] | null;
  fetchedData: boolean;
  encrypter: EtchEncrypter | null;
  etchedApi: EtchedApi;
  user: EtchedUser | null;
}

class App extends React.Component<{}, AppState> {
  constructor(props: ClassAttributes<{}>) {
    super(props);
    this.state = {
      entries: null,
      fetchedData: false,
      encrypter: null,
      etchedApi: new EtchedApi(),
      user: null,
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
            {this.renderAuthPrompt()}
            <ConfigurePassphrase/>
          </div>
        </section>
      </div>
    );
  }

  getEntries() {
    // let passphrase = 'Bonsoir Elliot';

    let stretchedKey = new StretchedKey(
      'PBKDF2',
      'sha-1',
      'd14c66711c7fbfb70290a73d40941a88b83f175e',
      256,
      100000,
      '0e912f3a00c176d2d9cc9b47879c8ee3b1330e7b6738fdd5c1580f2e60c3eb46'
    );

    // EtchedCryptoUtils.verifyPassphrase('Bonsoir Elliot', stretchedKey)
    //   .then((matches: boolean) => {
    //     if (matches) {
    //       console.log('Passphrase matches');
    //     } else {
    //       console.log(`Passphrase doesn't match`);
    //     }
    //   });

    let encrypter = new EtchEncrypter(stretchedKey.hash);
    this.setState({encrypter: encrypter});

    // encrypter.encrypt('Message number 4')
    //   .then((etch) => {
    //     console.log(JSON.stringify(etch));
    //     console.log(`Etch encrypted`);
    //     etchedApi.postEtch(1, etch)
    //       .then((_) => {
    //         console.log(`Etch successfully posted to server`);
    //       });
    //   });

    this.state.etchedApi.getEntries()
      .then(entries => {
        setTimeout(component => {
          component.setState({entries: entries});
        },         2000, this);
        this.setState({fetchedData: true});
      });
  }

  renderEntries() {
    let renderedEntries = [];

    if (this.state.entries == null || this.state.encrypter == null) {
      // React complains about key not existing.
      renderedEntries.push(<h2 key={1}>No entries</h2>);
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

  renderAuthPrompt() {
    if (this.state.user === null) {
      return (
        <React.Fragment>
          <RegisterComponent etchedApi={this.state.etchedApi} setUser={this.setUser}/>
          <Login etchedApi={this.state.etchedApi} setUser={this.setUser}/>
        </React.Fragment>
      );
    }
    return (
      <div>
        <h4>Hi {this.state.user.username}</h4>
        <p>Email is <i>{this.state.user.email}</i></p>
        <p>User id is <i>{this.state.user.id}</i></p>
        <p>Admin <i>{this.state.user.admin.toString()}</i></p>
      </div>
    );
  }

  setUser = (user: EtchedUser) => {
    console.log(`Setting user ${user.username}`);
    this.setState({user: user});
    this.getEntries();
  }
}

export default App;
