import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { nonWhitespaceValidator } from '../../../user/form-utils';

@Component({
    selector: 'app-entry-title',
    templateUrl: './entry-title.component.html',
    styleUrls: ['./entry-title.component.css'],
})
export class EntryTitleComponent implements OnInit {
    /** title of entry */
    @Input()
    public title: string;

    /** the previous title, stored so that titles are only emitted when it's changed */
    public prevTitle: string;

    @Output()
    public titleEmitter: EventEmitter<string>;

    /** the title is currently being edited */
    public isEditing: boolean;

    public titleForm: FormGroup;

    public TITLE_MIN_LENGTH = 1;
    public TITLE_MAX_LENGTH = 100;

    constructor(private fb: FormBuilder) {
        this.titleEmitter = new EventEmitter();
        this.titleForm = this.fb.group({
            title: [
                '',
                Validators.compose([
                    Validators.required,
                    Validators.minLength(this.TITLE_MIN_LENGTH),
                    Validators.maxLength(this.TITLE_MAX_LENGTH),
                    nonWhitespaceValidator,
                ]),
            ],
        });
    }

    public ngOnInit() {
        this.prevTitle = this.title;
    }

    public toggleEdit(update: boolean = false) {
        // TODO: Fix this method
        // What was I even thinking, how was this a good idea?
        const wasEditing = this.isEditing;
        this.isEditing = !this.isEditing;

        if (wasEditing) {
            // If were were in edit mode, save the title value from the form
            if (update) {
                this.title = this.titleForm.controls.title.value.trim();
                if (this.title !== this.prevTitle) {
                    console.info(`Updating title to ${this.title}`);
                    this.titleEmitter.emit(this.title);
                    this.prevTitle = this.title;
                }
            }
        } else {
            // If we were not in edit mode, update the form to display the current title and
            // focus on the title input
            this.titleForm.patchValue({ title: this.title });
        }
    }

    public submitForm() {
        if (this.titleForm.valid) {
            this.toggleEdit(true);
        }
    }
}
