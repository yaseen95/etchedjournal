import * as React from 'react';
import { Entry } from '../../models/entry';
import { EtchedApi } from '../../etched-api';
import { EtchEncrypter } from '../../crypto/crypto';

interface EntryProps {
  entry: Entry;
  api: EtchedApi;
  encrypter: EtchEncrypter;
}

export class EntryComponent extends React.Component<EntryProps, {}> {

  constructor(props: EntryProps) {
    super(props);
    this.state = {};
  }

  renderEtches() {
    let renderedEtches = [];
    for (let i = 0; i < this.props.entry.etches.length; i++) {
      let etch = this.props.entry.etches[i];
      renderedEtches.push(
        <p key={etch.id}>{this.props.encrypter.decrypt(etch).content}</p>
      );
    }
    return renderedEtches;
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
