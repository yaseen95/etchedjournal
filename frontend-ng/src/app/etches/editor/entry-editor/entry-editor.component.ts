import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    Renderer2,
    ViewChild
} from '@angular/core';
import { interval, Observable, Subscription } from 'rxjs';

const DEFAULT_ETCH_TIMEOUT = 5 * 1000;
const ENTER_KEY = 'Enter';
/** millis interval to check if etch is inactive */
const DEFAULT_ETCHING_INTERVAL = 250;

@Component({
    selector: 'app-editor',
    templateUrl: './entry-editor.component.html',
    styleUrls: ['./entry-editor.component.css']
})
export class EntryEditorComponent implements OnInit, OnDestroy {

    /** list of etches */
    @Input()
    etches: string[];

    /** timestamp of last edit (millis since epoch) */
    recentEdit: number;

    /** the timer/interval used to etch entries due to inactivity */
    etchingInterval: Observable<number>;

    intervalSubscription: Subscription;

    @Output()
    etchEmitter: EventEmitter<string>;

    @ViewChild('editor')
    editorElem: ElementRef;

    /**
     * the time (in millis) after which the etch should be created if the user has not been
     * actively typing
     */
    etchTimeout: number;

    constructor(private renderer: Renderer2,
                @Optional() etchTimeout: number) {
        if (this.etches === undefined) {
            this.etches = [];
        }
        this.recentEdit = Date.now();
        this.etchEmitter = new EventEmitter();

        // https://github.com/angular/angular/issues/25233
        // Can't use a default with constructor params
        if (etchTimeout !== null) {
            this.etchTimeout = etchTimeout;
        } else {
            this.etchTimeout = DEFAULT_ETCH_TIMEOUT;
        }
        console.info(`Etching timeout: ${this.etchTimeout} millis`);

        // Check if the etch timeout has been exceeded
        this.etchingInterval = interval(DEFAULT_ETCHING_INTERVAL);
        this.intervalSubscription = this.etchingInterval
            .subscribe(() => this.etchIfInactive());
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
        this.intervalSubscription.unsubscribe();
    }

    /**
     * Responds to key events
     *
     * This checks if "enter" was pressed and will finalize the etch if it was.
     *
     * @param event
     */
    onEtchKeydown(event: KeyboardEvent) {
        // Update the recent edit date of the etch
        this.recentEdit = Date.now();

        // We don't want to update the etch if the user pressed "shift + enter"
        if (event.key === ENTER_KEY && !event.shiftKey) {
            // Finalize the etch
            // preventing default event to prevent a new line
            event.preventDefault();
            this.etch();
        }
    }

    onEditorFocusOut() {
        // https://stackoverflow.com/a/20737134
        // Focusing out of a contenteditable div in Firefox inserts a <br/> element
        // If the content is empty, we clear it fully so the placeholder is displayed again
        if (this.editorElem.nativeElement.textContent.trim() === '') {
            this.editorElem.nativeElement.textContent = '';
        }
    }

    /**
     * Creates an etch of the current etch contents if the user has not updated the text content
     * within the etchTimeout
     */
    etchIfInactive() {
        // If user hasn't made any changes in `etchTimeout` seconds, we create the etch
        // automatically
        if ((Date.now() - this.recentEdit) >= this.etchTimeout) {
            this.etch();
        }
    }

    /**
     * Etch the current etch
     *
     * This actually finalizes the current etch and it can't be edited beyond this point
     */
    etch() {
        const text = this.editorElem.nativeElement.textContent.trim();
        if (text === '') {
            return;
        }

        // TODO: Add metadata representation of etch
        console.info(`Etching: ${text}`);
        // Push the current etch to the list of etches being displayed
        this.etches.push(text);

        // Reset the etch
        this.editorElem.nativeElement.textContent = '';

        // Emit the etch
        this.etchEmitter.emit(text);
    }
}
