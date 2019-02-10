import { AfterViewInit, Directive, ElementRef } from '@angular/core';

// https://stackoverflow.com/a/43943746
@Directive({
    selector: '[appAutoFocus]',
})
export class AppAutoFocusDirective implements AfterViewInit {
    constructor(private el: ElementRef) {}

    public ngAfterViewInit() {
        this.el.nativeElement.focus();
    }
}
