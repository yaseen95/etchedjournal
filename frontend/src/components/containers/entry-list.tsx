import { EtchedApi } from '../../etched-api';
import * as React from 'react';
import { Entry } from '../../models/entry';
import { Spinner } from '../utils/spinner';
import { EntryComponent } from '../entry/entry';
import { EtchEncrypter } from '../../crypto/crypto';
import { Redirect } from 'react-router';

interface EntryListProps {
  etchedApi: EtchedApi;
  encrypter: EtchEncrypter;
}

interface EntryListState {
  entries: Entry[];
  fetched: boolean;
  fetching: boolean;
  redirect?: string;
}

export class EntryList extends React.Component<EntryListProps, EntryListState> {
  constructor(props: EntryListProps) {
    super(props);
    this.state = {
      entries: [],
      fetched: false,
      fetching: false,
    };
  }

  componentDidMount() {
    this.setState({fetching: true});
    const etchedApi = this.props.etchedApi;
    etchedApi.getEntries()
      .then(entries => {
        console.log(`Fetched ${entries.length} entries`);
        this.setState({entries: entries, fetching: false, fetched: true});
      });
  }

  onStartNewEntryClicked = (event: React.SyntheticEvent<EventTarget>) => {
    this.setState({redirect: '/entries/new'});
  }

  renderEntry(e: Entry, index: number) {
    const {encrypter, etchedApi} = this.props;
    return <EntryComponent key={e.id} entry={e} encrypter={encrypter} api={etchedApi}/>;
  }

  render() {
    const {entries, fetching} = this.state;
    if (fetching) {
      return <Spinner text="Getting entries"/>;
    }

    let renderedEntries = entries.length > 0 ? entries.map(this.renderEntry) : <h3>No entries</h3>;

    if (this.state.redirect !== undefined) {
      return <Redirect to="/entries/new"/>;
    }

    return (
      <div className="columns is-centered">
        <div className="column is-12-mobile is-8-desktop">
          {renderedEntries}
          <button className="button is-primary" onClick={this.onStartNewEntryClicked}>
            <span className="icon">
              <i className="fa fa-fw fa-plus"/>
            </span>
            <span>Start a new entry</span>
          </button>
        </div>
      </div>
    );
  }
}
