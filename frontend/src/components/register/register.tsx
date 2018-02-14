import * as React from 'react';
import { ChangeEvent } from 'react';
import { EtchedApi } from '../../etched-api';
import { EtchedUser } from '../../models/etched-user';

interface RegisterState {
  username: string;
  email: string;
  password: string;
}

interface RegisterProps {
  etchedApi: EtchedApi;
  setUser(user: EtchedUser): void;
}

export class RegisterComponent extends React.Component<RegisterProps, RegisterState> {

  constructor(props: RegisterProps) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
    };
  }

  handleSubmit = (event: React.SyntheticEvent<EventTarget>) => {
    event.preventDefault();
    console.log(`Registering User[username='${this.state.username}']`);
    this.props.etchedApi.register(this.state.username, this.state.email, this.state.password)
      .then((user: EtchedUser) => {
        this.props.setUser(user);
      });
  }

  onUsernameChanged = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({username: event.target.value});
  }

  onPasswordChanged = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({password: event.target.value});
  }

  onEmailChanged = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({email: event.target.value});
  }

  render() {
    let jwtDisplay = null;
    return (
      <div className="columns is-centered">
        <div className="column is-12-mobile is-4-desktop">
          <h3>Register</h3>
          <form className="control" onSubmit={this.handleSubmit}>
            <div className="field">
              <div className="control">
                <label className="label">Username</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Username"
                  name="username"
                  value={this.state.username}
                  onChange={this.onUsernameChanged}
                />
              </div>
            </div>
            <div className="field">
              <div className="control">
                <label className="label">Email</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Email"
                  value={this.state.email}
                  onChange={this.onEmailChanged}
                />
              </div>
            </div>
            <div className="field">
              <div className="control">
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={this.state.password}
                  onChange={this.onPasswordChanged}
                />
              </div>
            </div>
            <div className="field">
              <div className="control">
                <button className="button is-primary">Submit</button>
              </div>
            </div>
          </form>
          {jwtDisplay}
        </div>
      </div>
    );
  }
}
