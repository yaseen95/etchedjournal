import { Component, Input, OnInit } from '@angular/core';
import { EtchV1 } from '../../../models/etch/etch-v1';

@Component({
    selector: 'app-etch-item',
    templateUrl: './etch-item.component.html',
    styleUrls: ['./etch-item.component.css'],
})
export class EtchItemComponent implements OnInit {
    @Input()
    public etch: EtchV1;

    /** Indicates whether the etch item has been expanded */
    public isExpanded: boolean = false;

    public timestamp: string;

    public ngOnInit() {
        this.timestamp = new Date(this.etch.created).toLocaleString();
    }

    public toggleExpand() {
        this.isExpanded = !this.isExpanded;
    }
}
