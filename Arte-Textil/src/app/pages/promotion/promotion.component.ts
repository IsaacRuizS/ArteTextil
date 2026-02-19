import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { PromotionFormModal } from './components/promotion-form-modal';
import { PromotionDeleteModal } from './components/promotion-delete-modal';
import { ApiPromotionService } from '../../services/api-promotion.service';
import { ApiProductService } from '../../services/api-product.service';
import { PromotionModel } from '../../shared/models/promotion.model';
import { ProductModel } from '../../shared/models/product.model';

@Component({
    selector: 'app-promotion',
    standalone: true,
    imports: [CommonModule, PromotionFormModal, PromotionDeleteModal],
    templateUrl: './promotion.component.html',
    styleUrls: ['./promotion.component.scss'],
})
export class PromotionComponent implements OnInit {

    products: ProductModel[] = [];
    promotions: PromotionModel[] = [];

    showFormModal = false;
    showDeleteModal = false;

    editingPromotion: PromotionModel | null = null;
    deletePromotion: PromotionModel | null = null;

    constructor(
        private apiPromotionService: ApiPromotionService,
        private apiProductService: ApiProductService
    ) { }

    ngOnInit() {
        this.loadProducts();
        this.loadPromotions();
    }

    loadProducts() {
        this.apiProductService.getAll().subscribe({
            next: (data) => {
                this.products = data;
            },
            error: (err) => {
                console.error('Error al cargar productos:', err);
                Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
            }
        });
    }

    loadPromotions() {
        this.apiPromotionService.getAll().subscribe({
            next: (data) => {
                this.promotions = data;
            },
            error: (err) => {
                console.error('Error al cargar promociones:', err);
                Swal.fire('Error', 'No se pudieron cargar las promociones', 'error');
            }
        });
    }

    getProductName(id: number | undefined) {
        if (!id) return 'Producto desconocido';
        const product = this.products.find(p => p.productId === id);
        return product?.name ?? 'Producto desconocido';
    }

    onChangeStatus(promo: PromotionModel) {
        const newStatus = !promo.isActive;

        this.apiPromotionService.changeStatus(promo.promotionId, newStatus).subscribe({
            next: (updated) => {
                promo.isActive = updated.isActive;
                Swal.fire('Éxito', `Promoción ${newStatus ? 'activada' : 'desactivada'} correctamente`, 'success');
            },
            error: (err) => {
                console.error('Error al cambiar estado:', err);
                Swal.fire('Error', 'No se pudo cambiar el estado de la promoción', 'error');
            }
        });
    }

    // -------------------- Abrir modales --------------------

    openCreateModal() {
        this.editingPromotion = null;
        this.showFormModal = true;
    }

    openEditModal(promo: PromotionModel) {
        this.editingPromotion = promo;
        this.showFormModal = true;
    }

    openDeleteModal(promo: PromotionModel) {
        this.deletePromotion = promo;
        this.showDeleteModal = true;
    }

    // -------------------- Recepción de cambios --------------------

    saveCreatedPromotion(formData: any) {
        const newPromotion = new PromotionModel({
            name: formData.name,
            description: formData.description || '',
            discountPercent: formData.discountPercent,
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate),
            productId: formData.productId,
            isActive: true
        });

        this.apiPromotionService.create(newPromotion).subscribe({
            next: (created) => {
                this.promotions.push(created);
                Swal.fire('Éxito', 'Promoción creada correctamente', 'success');
            },
            error: (err) => {
                console.error('Error al crear promoción:', err);
                Swal.fire('Error', err?.message || 'No se pudo crear la promoción', 'error');
            }
        });
    }

    saveUpdatedPromotion(formData: any) {
        if (!this.editingPromotion) return;

        const updatedPromotion = new PromotionModel({
            ...this.editingPromotion,
            name: formData.name,
            description: formData.description,
            discountPercent: formData.discountPercent,
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate),
            productId: formData.productId,
            isActive: formData.isActive
        });

        this.apiPromotionService.update(updatedPromotion).subscribe({
            next: (updated) => {
                const index = this.promotions.findIndex(p => p.promotionId === updated.promotionId);
                if (index !== -1) {
                    this.promotions[index] = updated;
                }
                Swal.fire('Éxito', 'Promoción actualizada correctamente', 'success');
            },
            error: (err) => {
                console.error('Error al actualizar promoción:', err);
                Swal.fire('Error', err?.message || 'No se pudo actualizar la promoción', 'error');
            }
        });
    }

    deletePromotionLogic() {
        if (!this.deletePromotion) return;

        var status = this.promotions.find(p => p.promotionId === this.deletePromotion?.promotionId)?.isActive;

        this.apiPromotionService.changeStatus(this.deletePromotion.promotionId, !status).subscribe({
            next: () => {
                this.promotions = this.promotions.filter(p => p.promotionId !== this.deletePromotion?.promotionId);
                Swal.fire('Éxito', 'Promoción eliminada correctamente', 'success');
                this.showDeleteModal = false;
            },
            error: (err) => {
                console.error('Error al eliminar promoción:', err);
                Swal.fire('Error', 'No se pudo eliminar la promoción', 'error');
            }
        });
    }
}
