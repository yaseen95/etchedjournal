import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MobxAngularModule } from 'mobx-angular';
import { JournalStore } from '../../../stores/journal.store';
import { FakeJournalStore } from '../../../stores/journal.store.spec';
import { SpinnerComponent } from '../../../utils/spinner/spinner.component';
import { TestUtils } from '../../../utils/test-utils.spec';
import { CreateJournalComponent } from '../create-journal/create-journal.component';
import { JournalListItemComponent } from '../journal-list-item/journal-list-item.component';
import { JournalListComponent } from '../journal-list/journal-list.component';
import { JournalsContainerComponent } from './journals-container.component';

describe('JournalsContainerComponent', () => {
    let component: JournalsContainerComponent;
    let fixture: ComponentFixture<JournalsContainerComponent>;
    let store: JournalStore;

    beforeEach(async(() => {
        store = new FakeJournalStore();

        TestBed.configureTestingModule({
            declarations: [
                JournalsContainerComponent,
                SpinnerComponent,
                JournalListComponent,
                JournalListItemComponent,
                CreateJournalComponent,
            ],
            providers: [{ provide: JournalStore, useValue: store }],
            imports: [RouterTestingModule, ReactiveFormsModule, MobxAngularModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JournalsContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('displays spinner when journals have not been loaded once', () => {
        store.loadedOnce = false;
        expect(component.displaySpinner()).toBeTruthy();
    });

    it('does not display spinner when loading journals after first time', () => {
        // has been loaded once so does not need to display the spinner
        store.loadedOnce = true;
        expect(component.displaySpinner()).toBeFalsy();
    });

    it('does not display spinner when journals are loading if loaded once', () => {
        store.loading = true;
        store.loadedOnce = true;
        expect(component.displaySpinner()).toBeFalsy();
    });

    it('displays spinner when journals loading', () => {
        store.loadedOnce = false;
        fixture.detectChanges();
        const spinnerText = TestUtils.queryExpectOne(fixture.debugElement, 'app-spinner p');
        expect(spinnerText.nativeElement.innerText).toEqual('Getting journals');
    });

    it('displays list of journals', () => {
        store.loadedOnce = true;
        store.journals = [];
        fixture.detectChanges();
        TestUtils.queryExpectOne(fixture.debugElement, 'app-journal-list');
    });
});
