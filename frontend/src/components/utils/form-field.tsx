import * as React from 'react';

/**
 * Util to surround a form input with divs to correctly style the element.
 */
export class FormField extends React.Component<{}, {}> {

  render() {
    return (
      <div className="field">
        <div className="control">
          {this.props.children}
        </div>
      </div>
    );
  }
}