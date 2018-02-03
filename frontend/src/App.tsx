import * as React from 'react';
import './App.css';
import { EtchEncrypter } from './crypto/crypto';
import { EtchedCryptoUtils } from './crypto/etched-crypto-utils';

const logo = require('./logo.svg');

let msg = 'The quick brown fox jumps over the lazy dog';

let passphrase = 'Bonsoir Elliot';
let masterKey = EtchedCryptoUtils.hashPassphrase(passphrase).hash;

let encryptor = new EtchEncrypter(masterKey);
let etch = encryptor.encrypt(msg);
let decryptedEtch = encryptor.decrypt(etch);

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
        <p>Payload is <i>{msg}</i></p>
        <p>Encrypted ciphertext is {etch.content}</p>
        <p>Decrypted is <i>{decryptedEtch.content}</i></p>
      </div>
    );
  }
}

export default App;
