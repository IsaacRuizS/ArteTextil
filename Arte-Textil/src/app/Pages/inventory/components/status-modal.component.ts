import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-status-modal',
    imports: [],
    templateUrl: './status-modal.component.html',
    styleUrl: '../inventory.scss',
})
export class StatusModalComponent {

    @Input() product: any;
    @Output() close = new EventEmitter();
    @Output() save = new EventEmitter();

}
