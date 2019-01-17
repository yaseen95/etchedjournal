import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { By } from '@angular/platform-browser';
import { EtchV1 } from '../../../models/etch';
import { ClockService } from '../../../services/clock.service';
import { TestUtils } from '../../../utils/test-utils.spec';
import { EntryEditorComponent } from './entry-editor.component';

describe('EntryEditorComponent', () => {
    let component: EntryEditorComponent;
    let fixture: ComponentFixture<EntryEditorComponent>;
    let emittedEtches: Array<EtchV1> = [];
    let clockSpy: any;

    beforeEach(async(() => {
        clockSpy = jasmine.createSpyObj('ClockService', ['now', 'nowMillis']);
        clockSpy.nowMillis.and.returnValue(0);

        TestBed.configureTestingModule({
            declarations: [EntryEditorComponent],
            providers: [
                {provide: ClockService, useValue: clockSpy},
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EntryEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        component.etchEmitter.subscribe(e => emittedEtches.push(e));
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('etches renders when length greater than 0', () => {
        component.etches = [
            new EtchV1('abc', 0),
            new EtchV1('def', 0),
        ];
        fixture.detectChanges();

        const listDe = TestUtils.queryExpectOne(fixture.debugElement, '#etches-list');

        const listItems = listDe.queryAll(By.css('li'));
        expect(listItems.length).toEqual(2);

        expect(listItems[0].nativeElement.innerText).toEqual('abc');
        expect(listItems[1].nativeElement.innerText).toEqual('def');
    });

    it('etches not visible when no etches', () => {
        component.etches = [];
        fixture.detectChanges();
        TestUtils.queryExpectNone(fixture.debugElement, '#etches-list');
    });

    it('entry editor renders', () => {
        TestUtils.queryExpectOne(fixture.debugElement, '#entry-editor');
    });

    it('keydown event invokes onEtchKeydown', () => {
        const editorDe = TestUtils.queryExpectOne(fixture.debugElement, '#entry-editor');

        const onKeydownSpy = spyOn(component, 'onEtchKeydown');

        const event = new KeyboardEvent('keydown', {key: 'a'});
        (editorDe.nativeElement as HTMLElement).dispatchEvent(event);

        expect(onKeydownSpy).toHaveBeenCalledTimes(1);
        expect(onKeydownSpy).toHaveBeenCalledWith(event);
    });

    it('keydown updates recentEdit timestamp', () => {
        const recentEdit = component.recentEdit;
        clockSpy.nowMillis.and.returnValue(5);
        component.onEtchKeydown(new KeyboardEvent('keydown', {key: 'a'}));
        expect(component.recentEdit).toBeGreaterThan(recentEdit);
        expect(component.recentEdit).toEqual(5);
    });

    it('keydown updates on enter', () => {
        const editorDe = TestUtils.queryExpectOne(fixture.debugElement, '#entry-editor');
        const editorEl = editorDe.nativeElement as HTMLDivElement;
        editorEl.textContent = 'abc';

        component.onEtchKeydown(new KeyboardEvent('keydown', {key: 'Enter'}));
        fixture.detectChanges();

        // 1 etch should have been emitted
        expect(emittedEtches.length).toEqual(1);
        expect(emittedEtches[0]).toEqual(new EtchV1('abc', 0));

        // etch should also have been updated and be visible in the etches list
        expect(component.etches.length).toEqual(1);
        expect(component.etches[0]).toEqual(new EtchV1('abc', 0));
        const listDe = TestUtils.queryExpectOne(fixture.debugElement, 'li');
        expect(listDe.nativeElement.textContent).toEqual('abc');

        // text content should be reset
        expect(editorEl.textContent).toEqual('');
    });

    it('keydown does not update on shift + enter', () => {
        component.onEtchKeydown(new KeyboardEvent('keydown', {key: 'Enter', shiftKey: true}));

        // onEtchKeydown calls `etch` when the user presses enter
        // We should check that it DOES NOT get called when the user presses shift + enter
        const etchSpy = spyOn(component, 'etch').and.callThrough();

        // no etches should have been created
        expect(emittedEtches.length).toEqual(0);
        expect(component.etches.length).toEqual(0);
        expect(etchSpy).toHaveBeenCalledTimes(0);
    });

    it('etch is posted if inactive', () => {
        // set the recent edit time to 0 so that the etch becomes inactive
        component.recentEdit = 0;

        clockSpy.nowMillis.and.returnValue(5000);

        const editorDe = TestUtils.queryExpectOne(fixture.debugElement, '#entry-editor');
        const editorEl = editorDe.nativeElement as HTMLDivElement;
        editorEl.textContent = 'posted after timeout';

        component.etchIfInactive();
        fixture.detectChanges();

        const expected = new EtchV1('posted after timeout', 5000);

        expect(emittedEtches.length).toEqual(1);
        expect(emittedEtches[0]).toEqual(expected);
        expect(component.etches.length).toEqual(1);
        expect(editorEl.textContent).toEqual('');
    });

    it('etch is not posted if active', () => {
        // set the recent edit time to far in the future so that it doesn't occur after etch timeout
        component.recentEdit = Date.now() + 100_000_000;

        const editorDe = TestUtils.queryExpectOne(fixture.debugElement, '#entry-editor');
        const editorEl = editorDe.nativeElement as HTMLDivElement;
        editorEl.textContent = 'posted after timeout';

        component.etchIfInactive();

        expect(emittedEtches.length).toEqual(0);
        expect(component.etches.length).toEqual(0);
    });

    it('etch is not posted if contents are empty', () => {
        const editorDe = TestUtils.queryExpectOne(fixture.debugElement, '#entry-editor');
        const editorEl = editorDe.nativeElement as HTMLDivElement;
        // set content to whitespace
        editorEl.textContent = '    \n\n \t\t  ';

        component.etch();

        // no etches should have been created
        expect(emittedEtches.length).toEqual(0);
        expect(component.etches.length).toEqual(0);
    });


    afterEach(() => {
        component.ngOnDestroy();
        // reset emitted etches
        emittedEtches = [];
    });
});
