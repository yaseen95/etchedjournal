import * as React from 'react';
import './App.css';
import { EtchEncrypter } from './crypto/crypto';
import { EtchedApi } from './etched-api';
import { Register } from './components/register/register';
import { EtchedUser } from './models/etched-user';
import { Login } from './components/login/login';
import { Redirect, Route, Switch } from 'react-router';
import { Home } from './components/containers/home';
import { ConfigurePassphrase } from './components/configure-passphrase/configure-passphrase';

interface AppState {
  etchedApi: EtchedApi;

  // TODO: This is initialised later
  encrypter?: EtchEncrypter;
  user?: EtchedUser;
}

class App extends React.Component<{}, AppState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      etchedApi: new EtchedApi()
    };
  }

  setUser = (user: EtchedUser) => {
    console.log(`Setting user ${user.username}`);
    this.setState({user: user});
  }

  setEncrypter = (encrypter: EtchEncrypter) => {
    console.log('Setting encrypter');
    this.setState({encrypter: encrypter});
  }

  render() {
    const {etchedApi, encrypter, user} = this.state;
    const setUser = this.setUser;
    const setEncrypter = this.setEncrypter;
    const loggedIn = user !== undefined;
    const encryptionConfigured = user !== undefined && user.encryptionConfigured();

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Etched Journal</h1>
        </header>
        <section className="section">
          <div className="container">
            <Switch>
              /* root '/' route */
              <Route
                exact={true}
                path="/"
                render={() => {
                  if (loggedIn) {
                    if (encryptionConfigured) {
                      return <Home etchedApi={etchedApi} encrypter={encrypter!!}/>;
                    } else {
                      return <Redirect to="/configure-passphrase"/>;
                    }
                  } else {
                    return <Redirect to="/login"/>;
                  }
                }}
              />

              /* Auth routes */
              <Route
                path="/login"
                render={() => <Login etchedApi={etchedApi} setUser={setUser}/>}
              />
              <Route
                path="/register"
                render={() => <Register etchedApi={etchedApi} setUser={setUser}/>}
              />
              <Route
                path="/configure-passphrase"
                render={() => <ConfigurePassphrase
                  setUser={setUser}
                  setEncrypter={setEncrypter}
                  etchedApi={etchedApi}
                />}
              />
            </Switch>
          </div>
        </section>
      </div>
    );
  }
}

export default App;
