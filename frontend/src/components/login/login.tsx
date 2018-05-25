import * as React from 'react';
import { ChangeEvent } from 'react';
import { EtchedApi } from '../../etched-api';
import { EtchedUser } from '../../models/etched-user';
import { FormField } from '../utils/form-field';
import { Spinner } from '../utils/spinner';

interface LoginProps {
  etchedApi: EtchedApi;

  setUser(user: EtchedUser): void;
}

interface LoginState {
  username: string;
  password: string;
  loggingIn: boolean;
}

export class Login extends React.Component<LoginProps, LoginState> {

  handleSubmit = (event: React.SyntheticEvent<EventTarget>) => {
    event.preventDefault();
    this.setState({loggingIn: true});
    console.log(`Logging in User[username='${this.state.username}']`);

    this.props.etchedApi.login(this.state.username, this.state.password)
      .then(() => {
        // After login, get the user details
        return this.props.etchedApi.self();
      })
      .then(user => {
        // TODO: reevaluate auth API
        // We have to send another request. Is this a problem with our API?
        this.setState({loggingIn: false});
        this.props.setUser(user);
      })
      .catch(e => console.error(e));
  }

  onUsernameChanged = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({username: event.target.value});
  }

  onPasswordChanged = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({password: event.target.value});
  }

  constructor(props: LoginProps) {
    super(props);
    this.state = {
      username: '',
      password: '',
      loggingIn: false,
    };
  }

  render() {
    if (this.state.loggingIn) {
      return <Spinner text="Logging in"/>;
    }

    return (
      <div className="columns is-centered">
        <div className="column is-12-mobile is-4-desktop">
          <h3>Login</h3>
          <form className="control" onSubmit={this.handleSubmit}>
            <FormField>
              <label className="label">Username</label>
              <input
                className="input"
                type="text"
                placeholder="Username"
                name="username"
                value={this.state.username}
                onChange={this.onUsernameChanged}
              />
            </FormField>
            <FormField>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="Password"
                name="password"
                value={this.state.password}
                onChange={this.onPasswordChanged}
              />
            </FormField>
            <FormField>
              <button className="button is-primary">Login</button>
            </FormField>
          </form>
        </div>
      </div>
    );
  }
}
