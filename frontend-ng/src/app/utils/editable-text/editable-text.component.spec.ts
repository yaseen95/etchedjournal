import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TestUtils } from '../test-utils.spec';
import { EditableText } from './editable-text.component';
import triggerBlur = TestUtils.triggerBlur;
import triggerEnter = TestUtils.triggerEnter;
import triggerEscape = TestUtils.triggerEscape;
import updateInputValue = TestUtils.updateInputValue;

describe('EditableText', () => {
    let component: EditableText;
    let fixture: ComponentFixture<EditableText>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EditableText],
            imports: [RouterTestingModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditableText);
        component = fixture.componentInstance;
        component.maxLength = 20;
        setTextAndInit('foobar');
    });

    it('does not initialize to editing mode', () => {
        expect(component.editing).toEqual(false);
    });

    it('!editing - displays input text', () => {
        component.editing = false;
        fixture.detectChanges();

        const textDe = TestUtils.queryExpectOne(fixture.debugElement, '.text');
        expect(textDe.nativeElement.innerText).toEqual('foobar');
    });

    it('!editing - displays input text as link', () => {
        component.link = '/foo/bar';
        fixture.detectChanges();

        const anchorDe = TestUtils.queryExpectOne(fixture.debugElement, 'a');
        expect(anchorDe.nativeElement.getAttribute('href')).toEqual('/foo/bar');
        expect(anchorDe.nativeElement.innerText).toEqual('foobar');
    });

    it('!editing - clicks on edit icon changes edit mode', () => {
        expect(component.editing).toEqual(false);
        fixture.detectChanges();

        const iconDe = TestUtils.queryExpectOne(fixture.debugElement, '#edit-icon');
        iconDe.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.editing).toEqual(true);
    });

    it('editing - input updates current text', () => {
        enableEditingMode();

        const inputDe = getInputDebugElement();
        updateInputValue(inputDe, 'foobarbaz');
        triggerEnter(inputDe);

        expect(component.text).toEqual('foobarbaz');
    });

    it('editing - emits text on save', () => {
        enableEditingMode();

        const emitted = [];
        component.onSave.subscribe(text => emitted.push(text));

        const inputDe = getInputDebugElement();
        updateInputValue(inputDe, 'foobarbaz');
        triggerEnter(inputDe);

        expect(emitted).toEqual(['foobarbaz']);
    });

    it('editing - input text empty does not update text', () => {
        enableEditingMode();

        const inputDe = getInputDebugElement();
        updateInputValue(inputDe, '');
        triggerEnter(inputDe);

        expect(component.text).toEqual('foobar');
    });

    it('editing - blank title does not update text', () => {
        enableEditingMode();

        const inputDe = getInputDebugElement();
        updateInputValue(inputDe, '   \n\n\t ');
        triggerEnter(inputDe);

        expect(component.text).toEqual('foobar');
    });

    it('editing - trims title on save', () => {
        enableEditingMode();

        const inputDe = getInputDebugElement();
        updateInputValue(inputDe, '   abc ');
        triggerEnter(inputDe);

        expect(component.text).toEqual('abc');
    });

    it('editing - exits edit mode after pressing enter', () => {
        enableEditingMode();

        const inputDe = getInputDebugElement();
        updateInputValue(inputDe, 'samsepiol');
        triggerEnter(inputDe);

        expect(component.text).toEqual('samsepiol');
        expect(component.editing).toEqual(false);
    });

    it('editing - blur exits edit mode and saves if not empty', () => {
        enableEditingMode();

        const emitted = [];
        component.onSave.subscribe(text => emitted.push(text));

        const inputDe = getInputDebugElement();
        updateInputValue(inputDe, 'samsepiol');
        triggerBlur(inputDe);

        expect(emitted).toEqual(['samsepiol']);
        expect(component.text).toEqual('samsepiol');
        expect(component.editing).toEqual(false);
    });

    it('editing - blur exits edit mode and does not save if empty', () => {
        enableEditingMode();

        const emitted = [];
        component.onSave.subscribe(text => emitted.push(text));

        const inputDe = getInputDebugElement();
        updateInputValue(inputDe, '');
        triggerBlur(inputDe);

        expect(emitted).toEqual([]);
        expect(component.text).toEqual('foobar');
        expect(component.editing).toEqual(false);
    });

    it('editing - does not save until enter is pressed', () => {
        enableEditingMode();
        const inputDe = getInputDebugElement();

        const emitted = [];
        component.onSave.subscribe(text => emitted.push(text));

        updateInputValue(inputDe, 'a');
        expect(component.text).toEqual('foobar');

        updateInputValue(inputDe, 'ab');
        expect(component.text).toEqual('foobar');

        triggerEnter(inputDe);
        expect(component.text).toEqual('ab');

        expect(emitted).toEqual(['ab']);
    });

    it('editing - input has maxlength', () => {
        enableEditingMode();
        component.maxLength = 20;
        fixture.detectChanges();

        const inputDe = getInputDebugElement();
        expect(inputDe.properties.maxLength).toEqual(20);
    });

    it('editing - can press enter to exit immediately after editing', () => {
        // GH-172
        enableEditingMode();
        const inputDe = getInputDebugElement();
        triggerEnter(inputDe);
        expect(component.editing).toEqual(false);
    });

    it('editing - can press escape to exit without saving changes', () => {
        enableEditingMode();
        const inputDe = getInputDebugElement();
        updateInputValue(inputDe, 'a');
        triggerEscape(inputDe);
        fixture.detectChanges();

        expect(component.text).toEqual('foobar');
        expect(component.editing).toEqual(false);
    });

    function setTextAndInit(text: string) {
        // text is provided as an input arg, because we create the component before the test
        // gets to run we have to mess around with
        component.text = text;
        component.ngOnInit();
        fixture.detectChanges();
    }

    function enableEditingMode() {
        component.editing = true;
        fixture.detectChanges();
    }

    function getInputDebugElement(): DebugElement {
        return TestUtils.queryExpectOne(fixture.debugElement, 'input');
    }
});
