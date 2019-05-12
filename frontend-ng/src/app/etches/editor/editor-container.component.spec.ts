import { Location } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EntryV1 } from '../../models/entry/entry-v1';
import { ClockService } from '../../services/clock.service';
import { FakeClock } from '../../services/clock.service.spec';
import { FakeEntryStore, FakeEtchStore } from '../../services/fakes.service.spec';
import { EntryStore } from '../../stores/entry.store';
import { EtchStore } from '../../stores/etch/etch.store';
import { TestUtils } from '../../utils/test-utils.spec';
import { EditorContainerComponent, EntryState } from './editor-container.component';
import { EntryEditorComponent } from './entry-editor/entry-editor.component';
import { EntryTitleComponent } from './entry-title/entry-title.component';
import { EtchItemComponent } from './etch-item/etch-item.component';
import createEntryEntity = TestUtils.createEntryEntity;
import createEtch = TestUtils.createEtch;

describe('EditorContainerComponent', () => {
    let component: EditorContainerComponent;
    let fixture: ComponentFixture<EditorContainerComponent>;
    let entryStore: FakeEntryStore;
    let etchStore: FakeEtchStore;
    let clockService: ClockService;
    let locationSpy: any;

    const FOO_ETCH = createEtch('foobar', 123);

    beforeEach(async(() => {
        entryStore = new FakeEntryStore();
        etchStore = new FakeEtchStore();
        clockService = new FakeClock(1);
        locationSpy = jasmine.createSpyObj('Location', ['replaceState']);

        TestBed.configureTestingModule({
            declarations: [
                EditorContainerComponent,
                EntryTitleComponent,
                EntryEditorComponent,
                EtchItemComponent,
            ],
            providers: [
                { provide: EntryStore, useValue: entryStore },
                { provide: ClockService, useValue: clockService },
                { provide: EtchStore, useValue: etchStore },
                { provide: Location, useValue: locationSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { queryParamMap: convertToParamMap({ journalId: 'jid' }) },
                    },
                },
            ],
            imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditorContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('generates title on init', () => {
        expect(component.title).toEqual(new Date(1).toLocaleDateString());
    });

    it('creates entry if not yet created', fakeAsync(() => {
        expect(component.entry).toEqual(null);
        expect(component.state).toEqual(EntryState.NOT_CREATED);

        const createEntrySpy = spyOn(entryStore, 'createEntry');
        createEntrySpy.and.returnValue(createEntryEntity({ id: '1' }));
        component.title = 'entry title';

        component.onNewEtch(FOO_ETCH);
        tick();

        expect(component.state).toEqual(EntryState.CREATED);
        expect(component.entry).toEqual(createEntryEntity({ id: '1' }));
        expect(createEntrySpy).toHaveBeenCalledTimes(1);
        expect(createEntrySpy).toHaveBeenCalledWith('jid', createEntry('entry title', 1));
    }));

    it('after entry is created any queued etches are posted', fakeAsync(() => {
        component.title = 'title';

        spyOn(entryStore, 'createEntry').and.returnValue(createEntryEntity({ id: '1' }));
        const addEtchesSpy = spyOn(etchStore, 'addEtches');

        component.onNewEtch(FOO_ETCH);
        tick();

        expect(addEtchesSpy).toHaveBeenCalledTimes(1);
        expect(addEtchesSpy).toHaveBeenCalledWith('1', [FOO_ETCH]);
    }));

    it('replaces url state after entry is created', fakeAsync(() => {
        component.title = 'title';

        spyOn(entryStore, 'createEntry').and.returnValue(createEntryEntity({ id: '1' }));
        component.onNewEtch(FOO_ETCH);
        tick();

        expect(locationSpy.replaceState).toHaveBeenCalledTimes(1);
        expect(locationSpy.replaceState).toHaveBeenCalledWith('/entries/1');
    }));

    it('updating title updates title', () => {
        const oldEntry = createEntry('old title');
        entryStore.entriesById.set('entry1', oldEntry);
        const updateSpy = spyOn(entryStore, 'updateEntry');

        component.entry = createEntryEntity({ id: 'entry1' });
        component.state = EntryState.CREATED;

        component.onTitleChange('new title');

        expect(component.title).toEqual('new title');
        expect(updateSpy).toHaveBeenCalledTimes(1);
        expect(updateSpy).toHaveBeenCalledWith('entry1', { ...oldEntry, content: 'new title' });
    });

    it('updating title does not update store if entry not created', () => {
        for (const state of [EntryState.NOT_CREATED, EntryState.CREATING]) {
            component.entry = null;
            component.state = state;
            component.title = 'old';

            component.onTitleChange('new title');
            expect(component.title).toEqual('new title');
        }
    });

    function createEntry(content: string, created: number = 123): EntryV1 {
        return new EntryV1({ content, created });
    }
});
