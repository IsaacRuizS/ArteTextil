import { Component } from '@angular/core';
import { PromotionFormModal } from './components/promotion-form-modal';
import { PromotionDeleteModal } from './components/promotion-delete-modal';

@Component({
    selector: 'app-promotion',
    standalone: true,
    imports: [PromotionFormModal, PromotionDeleteModal],
    templateUrl: './promotion.component.html',
    styleUrls: ['./promotion.component.scss'],
})
export class PromotionComponent {

    products = [
        { id: 1, name: 'Camisa Azul' },
        { id: 2, name: 'Pantalón Negro' },
        { id: 3, name: 'Gorra Roja' },
    ];

    promotions = [
        {
            id: 1,
            name: 'Promo Verano',
            productId: 1,
            percent: 20,
            start: '2024-01-01',
            end: '2024-03-01',
            status: 'Activa'
        },
        {
            id: 2,
            name: 'Navidad 2023',
            productId: 2,
            percent: 15,
            start: '2023-12-01',
            end: '2023-12-31',
            status: 'Activa'
        }
    ];

    deletedPromotions: any[] = [];

    showFormModal = false;
    showStatusModal = false;
    showDeleteModal = false;

    editingPromotion: any = null;
    statusPromotion: any = null;
    deletePromotion: any = null;

    getProductName(id: number) {
        return this.products.find(p => p.id === id)?.name ?? 'Producto desconocido';
    }

    onChangeStatus(promo: any){

        if(promo.status == 'Activa'){
            promo.status = 'Inactiva';
        }else{
            promo.status = 'Activa';
        }
    }

    // -------------------- Abrir modales --------------------

    openCreateModal() {
        this.editingPromotion = null;
        this.showFormModal = true;
    }

    openEditModal(promo: any) {
        this.editingPromotion = promo;
        this.showFormModal = true;
    }

    openDeleteModal(promo: any) {
        this.deletePromotion = promo;
        this.showDeleteModal = true;
    }

    // -------------------- Recepción de cambios --------------------

    saveCreatedPromotion(promo: any) {
        promo.id = this.promotions.length + 1;
        this.promotions.push(promo);
    }

    saveUpdatedPromotion(updated: any) {
        Object.assign(this.editingPromotion, updated);
    }

    applyStateChange(newStatus: string) {
        this.statusPromotion.status = newStatus;
    }

    deletePromotionLogic() {
        this.deletePromotion.status = 'Eliminada';
        this.deletedPromotions.push(this.deletePromotion);
        this.promotions = this.promotions.filter(p => p.status !== 'Eliminada');
    }
}
