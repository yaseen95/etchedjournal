import * as React from 'react';
import { ChangeEvent } from 'react';
import { EtchedApi } from '../../etched-api';
import { Jwt } from '../../models/jwt';

interface RegisterState {
  username: string;
  email: string;
  password: string;
  jwt: Jwt | null;
}

interface RegisterProps {
  etchedApi: EtchedApi;
}

export class RegisterComponent extends React.Component<RegisterProps, RegisterState> {

  constructor(props: RegisterProps) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      jwt: null,
    };
  }

  handleSubmit = (event: React.SyntheticEvent<EventTarget>) => {
    event.preventDefault();
    console.log(`Registering User[username='${this.state.username}']`);
    this.props.etchedApi.register(this.state.username, this.state.email, this.state.password)
      .then((jwt: Jwt) => {
        setTimeout((c: RegisterComponent) => { c.setState({jwt: jwt}); }, 2000, this);
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
    if (this.state.jwt !== null) {
      jwtDisplay = <h5>Jwt is {this.state.jwt.token}</h5>;
    }
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
