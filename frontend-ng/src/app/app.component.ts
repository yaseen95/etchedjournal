import { Component, HostListener } from '@angular/core';
import { SecureStorageService } from './services/secure-storage.service';
import { EtchQueue } from './stores/etch/etch-queue';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {
    constructor(private secureStorage: SecureStorageService, private queue: EtchQueue) {}

    @HostListener('window:beforeunload', ['$event'])
    private onAppUnload(event: BeforeUnloadEvent) {
        if (this.queue.size() !== 0) {
            this.queue.flush();
            // Prevent closing/refreshing if there are still things in the queue
            event.returnValue = true;
        }
        this.secureStorage.flush();
    }
}
