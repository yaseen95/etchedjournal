import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { interval, Observable, Subscription } from 'rxjs';
import { EtchV1 } from '../../../models/etch/etch-v1';
import { ClockService } from '../../../services/clock.service';

const DEFAULT_ETCH_TIMEOUT = 5 * 1000;
const ENTER_KEY = 'Enter';
/** millis interval to check if etch is inactive */
const DEFAULT_ETCHING_INTERVAL = 250;

@Component({
    selector: 'app-editor',
    templateUrl: './entry-editor.component.html',
    styleUrls: ['./entry-editor.component.css'],
})
export class EntryEditorComponent implements OnDestroy {
    /** list of etches */
    @Input()
    public etches: EtchV1[];

    /** timestamp of last edit (millis since epoch) */
    public recentEdit: number;

    /** the timer/interval used to etch entries due to inactivity */
    private etchingInterval: Observable<number>;

    private intervalSubscription: Subscription;

    @Output()
    public etchEmitter: EventEmitter<EtchV1>;

    @ViewChild('editor')
    public editorElem: ElementRef;

    /**
     * the time (in millis) after which the etch should be created if the user has not been
     * actively typing
     */
    private etchTimeout: number;

    constructor(private renderer: Renderer2, private clock: ClockService) {
        if (this.etches === undefined) {
            this.etches = [];
        }
        this.recentEdit = clock.nowMillis();
        this.etchEmitter = new EventEmitter();
        this.etchTimeout = DEFAULT_ETCH_TIMEOUT;
        console.info(`Etching timeout: ${this.etchTimeout} millis`);

        // Check if the etch timeout has been exceeded
        this.etchingInterval = interval(DEFAULT_ETCHING_INTERVAL);
        this.intervalSubscription = this.etchingInterval.subscribe(() => this.etchIfInactive());
    }

    public ngOnDestroy() {
        this.intervalSubscription.unsubscribe();
    }

    /**
     * Responds to key events
     *
     * This checks if "enter" was pressed and will finalize the etch if it was.
     */
    public onEtchKeydown(event: KeyboardEvent) {
        // Update the recent edit date of the etch
        this.recentEdit = this.clock.nowMillis();

        // We don't want to update the etch if the user pressed "shift + enter"
        if (event.key === ENTER_KEY && !event.shiftKey) {
            // Finalize the etch
            // preventing default event to prevent a new line
            event.preventDefault();
            this.etch();
        }
    }

    public onEditorFocusOut() {
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
    // @VisibleForTesting
    public etchIfInactive() {
        // If user hasn't made any changes in `etchTimeout` seconds, we create the etch
        // automatically
        if (this.clock.nowMillis() - this.recentEdit >= this.etchTimeout) {
            this.etch();
        }
    }

    /**
     * Etch the current etch
     *
     * This actually finalizes the current etch and it can't be edited beyond this point
     */
    // @VisibleForTesting
    public etch() {
        const text = this.editorElem.nativeElement.textContent.trim();
        if (text === '') {
            return;
        }
        const e = new EtchV1({ content: text, created: this.clock.nowMillis() });
        // Push the current etch to the list of etches being displayed
        this.etches.push(e);
        // Reset the etch
        this.editorElem.nativeElement.textContent = '';
        this.etchEmitter.emit(e);
    }
}
