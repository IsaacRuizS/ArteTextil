import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';

// componentes
import { HeaderComponent } from '../../components/header/header.component';
import { LeftSidebarComponent } from '../../components/left-sidebar/left-sidebar.component';
import { AlertPollingService } from '../../services/alert-polling.service';

// Debajo de este ancho el sidebar se comporta como panel flotante sobre el
// contenido (móvil/tablet) y debe arrancar cerrado.
const MOBILE_BREAKPOINT = 992;

@Component({
    selector: 'app-full',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Default,
    templateUrl: './full.component.html',
    styleUrls: ['./full.component.scss'],

    imports: [
        HeaderComponent,
        LeftSidebarComponent,
        RouterOutlet,
        NgIf
    ]
})
export class FullComponent implements OnInit {

    constructor(private alertPolling: AlertPollingService) { }

    sidebarClosed = false;

    ngOnInit(): void {
        this.sidebarClosed = this.isMobile;
        //this.alertPolling.start();
    }

    get isMobile(): boolean {
        return typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT;
    }

    // El overlay solo tiene sentido cuando el menú flota sobre el contenido.
    get showOverlay(): boolean {
        return !this.sidebarClosed && this.isMobile;
    }

    toggleSidebar() {
        this.sidebarClosed = !this.sidebarClosed;
    }

    // En móvil el menú se cierra al navegar para no dejar tapado el contenido.
    onSidebarNavigate() {
        if (this.isMobile) {
            this.sidebarClosed = true;
        }
    }

    @HostListener('window:resize')
    onResize() {
        // Al pasar a escritorio se vuelve a mostrar el menú fijo.
        if (!this.isMobile && this.sidebarClosed) {
            this.sidebarClosed = false;
        }
    }
}
