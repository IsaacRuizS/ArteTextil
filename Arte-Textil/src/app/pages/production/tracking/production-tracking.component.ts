import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductionService, ProductionProgress } from '../../../services/production.service'; // Adjust path if needed
import { SharedModalsComponent, ModalType } from '../components/shared-modals/shared-modals.component';

@Component({
    selector: 'app-production-tracking',
    standalone: true,
    imports: [CommonModule, SharedModalsComponent],
    templateUrl: './production-tracking.component.html',
    styleUrls: ['./production-tracking.component.scss']
})
export class ProductionTrackingComponent {
    productionService = inject(ProductionService);

    // Modal State
    modalConfig = {
        isOpen: false,
        title: '',
        type: 'progress' as ModalType,
        data: null as any
    };

    selectedProgress: ProductionProgress | null = null;

    get stages() {
        return this.productionService.productionStages;
    }

    getProgressByStage(stageId: number) {
        return this.productionService.progress().filter(p => p.StageId === stageId);
    }

    getOrderInfo(productionOrderId: number) {
        return this.productionService.orders().find(o => o.ProductionOrderId === productionOrderId);
    }

    openProgressModal(progress: ProductionProgress) {
        const order = this.getOrderInfo(progress.ProductionOrderId);
        if (!order) return;

        this.selectedProgress = progress;
        this.modalConfig = {
            isOpen: true,
            title: 'Actualizar Progreso',
            type: 'progress',
            data: { itemName: `Pedido #${order.ProductionOrderId} - ${order.Product?.Name}` }
        };
    }

    closeModal() {
        this.modalConfig.isOpen = false;
        this.selectedProgress = null;
    }

    handleModalSubmit(action: 'En progreso' | 'Finalizado') {
        if (this.selectedProgress) {
            this.productionService.updateProgressStatus(
                this.selectedProgress.ProductionOrderId,
                this.selectedProgress.StageId,
                action
            );
        }
    }

    getStatusColor(status: string) {
        switch (status) {
            case 'En progreso': return 'text-blue-600 font-semibold';
            case 'Finalizado': return 'text-green-600 font-semibold';
            default: return 'text-gray-500';
        }
    }
}
