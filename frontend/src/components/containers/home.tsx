import { EtchedApi } from '../../etched-api';
import * as React from 'react';
import { EtchEncrypter } from '../../crypto/crypto';
import { EntryList } from './entry-list';

interface HomeProps {
  etchedApi: EtchedApi;
  encrypter: EtchEncrypter;
}

export class Home extends React.Component<HomeProps, {}> {

  constructor(props: HomeProps) {
    super(props);
  }

  render() {
    return <EntryList encrypter={this.props.encrypter} etchedApi={this.props.etchedApi}/>;
  }

}
