import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductionService, ProductionOrder, ProductionProgress } from '../../../services/production.service';
import { SharedModalsComponent, ModalType } from '../components/shared-modals/shared-modals.component';

@Component({
    selector: 'app-order-control',
    standalone: true,
    imports: [CommonModule, FormsModule, SharedModalsComponent],
    templateUrl: './order-control.component.html',
    styleUrls: ['./order-control.component.scss']
})
export class OrderControlComponent {
    productionService = inject(ProductionService);

    // Filter State
    filterStageId: number | 'todos' = 'todos';

    // Modal State
    modalConfig = {
        isOpen: false,
        title: '',
        type: 'filter' as ModalType,
        data: null as any
    };

    selectedAssignment: ProductionProgress | null = null; // Reusing Progress model to set employee

    get orders() {
        // In a real app we might join order + current stage, here we show all orders 
        // and their progress in columns or expanded rows. For table simplicity: list orders.
        return this.productionService.orders();
    }

    get alerts() {
        return this.productionService.alerts();
    }

    // Helpers
    getProgressList(productionOrderId: number) {
        // Return progress items sorted by stage
        return this.productionService.progress()
            .filter(p => p.ProductionOrderId === productionOrderId)
            .sort((a, b) => a.StageId - b.StageId);
    }

    isOrderDelayed(order: ProductionOrder): boolean {
        return order.DueDate < new Date() && order.Status !== 'Finalizado';
    }

    // Actions
    openFilterModal() {
        this.modalConfig = {
            isOpen: true,
            title: 'Filtrar Pedidos por Etapa Activa',
            type: 'filter',
            data: {
                options: this.productionService.productionStages.map(s => ({ value: s.StageId, label: s.Name }))
            }
        };
    }

    openAssignmentModal(progress: ProductionProgress) {
        // Admin only typically
        this.selectedAssignment = progress;
        this.modalConfig = {
            isOpen: true,
            title: 'Asignar Empleado',
            type: 'assignment',
            data: { stageName: progress.StageName }
        };
    }

    closeModal() {
        this.modalConfig.isOpen = false;
        this.selectedAssignment = null;
    }

    handleModalSubmit(value: any) {
        if (this.modalConfig.type === 'filter') {
            this.filterStageId = value;
            // Filter logic typically happens in getter or via signal computed
        } else if (this.modalConfig.type === 'assignment' && this.selectedAssignment) {
            const empId = parseInt(value);
            if (!isNaN(empId)) {
                this.productionService.assignEmployee(
                    this.selectedAssignment.ProductionOrderId,
                    this.selectedAssignment.StageId,
                    empId,
                    `Empleado #${empId}` // Mock name
                );
            }
        }
    }

    // View Helpers
    filteredOrders() {
        let list = this.orders;
        // Implement simple mock filter if needed, e.g. based on status
        return list;
    }
}
