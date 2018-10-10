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
      decryptedEtches: [],
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

    this.props.api.getEtches(this.props.entry.id)
      .then(encryptedEtches => {
        let decryptionPromises: Promise<Etch>[] = [];
        encryptedEtches.forEach((encryptedEtch: Etch) => {
          decryptionPromises.push(this.props.encrypter.decrypt(encryptedEtch));
        });

        Promise.all(decryptionPromises)
          .then((decryptedEtches: Etch[]) => {
            this.setState({decryptedEtches: decryptedEtches, decrypting: false});
          });
      });
  }

  render() {
    return (
      <div className="has-text-left entry">
        <h4>{this.props.entry.title}</h4>
        <h5>{this.props.entry.created.toString()}</h5>
        {this.renderEtches()}
      </div>
    );
  }
}
