import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-editable-text',
    templateUrl: './editable-text.component.html',
    styleUrls: ['./editable-text.component.css'],
})
export class EditableText implements OnInit {
    /** Callback to return the edited text */
    @Output()
    public onSave: EventEmitter<string> = new EventEmitter();

    /** Default value for text */
    @Input()
    public text: string;

    /** Optional - display text as a routerlink */
    @Input()
    public link?: string;

    @Input()
    public maxLength: number;

    public editing: boolean = false;
    private editingText: string;

    public ngOnInit(): void {
        if (this.text === undefined || this.text === null) {
            throw new Error('Text is required');
        }
        this.text = this.text.trim();
        this.editingText = this.text;
        if (this.maxLength === undefined || this.maxLength === null || this.maxLength <= 0) {
            throw new Error('Must provide positive maxLength');
        }
    }

    public edit() {
        this.editing = true;
    }

    public onKeyUp(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.finishEditing();
        } else if (event.key === 'Escape') {
            this.exitWithoutSaving();
        }
    }

    public onInput(event: TextEvent) {
        this.editingText = (event.target as HTMLInputElement).value.trim();
    }

    public onBlur() {
        this.finishEditing();
    }

    private finishEditing() {
        if (this.shouldUpdateText()) {
            this.onSave.emit(this.editingText);
            this.text = this.editingText;
        }
        this.editing = false;
    }

    private shouldUpdateText(): boolean {
        if (this.editingText === '') {
            return false;
        }
        return this.editingText !== this.text;
    }

    private exitWithoutSaving() {
        this.editing = false;
        this.editingText = this.text;
    }
}
