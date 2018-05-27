import * as React from 'react';
import { ChangeEvent } from 'react';
import { EtchedApi } from '../../etched-api';
import { EtchedUser } from '../../models/etched-user';
import { FormField } from '../utils/form-field';
import { Link } from 'react-router-dom';
import { Spinner } from '../utils/spinner';
import { Redirect } from 'react-router';

interface RegisterState {
  username: string;
  email: string;
  password: string;
  registering: boolean;
  registered: boolean;
}

interface RegisterProps {
  etchedApi: EtchedApi;

  setUser(user: EtchedUser): void;
}

export class Register extends React.Component<RegisterProps, RegisterState> {

  constructor(props: RegisterProps) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      registered: false,
      registering: false,
    };
  }

  handleSubmit = (event: React.SyntheticEvent<EventTarget>) => {
    event.preventDefault();
    this.setState({registering: true});

    const {username, password, email} = this.state;
    console.log(`Registering User[username='${username}']`);

    this.props.etchedApi.register(username, email, password)
      .then((user: EtchedUser) => {
        // TODO: Should user perform login or should we just handle it in code?
        // Have to perform a login after registering
        console.log(`Getting auth tokens for ${user.username}`);
        this.props.etchedApi.login(username, password)
          .then(() => {
            this.setState({registering: false, registered: true});
            this.props.setUser(user);
          });
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

    if (this.state.registering) {
      return <Spinner text="Creating account"/>;
    } else if (this.state.registered) {
      return <Redirect to="/configure-passphrase"/>;
    }
    return (
      <div className="columns is-centered">
        <div className="column is-12-mobile is-4-desktop">
          <h3>Register</h3>
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
              <label className="label">Email</label>
              <input
                className="input"
                type="text"
                placeholder="Email"
                value={this.state.email}
                onChange={this.onEmailChanged}
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
                <button className="button is-primary">Submit</button>
            </FormField>
            <div style={{'paddingTop': '10px'}}>
              Already have an account? <Link to="/login">Log in here</Link>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
