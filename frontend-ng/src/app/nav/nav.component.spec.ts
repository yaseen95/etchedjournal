import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { MobxAngularModule } from 'mobx-angular';
import { JournalEntity } from '../models/journal-entity';
import { AuthService } from '../services/auth.service';
import { JournalStore } from '../stores/journal.store';
import { FakeJournalStore } from '../stores/journal.store.spec';
import { TestUtils } from '../utils/test-utils.spec';
import { NavComponent } from './nav.component';
import TEST_USER = TestUtils.TEST_USER;

describe('NavComponent', () => {
    let component: NavComponent;
    let fixture: ComponentFixture<NavComponent>;
    let authSpy: any;
    let journalStore: JournalStore;

    const TEST_JOURNALS: JournalEntity[] = [
        { content: '1', id: 'abc' },
        { content: '2', id: 'def' },
        { content: '3', id: 'ghi' },
        { content: '4', id: 'jkl' },
    ] as JournalEntity[];

    beforeEach(async(() => {
        authSpy = jasmine.createSpyObj('AuthService', ['getUser', 'logout']);
        journalStore = new FakeJournalStore();

        TestBed.configureTestingModule({
            declarations: [NavComponent],
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: JournalStore, useValue: journalStore },
            ],
            imports: [RouterTestingModule, MobxAngularModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('collapseDropdownOnMobile is true on init', () => {
        expect(component.collapseDropdownOnMobile).toBe(true);
    });

    it('burgerIsActive is false on init', () => {
        expect(component.burgerIsActive).toBe(false);
    });

    it('toggling burger menu active updates classes', () => {
        // Preconditions - not active when `burgerIsActive` is false.
        expect(component.burgerIsActive).toBeFalsy();
        const burgerMenuBtnDe = TestUtils.queryExpectOne(fixture.debugElement, 'a.navbar-burger');
        const navBarMenuDe = TestUtils.queryExpectOne(fixture.debugElement, 'div.navbar-menu');
        expect(burgerMenuBtnDe.classes['is-active']).toBeFalsy();
        expect(navBarMenuDe.classes['is-active']).toBeFalsy();

        component.toggleBurgerMenu();
        fixture.detectChanges();

        expect(burgerMenuBtnDe.classes['is-active']).toBeTruthy();
        expect(navBarMenuDe.classes['is-active']).toBeTruthy();
        expect(component.burgerIsActive).toBeTruthy();
    });

    it('displays register and login buttons when not logged in', () => {
        authSpy.getUser.and.returnValue(null);
        fixture.detectChanges();

        TestUtils.queryExpectOne(fixture.debugElement, '#register-btn');
        TestUtils.queryExpectOne(fixture.debugElement, '#login-btn');
        // does not display logout button
        TestUtils.queryExpectNone(fixture.debugElement, '#logout-btn');
    });

    it('displays logout button when logged in', () => {
        authSpy.getUser.and.returnValue(TEST_USER);
        fixture.detectChanges();

        TestUtils.queryExpectOne(fixture.debugElement, '#logout-btn');
        // does not display login and register buttons
        TestUtils.queryExpectNone(fixture.debugElement, '#register-btn');
        TestUtils.queryExpectNone(fixture.debugElement, '#login-btn');
    });

    it('displays links to journals', () => {
        journalStore.journals = TEST_JOURNALS.slice(0, 2);
        fixture.detectChanges();

        const items = fixture.debugElement.queryAll(By.css('.journal-nav-item'));
        expect(items.length).toEqual(2);
        expect(items[0].properties.href).toEqual('/journals/abc');
        expect(items[1].properties.href).toEqual('/journals/def');
    });

    it('journals are not display in dropdown when 3 or less', () => {
        journalStore.journals = TEST_JOURNALS.slice(0, 3);
        fixture.detectChanges();
        TestUtils.queryExpectNone(fixture.debugElement, '.navbar-dropdown');
    });

    it('journals are displayed in dropdown when more than 3', () => {
        journalStore.journals = TEST_JOURNALS.slice();
        fixture.detectChanges();

        const dropdownDe = TestUtils.queryExpectOne(fixture.debugElement, '.navbar-dropdown');
        // query inside the dropdown element
        const journalItemDes = dropdownDe.queryAll(By.css('.journal-nav-item'));
        expect(journalItemDes.length).toBe(4);
    });

    it('collapseDropdownOnMobile collapses dropdown on mobile and tablet', () => {
        component.collapseDropdownOnMobile = true;
        journalStore.journals = TEST_JOURNALS.slice();

        fixture.detectChanges();

        const dropdownDe = TestUtils.queryExpectOne(fixture.debugElement, '.navbar-dropdown');
        expect(dropdownDe.classes['is-hidden-mobile']).toBe(true);
        expect(dropdownDe.classes['is-hidden-tablet-only']).toBe(true);
    });

    it('collapseDropdownOnMobile expands dropdown on mobile and tablet', () => {
        component.collapseDropdownOnMobile = false;
        journalStore.journals = TEST_JOURNALS.slice();

        fixture.detectChanges();

        const dropdownDe = TestUtils.queryExpectOne(fixture.debugElement, '.navbar-dropdown');
        // We just check that the hidden isn't applied
        expect(dropdownDe.classes['is-hidden-mobile']).toBe(false);
        expect(dropdownDe.classes['is-hidden-tablet-only']).toBe(false);
    });

    it('toggleDropdown changes collapseDropdownOnMobile', () => {
        component.collapseDropdownOnMobile = false;
        component.toggleJournalDropdown();
        expect(component.collapseDropdownOnMobile).toBe(true);

        component.collapseDropdownOnMobile = true;
        component.toggleJournalDropdown();
        expect(component.collapseDropdownOnMobile).toBe(false);
    });

    it('clicking navbar-item dropdown togglesDropdown', () => {
        journalStore.journals = TEST_JOURNALS.slice();
        component.collapseDropdownOnMobile = true;
        fixture.detectChanges();

        const dropdownItemDe = TestUtils.queryExpectOne(fixture.debugElement, '.has-dropdown');
        (dropdownItemDe.nativeElement as HTMLElement).click();
        expect(component.collapseDropdownOnMobile).toBe(false);
    });
});
