import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TestUtils } from '../test-utils.spec';
import { EditableText } from './editable-text.component';
import triggerKeyUp = TestUtils.triggerKeyUp;
import triggerInput = TestUtils.triggerInput;
import triggerBlur = TestUtils.triggerBlur;

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
    });

    it('does not initialize to editing mode', () => {
        component.text = 'foobar';
        fixture.detectChanges();
        expect(component.editing).toEqual(false);
    });

    it('!editing - displays input text', () => {
        component.text = 'foobar';
        component.editing = false;
        fixture.detectChanges();

        const textDe = TestUtils.queryExpectOne(fixture.debugElement, '.text');
        expect(textDe.nativeElement.innerText).toEqual('foobar');
    });

    it('!editing - displays input text as link', () => {
        component.text = 'foobar';
        component.link = '/foo/bar';
        fixture.detectChanges();

        const anchorDe = TestUtils.queryExpectOne(fixture.debugElement, 'a');
        expect(anchorDe.nativeElement.getAttribute('href')).toEqual('/foo/bar');
        expect(anchorDe.nativeElement.innerText).toEqual('foobar');
    });

    it('!editing - clicks on edit icon changes edit mode', () => {
        component.text = 'foobar';
        expect(component.editing).toEqual(false);
        fixture.detectChanges();

        const iconDe = TestUtils.queryExpectOne(fixture.debugElement, '#edit-icon');
        iconDe.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.editing).toEqual(true);
    });

    it('editing - input is visible', () => {
        component.editing = true;
        component.text = 'foobar';
        fixture.detectChanges();

        TestUtils.queryExpectOne(fixture.debugElement, 'input');
    });

    it('editing - input updates current text', () => {
        component.editing = true;
        component.text = '';
        fixture.detectChanges();

        const inputDe = TestUtils.queryExpectOne(fixture.debugElement, 'input');
        inputDe.nativeElement.value = 'foobar';
        triggerInputAndKeydown(inputDe);

        expect(component.text).toEqual('foobar');
    });

    it('editing - emits text on save', () => {
        component.editing = true;
        component.text = '';
        fixture.detectChanges();

        const emitted = [];
        component.onSave.subscribe(text => emitted.push(text));

        const inputDe = TestUtils.queryExpectOne(fixture.debugElement, 'input');
        inputDe.nativeElement.value = 'foobar';
        triggerInputAndKeydown(inputDe);

        expect(emitted).toEqual(['foobar']);
    });

    it('editing - input text empty does not update text', () => {
        component.editing = true;
        component.text = 'foobar';
        fixture.detectChanges();

        const inputDe = TestUtils.queryExpectOne(fixture.debugElement, 'input');
        // Set text to empty
        inputDe.nativeElement.value = '';
        triggerInputAndKeydown(inputDe);

        // Should still be foobar
        expect(component.text).toEqual('foobar');
    });

    it('editing - exits edit mode after pressing enter', () => {
        component.editing = true;
        component.text = 'foobar';
        fixture.detectChanges();

        const inputDe = TestUtils.queryExpectOne(fixture.debugElement, 'input');
        inputDe.nativeElement.value = 'samsepiol';
        triggerInputAndKeydown(inputDe);

        expect(component.text).toEqual('samsepiol');
        expect(component.editing).toEqual(false);
    });

    it('editing - blur exits edit mode and saves if not empty', () => {
        component.editing = true;
        component.text = 'foobar';
        fixture.detectChanges();

        const emitted = [];
        component.onSave.subscribe(text => emitted.push(text));

        const inputDe = TestUtils.queryExpectOne(fixture.debugElement, 'input');
        inputDe.nativeElement.value = 'samsepiol';
        triggerInput(inputDe);
        triggerBlur(inputDe);

        expect(emitted).toEqual(['samsepiol']);
        expect(component.text).toEqual('samsepiol');
        expect(component.editing).toEqual(false);
    });

    it('editing - blur exits edit mode and does not save if empty', () => {
        component.editing = true;
        component.text = 'foobar';
        fixture.detectChanges();

        const emitted = [];
        component.onSave.subscribe(text => emitted.push(text));

        const inputDe = TestUtils.queryExpectOne(fixture.debugElement, 'input');
        (inputDe.nativeElement as HTMLInputElement).value = '';
        triggerInput(inputDe);
        triggerBlur(inputDe);

        expect(emitted).toEqual([]);
        // Should still be foobar
        expect(component.text).toEqual('foobar');
        expect(component.editing).toEqual(false);
    });

    it('editing - keyUp does not save until enter is pressed', () => {
        component.editing = true;
        component.text = 'foobar';
        fixture.detectChanges();

        const inputDe = TestUtils.queryExpectOne(fixture.debugElement, 'input');

        inputDe.nativeElement.value = 'a';
        triggerInput(inputDe);
        expect(component.text).toEqual('foobar');

        inputDe.nativeElement.value = 'ab';
        triggerInput(inputDe);
        expect(component.text).toEqual('foobar');

        triggerKeyUp(inputDe, 'Enter');
        expect(component.text).toEqual('ab');
    });
});

function triggerInputAndKeydown(de: DebugElement) {
    triggerInput(de);
    triggerKeyUp(de, 'Enter');
}
