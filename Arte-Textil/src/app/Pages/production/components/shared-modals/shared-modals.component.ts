import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type ModalType = 'progress' | 'assignment' | 'filter' | 'confirmation';

@Component({
    selector: 'app-shared-modals',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './shared-modals.component.html',
    styleUrls: ['./shared-modals.component.scss']
})
export class SharedModalsComponent {
    @Input() isOpen = false;
    @Input() title = '';
    @Input() modalType: ModalType = 'progress';
    @Input() data: any = {}; // Typed as any for flexibility across modal types, could be generic

    @Output() closeEvent = new EventEmitter<void>();
    @Output() submitEvent = new EventEmitter<any>();

    inputValue: any = '';

    close() {
        this.closeEvent.emit();
        this.reset();
    }

    submit(value: any) {
        this.submitEvent.emit(value);
        this.close();
    }

    private reset() {
        this.inputValue = '';
    }
}
