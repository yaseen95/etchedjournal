import * as React from 'react';
import { Entry } from '../../models/entry';
import { EtchedApi } from '../../etched-api';
import { EtchEncrypter } from '../../crypto/crypto';
import { Etch } from '../../models/etch';
import { Spinner } from '../utils/spinner';

interface EntryProps {
  entry: Entry;
  api: EtchedApi;
  encrypter: EtchEncrypter;
}

interface EntryState {
  decryptedEtches: Etch[];
  decrypting: boolean;
}

export class EntryComponent extends React.Component<EntryProps, EntryState> {

  constructor(props: EntryProps) {
    super(props);
    this.state = {
      decryptedEtches: new Array(this.props.entry.etches.length),
      decrypting: true,
    };
  }

  renderEtches() {
    if (this.state.decrypting) {
      return <Spinner text="Decrypting etches"/>;
    }

    let renderedEtches = [];
    for (let i = 0; i < this.state.decryptedEtches.length; i++) {
      let etch = this.state.decryptedEtches[i];
      renderedEtches.push(
        <p key={etch.id}>{etch.content}</p>
      );
    }
    return renderedEtches;
  }

  componentDidMount() {

    let decryptionPromises: PromiseLike<Etch>[] = [];
    this.props.entry.etches.forEach((value: Etch) => {
      decryptionPromises.push(this.props.encrypter.decrypt(value));
    });

    Promise.all(decryptionPromises)
      .then((decryptedEtches: Etch[]) => {
        this.setState({decryptedEtches: decryptedEtches, decrypting: false});
      });
  }

  render() {
    return (
      <div>
        <h1>{this.props.entry.title}</h1>
        <h3>{this.props.entry.created.toString()}</h3>
        {this.renderEtches()}
      </div>
    );
  }
}
