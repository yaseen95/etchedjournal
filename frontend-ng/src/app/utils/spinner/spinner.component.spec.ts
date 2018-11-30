import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinnerComponent } from './spinner.component';
import { TestUtils } from '../test-utils.spec';

describe('SpinnerComponent', () => {
    let component: SpinnerComponent;
    let fixture: ComponentFixture<SpinnerComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SpinnerComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SpinnerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('create without text', () => {
        const textDe = TestUtils.queryExpectOne(fixture.debugElement, 'p');
        expect((textDe.nativeElement as HTMLParagraphElement).textContent).toEqual('');
    });

    it('create with text', () => {
        component.text = 'abc';
        fixture.detectChanges();

        const textDe = TestUtils.queryExpectOne(fixture.debugElement, 'p');
        expect((textDe.nativeElement as HTMLParagraphElement).textContent).toEqual('abc');
    });
});
