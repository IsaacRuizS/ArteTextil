import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomerModel } from '../../shared/models/customer.model';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'app-customer-modal',
  templateUrl: './customer-modal.component.html'
})
export class CustomerModalComponent {

  @Input() customer?: CustomerModel;
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }

}