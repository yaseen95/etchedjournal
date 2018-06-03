import { EtchedApi } from '../../etched-api';
import { EtchEncrypter } from '../../crypto/crypto';
import * as React from 'react';

interface EntryEditorProps {
  etchedApi: EtchedApi;
  encrypter: EtchEncrypter;
  entryId?: number;
}

interface EntryEditorState {
  /** indicates whether a request is in flight */
  title: string;
  /** current etch contents */
  currentText: string;
  /** list of etches */
  etches: string[];
}

/** Amount of elapsed inactivity before etch is saved */
const ETCH_TIMEOUT = 5 * 1000;

const ESC_KEY_CODE = 27;
const ENTER_KEY_CODE = 13;

export class EntryEditor extends React.Component<EntryEditorProps, EntryEditorState> {

  /** indicates that the user pressed escape when editing the title */
  escapedEditingTitle: boolean;

  /** title that is currently being edited (but yet saved) */
  editingTitle: string;

  /** timestamp of last edit (millis since epoch) */
  recentEdit: number;

  onEtchChange = (event: React.ChangeEvent<HTMLDivElement>) => {
    this.recentEdit = Date.now();
    this.setState({currentText: event.target.innerText});
  }

  updateContent = () => {
    console.log('Etching');
    const items = this.state.etches;
    const text = this.state.currentText;
    items.push(text);

    this.setState({currentText: ''});
    console.log(this.state);

    // Empty contents of input
    document.getElementById('content-editor')!!.innerText = '';
  }

  onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // On enter update content
    if (e.keyCode === ENTER_KEY_CODE && e.shiftKey === false) {
      e.preventDefault();
      this.updateContent();
    }
  }

  constructor(props: EntryEditorProps) {
    super(props);

    this.state = {
      title: new Date().toString(),
      currentText: '',
      etches: [],
    };

    this.editingTitle = '';
    this.escapedEditingTitle = false;
    this.recentEdit = Date.now();

    setInterval(() => {
      // If user hasn't made any changes in `ETCH_TIMEOUT` seconds, we update
      if (Date.now() - this.recentEdit >= ETCH_TIMEOUT && this.state.currentText !== '') {
        this.updateContent();
      }
    },          500);  // this number is how often we check
  }

  saveTitle = (title: string) => {
    console.log(`Saving new title '${title}'`);
    this.setState({title: title});
    let titleElement = document.getElementById('etch-title-heading')!!;
    titleElement.setAttribute('contenteditable', 'false');
  }

  resetTitle = () => {
    let titleElement = document.getElementById('etch-title-heading')!!;
    // Reset title to saved title
    // We have to manually edit this...
    titleElement.textContent = this.state.title;
    this.escapedEditingTitle = false;
  }

  renderTitle() {

    return (
      <h4
        className="etched-editable"
        id="etch-title-heading"
        data-placeholder="Title"
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          let titleElement = document.getElementById('etch-title-heading')!!;

          // If escape is pressed, cancel title editing and revert to old title
          if (e.keyCode === ESC_KEY_CODE) {
            this.escapedEditingTitle = true;
            // Set contentenabled=false, so that we exit the edit mode
            titleElement.setAttribute('contenteditable', 'false');
          } else if (e.keyCode === ENTER_KEY_CODE) {
            titleElement.blur();
          }
        }}
        onClick={() => {
          // Enable content editable on click
          let titleElement = document.getElementById('etch-title-heading')!!;
          titleElement.setAttribute('contenteditable', 'true');
          // Need to set focus, otherwise another click is required to enter edit mode
          titleElement.focus();
        }}

        onBlur={(e) => {
          let title = e.currentTarget.textContent!!;
          // If we pressed escape or title is empty, don't save
          if (this.escapedEditingTitle || title === null || title.trim() === '') {
            this.resetTitle();
          } else {
            this.saveTitle(e.currentTarget.innerText);
          }
        }}
      >
        {this.state.title}
      </h4>
    );
  }

  render() {
    const title = this.renderTitle();

    let renderedEtches = null;
    if (this.state.etches.length > 0) {
      let listItems: JSX.Element[] = [];

      this.state.etches.forEach((etch: string, index: number) => {
        listItems.push(<li key={index}>{etch}</li>);
      });

      renderedEtches = <ul>{listItems}</ul>;
    }

    return (
      <div className="columns is-centered">
        <div className="column is-12-mobile is-8-tablet is-8-desktop">
          <div className="columns has-text-left">
            {title}
          </div>
          <div className="columns has-text-left">
            {renderedEtches}
          </div>
          <div className="columns has-text-left">
            <form className="full-width" onSubmit={this.updateContent}>
              <div
                id="content-editor"
                className="etched-editable"
                contentEditable={true}
                data-placeholder="What's on your mind?"
                // TODO: Is it okay to use onInput?
                onInput={this.onEtchChange}
                onKeyDown={this.onKeyDown}
              />
            </form>
          </div>
        </div>
      </div>
    );
  }
}
