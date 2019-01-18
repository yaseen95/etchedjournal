import { Component, Input, OnInit } from '@angular/core';
import { EtchV1 } from '../../../models/etch';

@Component({
    selector: 'app-etch-item',
    templateUrl: './etch-item.component.html',
    styleUrls: ['./etch-item.component.css']
})
export class EtchItemComponent implements OnInit {

    @Input()
    etch: EtchV1;

    /** Indicates whether the etch item has been expanded */
    isExpanded: boolean = false;

    timestamp: String;

    constructor() {
    }

    ngOnInit() {
        this.timestamp = new Date(this.etch.timestamp).toLocaleString();
    }

    toggleExpand() {
        this.isExpanded = !this.isExpanded;
    }
}
