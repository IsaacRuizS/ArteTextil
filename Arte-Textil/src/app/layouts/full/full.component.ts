import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// componentes
import { HeaderComponent } from '../../components/header/header.component';
import { LeftSidebarComponent } from '../../components/left-sidebar/left-sidebar.component';
import { AlertPollingService } from '../../services/alert-polling.service';

@Component({
    selector: 'app-full',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Default,
    templateUrl: './full.component.html',
    styleUrls: ['./full.component.scss'],

    imports: [
        HeaderComponent,
        LeftSidebarComponent,
        RouterOutlet
    ]
})
export class FullComponent implements OnInit {

    constructor(private alertPolling: AlertPollingService) { }

    sidebarClosed = false;

     ngOnInit(): void {
        this.alertPolling.start();
    }

    toggleSidebar() {
        this.sidebarClosed = !this.sidebarClosed;
    }
}
