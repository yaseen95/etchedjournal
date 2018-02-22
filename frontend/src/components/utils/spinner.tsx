import * as React from 'react';
import './spinner.css';

interface SpinnerProps {
  text: string | null;
}

/**
 * Spinner created by Tobias Ahlin. Licensed under MIT license.
 *
 * https://github.com/tobiasahlin/SpinKit
 */
export class Spinner extends React.Component<SpinnerProps, {}> {

  constructor(props: SpinnerProps) {
    super(props);
  }

  render() {
    let text = null;
    if (this.props.text !== null) {
      text = (<h6>{this.props.text}</h6>);
    }
    return (
      <div>
        <div className="spinner">
          <div className="double-bounce1"/>
          <div className="double-bounce2"/>
        </div>
        {text}
      </div>
    );
  }
}
