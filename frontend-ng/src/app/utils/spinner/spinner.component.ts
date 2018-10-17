import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit {

    /** Specify text to display below spinner */
    @Input() text: string;

    constructor() {
    }

    ngOnInit() {
    }
}
