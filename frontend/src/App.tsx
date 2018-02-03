import * as React from 'react';
import './App.css';
import { EtchedCryptoUtils } from './crypto/crypto';
import EncryptWrapper = EtchedCryptoUtils.EncryptWrapper;

const logo = require('./logo.svg');

let payload = 'The quick brown fox jumps over the lazy dog';
let encrypted: EncryptWrapper = EtchedCryptoUtils.encrypt(payload);
let decrypted = EtchedCryptoUtils.decrypt(encrypted);

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Tomato Soup</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <p>Payload is <i>{payload}</i></p>
        <p>Encrypted ciphertext is {encrypted.ciphertext}</p>
        <p>iv is {encrypted.iv}</p>
        <p>key is {encrypted.key}</p>
        <p>Decrypted is <i>{decrypted}</i></p>
      </div>
    );
  }
}

export default App;
