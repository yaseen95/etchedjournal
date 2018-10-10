import { EtchedApi } from '../../etched-api';
import { EtchEncrypter } from '../../crypto/crypto';
import * as React from 'react';
import { Entry } from '../../models/entry';
import { Link } from 'react-router-dom';
import { Etch } from '../../models/etch';

interface EntryEditorProps {
  etchedApi: EtchedApi;
  encrypter: EtchEncrypter;
  entry?: Entry;
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

const ENTRY_NOT_CREATED = 'NOT_CREATED';
const ENTRY_CREATING = 'ENTRY_CREATING';
const ENTRY_CREATED = 'ENTRY_CREATED';

const ENTRY_EDITOR_ID = 'entry-editor';

export class EntryEditor extends React.Component<EntryEditorProps, EntryEditorState> {

  /** indicates that the user pressed escape when editing the title */
  escapedEditingTitle: boolean;

  /** title that is currently being edited (but yet saved) */
  editingTitle: string;

  /** timestamp of last edit (millis since epoch) */
  recentEdit: number;

  /** entry created */
  entryCreated: boolean;

  /** etches not yet posted */
  queuedEtches: string[];

  /** the timer/interval used to post queued etches */
  queuedEtchInterval: number;

  /** the timer/interval used to etch entries due to inactivity */
  etchingInterval: number;

  /** the current state of the entry */
  entryCreationState: string;

  /** the current entry */
  entry?: Entry;

  constructor(props: EntryEditorProps) {
    super(props);

    this.state = {
      title: new Date().toString(),
      currentText: '',
      etches: [],
    };

    this.entry = this.props.entry;
    this.editingTitle = '';
    this.escapedEditingTitle = false;
    this.recentEdit = Date.now();
    this.entryCreated = false;
    this.queuedEtches = [];
    this.entryCreationState = ENTRY_NOT_CREATED;
  }

  componentDidMount() {
    this.etchingInterval = window.setInterval(() => {
      // If user hasn't made any changes in `ETCH_TIMEOUT` seconds, we update
      if (Date.now() - this.recentEdit >= ETCH_TIMEOUT && this.state.currentText !== '') {
        this.updateContent();
      }
    },                                        500);

    this.queuedEtchInterval = window.setInterval(() => {
      if (this.entryCreationState === ENTRY_CREATED) {
        this.postEtches();
      }
    },                                           10000);
  }

  componentWillUnmount() {
    console.log('Unmounting. Posting all queued etches');
    if (this.entry !== undefined) {
      // Can't be queued etches if the entry hasn't yet been created
      this.postEtches();
    }

    // clear intervals
    window.clearInterval(this.etchingInterval);
    window.clearInterval(this.queuedEtchInterval);
  }

  onEtchChange = (event: React.ChangeEvent<HTMLDivElement>) => {
    this.recentEdit = Date.now();
    this.setState({currentText: event.target.innerText});
  }

  updateContent = () => {
    console.log('Etching');
    const items = this.state.etches;
    const text = this.state.currentText;
    items.push(text);

    if (items.length > 0 && this.entryCreationState === ENTRY_NOT_CREATED) {
      this.createEntry();
    }

    this.setState({currentText: ''});
    this.queuedEtches.push(text);
    console.log(this.state);

    // This element may not exist in the case when a user navigates away from a page and the
    // component posts all queued etches during componentWillUnmount
    let contentEditorElement = document.getElementById(ENTRY_EDITOR_ID);
    if (contentEditorElement !== null) {
      contentEditorElement.textContent = '';
    }
  }

  onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // On enter update content
    if (e.keyCode === ENTER_KEY_CODE && !e.shiftKey) {
      e.preventDefault();
      this.updateContent();
    }
  }

  saveTitle = (title: string) => {
    console.log(`Saving new title '${title}'`);
    this.setState({title: title});
    let titleElement = document.getElementById('etch-title-heading')!!;
    titleElement.setAttribute('contenteditable', 'false');
    this.createEntry();
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

  createEntry() {
    if (this.entryCreationState !== ENTRY_NOT_CREATED) {
      return;
    }

    const title = this.state.title;
    console.log(`Creating entry '${title}'`);

    this.entryCreationState = ENTRY_CREATING;
    this.props.etchedApi.postEntry(title)
      .then(entry => {
        console.log(`Posted entry with id ${entry.id}`);
        this.entry = entry;
        this.entryCreationState = ENTRY_CREATED;
      });
  }

  postEtches() {
    let {etchedApi, encrypter} = this.props;

    let entry = this.entry;
    if (entry === undefined || entry === null) {
      throw new Error(`Attempted to post an etch to a non existent entry`);
    }

    let etches = this.queuedEtches.slice(0);

    if (etches.length === 0) {
      return;
    }

    let encrypting = etches.map((etch: string) => encrypter.encrypt(etch));
    Promise.all(encrypting)
      .then((encryptedEtches: Etch[]) => {
        // TODO: Handle queue getting really large e.g. 100 elements
        // Break it up against multiple requests???
        // TODO: Why do we need the !!? We've checked that it's not null or undefined earlier...
        console.log(`Posting ${encryptedEtches.length} etches`);
        return etchedApi.postEtches(entry!!.id, encryptedEtches);
      })
      .then((savedEtches: Etch[]) => {
        // Remove the posted etches from the queue
        this.queuedEtches = this.queuedEtches.slice(savedEtches.length);
        console.log(`Successfully posted ${savedEtches.length} etches`);
      });
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
                id={ENTRY_EDITOR_ID}
                className="etched-editable"
                contentEditable={true}
                data-placeholder="What's on your mind?"
                // TODO: Is it okay to use onInput?
                onInput={this.onEtchChange}
                onKeyDown={this.onKeyDown}
              />
            </form>
          </div>
          <Link to="/">
            <button className="button is-primary">
              Home
            </button>
          </Link>
        </div>
      </div>
    );
  }
}
