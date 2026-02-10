import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// componentes
import { PublicHeaderComponent } from '../../components/public-header/public-header.component';

@Component({
    selector: 'app-public',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Default,
    templateUrl: './public.component.html',
    styleUrls: ['./public.component.scss'],

    imports: [
        PublicHeaderComponent,
        RouterOutlet
    ]
})
export class PublicComponent {

    constructor() { }

    sidebarClosed = true;

    toggleSidebar() {
        this.sidebarClosed = !this.sidebarClosed;
    }
}
