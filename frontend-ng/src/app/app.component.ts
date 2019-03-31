import { Component, HostListener } from '@angular/core';
import { SecureStorageService } from './services/secure-storage.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {
    constructor(private secureStorage: SecureStorageService) {}

    @HostListener('window:beforeunload')
    private onAppUnload() {
        this.secureStorage.flush();
    }
}
