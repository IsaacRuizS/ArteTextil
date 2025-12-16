import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type OrderStatus = 'Nuevo' | 'En producción' | 'Listo' | 'Entregado' | 'Atrasado' | 'Cancelado';

@Component({
  selector: 'app-orders-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders-management.component.html',
  styleUrls: ['./orders-management.component.scss']
})
export class OrdersManagementComponent {

  // --- Formulario (solo UI) ---
  newOrder = {
    customer: '',
    productType: 'Uniforme',
    quantity: null as number | null,
    deliveryDate: '',
    status: 'Nuevo' as OrderStatus,
    notifyClient: false
  };

  // Mensajes (simulados)
  errorMsg = '';
  successMsg = '';

  // --- Filtros/orden (solo UI) ---
  filter = {
    status: 'Todos',
    search: '',
    sortBy: 'Fecha entrega',
    sortDir: 'Asc'
  };

  statusOptions: (OrderStatus | 'Todos')[] = ['Todos', 'Nuevo', 'En producción', 'Listo', 'Entregado', 'Atrasado', 'Cancelado'];
  productTypes = ['Uniforme', 'Camisa', 'Pantalón', 'Accesorio'];
  sortOptions = ['Fecha entrega', 'Estado', 'Cliente', 'Cantidad'];

  // --- Listado mock ---
  orders = [
    {
      id: 'PED-001',
      customer: 'APF Liceo Samuel Sáenz',
      productType: 'Uniforme',
      quantity: 40,
      deliveryDate: '2025-12-20',
      status: 'En producción' as OrderStatus,
      canceled: false
    },
    {
      id: 'PED-002',
      customer: 'Cliente Mostrador',
      productType: 'Camisa',
      quantity: 12,
      deliveryDate: '2025-12-18',
      status: 'Atrasado' as OrderStatus,
      canceled: false
    },
    {
      id: 'PED-003',
      customer: 'Institución X',
      productType: 'Pantalón',
      quantity: 25,
      deliveryDate: '2025-12-28',
      status: 'Nuevo' as OrderStatus,
      canceled: false
    }
  ];

  // --- Historial (mock) ---
  history = [
    { orderId: 'PED-001', date: '2025-12-12 09:10', action: 'Creación', detail: 'Estado inicial: Nuevo' },
    { orderId: 'PED-001', date: '2025-12-13 14:22', action: 'Cambio de estado', detail: 'Nuevo → En producción' },
    { orderId: 'PED-002', date: '2025-12-10 11:05', action: 'Cambio de estado', detail: 'En producción → Atrasado' }
  ];

  // --- UI: “modales” simulados con panel ---
  editPanelOpen = false;
  cancelPanelOpen = false;
  selectedOrder: any = null;

  editModel = {
    customer: '',
    productType: '',
    quantity: 0,
    deliveryDate: ''
  };

  cancelReason = '';
  requireConfirmText = '';

  // --- Helpers visuales ---
  statusBadgeClass(status: OrderStatus) {
    return {
      'bg-secondary': status === 'Nuevo',
      'bg-primary': status === 'En producción',
      'bg-info': status === 'Listo',
      'bg-success': status === 'Entregado',
      'bg-warning': status === 'Atrasado',
      'bg-dark': status === 'Cancelado'
    };
  }

  openEdit(order: any) {
    this.selectedOrder = order;
    this.editModel = {
      customer: order.customer,
      productType: order.productType,
      quantity: order.quantity,
      deliveryDate: order.deliveryDate
    };
    this.editPanelOpen = true;
    this.cancelPanelOpen = false;
    this.errorMsg = '';
    this.successMsg = '';
  }

  openCancel(order: any) {
    this.selectedOrder = order;
    this.cancelReason = '';
    this.requireConfirmText = '';
    this.cancelPanelOpen = true;
    this.editPanelOpen = false;
    this.errorMsg = '';
    this.successMsg = '';
  }

  closePanels() {
    this.editPanelOpen = false;
    this.cancelPanelOpen = false;
    this.selectedOrder = null;
  }

  // Solo “validación visual” (no persiste nada)
  simulateCreate() {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.newOrder.customer.trim() || !this.newOrder.quantity || !this.newOrder.deliveryDate) {
      this.errorMsg = 'Campos obligatorios: cliente, cantidad y fecha de entrega.';
      return;
    }

    this.successMsg = 'Pedido registrado. Estado inicial asignado: "Nuevo".';
  }

  simulateStatusChange(order: any, newStatus: OrderStatus) {
    this.successMsg = `Cambio de estado simulado: ${order.id} → ${newStatus}. (Historial/Notificación:)`;
    this.errorMsg = '';
  }

  simulateSaveEdit() {
    this.successMsg = 'Cambios guardados. Auditoría: simulada.';
    this.errorMsg = '';
  }

  simulateCancel() {
    this.errorMsg = '';
    if (this.requireConfirmText.trim().toUpperCase() !== 'CANCELAR') {
      this.errorMsg = 'Para confirmar la cancelación, escribe: CANCELAR';
      return;
    }
    this.successMsg = 'Pedido cancelado lógicamente. Persistencia en historial: simulada.';
  }
}
