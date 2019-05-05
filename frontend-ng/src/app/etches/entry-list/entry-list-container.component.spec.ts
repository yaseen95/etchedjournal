import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, Subject } from 'rxjs';
import { FakeEntryStore } from '../../services/fakes.service.spec';
import { EntryStore } from '../../stores/entry.store';
import { SpinnerComponent } from '../../utils/spinner/spinner.component';
import { TestUtils } from '../../utils/test-utils.spec';
import { EntryListContainerComponent } from './entry-list-container.component';
import { EntryListItemComponent } from './entry-list-item/entry-list-item.component';
import { EntryListComponent } from './entry-list/entry-list.component';

describe('EntryListContainerComponent', () => {
    let component: EntryListContainerComponent;
    let fixture: ComponentFixture<EntryListContainerComponent>;
    let store: EntryStore;
    let paramMap: Map<string, string>;
    let paramMapSubject: Subject<ParamMap>;

    beforeEach(async(() => {
        store = new FakeEntryStore();
        paramMap = new Map<string, any>();
        paramMap.set('id', 'journalId');
        paramMapSubject = new BehaviorSubject(paramMap as any);

        TestBed.configureTestingModule({
            declarations: [
                EntryListContainerComponent,
                EntryListComponent,
                EntryListItemComponent,
                SpinnerComponent,
            ],
            providers: [
                { provide: EntryStore, useValue: store },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        // Mock out the param map
                        paramMap: paramMapSubject,
                    },
                },
            ],
            imports: [RouterTestingModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EntryListContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('displays getting entries spinner when loading', () => {
        store.loading = true;
        fixture.detectChanges();

        const spinnerText = TestUtils.queryExpectOne(fixture.debugElement, 'app-spinner p');
        expect(spinnerText.nativeElement.innerText).toEqual('Getting entries');
    });

    it('displays entries after loading', () => {
        store.loading = false;
        fixture.detectChanges();
        TestUtils.queryExpectOne(fixture.debugElement, 'app-entry-list');
    });

    it('loads journals using id passed as param', () => {
        const getEntriesSpy = spyOn(store, 'getEntries');
        paramMap.set('id', 'foobar');
        component.ngOnInit();
        expect(getEntriesSpy).toHaveBeenCalledTimes(1);
        expect(getEntriesSpy).toHaveBeenCalledWith('foobar');
    });

    it('reloads entries when id param changes', () => {
        const getEntriesSpy = spyOn(store, 'getEntries');
        paramMap.set('id', 'changed id');
        paramMapSubject.next(paramMap as any);
        expect(getEntriesSpy).toHaveBeenCalledWith('changed id');
    });
});
