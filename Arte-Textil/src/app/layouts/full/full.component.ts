import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// componentes
import { HeaderComponent } from '../../components/header/header.component';
import { LeftSidebarComponent } from '../../components/left-sidebar/left-sidebar.component';

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
export class FullComponent {

    constructor() { }

    sidebarClosed = false;

    toggleSidebar() {
        this.sidebarClosed = !this.sidebarClosed;
    }
}
