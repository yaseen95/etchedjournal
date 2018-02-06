import * as React from 'react';
import { Entry } from '../../models/entry';

export class EntryComponent extends React.Component<{ entry: Entry }, {}> {

  constructor(props: { entry: Entry }) {
    super(props);
    this.state = {};
  }

  renderEtches() {
    return (<p>TODO</p>);
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
