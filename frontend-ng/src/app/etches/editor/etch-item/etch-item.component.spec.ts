import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EtchV1 } from '../../../models/etch/etch';
import { TestUtils } from '../../../utils/test-utils.spec';

import { EtchItemComponent } from './etch-item.component';

describe('EtchItemComponent', () => {
    let component: EtchItemComponent;
    let fixture: ComponentFixture<EtchItemComponent>;
    const etch = new EtchV1('content', 0);

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EtchItemComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EtchItemComponent);
        component = fixture.componentInstance;
        component.etch = etch;
        fixture.detectChanges();
    });

    it('displays content when not expanded', () => {
        expect(component.isExpanded).toBe(false);
        const pDe = TestUtils.queryExpectOne(fixture.debugElement, 'p.etch-content');
        expect(pDe.nativeElement.innerText).toEqual(etch.content);
    });

    it('displays timestamp and content when expanded', () => {
        component.isExpanded = true;
        fixture.detectChanges();
        const contentDe = TestUtils.queryExpectOne(fixture.debugElement, 'p.etch-content');
        expect(contentDe.nativeElement.innerText).toEqual(etch.content);

        const expectedTimestamp = new Date(0).toLocaleString();
        const timestampDe = TestUtils.queryExpectOne(fixture.debugElement, 'p.etch-ts');
        expect(timestampDe.nativeElement.innerText).toEqual(expectedTimestamp);
    });

    it('toggleExpand toggles expanded', () => {
        component.isExpanded = false;
        component.toggleExpand();
        expect(component.isExpanded).toBe(true);

        component.isExpanded = true;
        component.toggleExpand();
        expect(component.isExpanded).toBe(false);
    });

    it('clicking changes expand - when not expanded', () => {
        expect(component.isExpanded).toBe(false);
        const etchDe = TestUtils.queryExpectOne(fixture.debugElement, 'div.etch-item');
        etchDe.nativeElement.dispatchEvent(new Event('click'));
        expect(component.isExpanded).toBe(true);
    });

    it('clicking changes expand - when expanded', () => {
        component.isExpanded = true;
        fixture.detectChanges();

        const etchDe = TestUtils.queryExpectOne(fixture.debugElement, 'div.etch-item');
        etchDe.nativeElement.dispatchEvent(new Event('click'));
        expect(component.isExpanded).toBe(false);
    });
});
