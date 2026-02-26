import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';

import { PromotionFormModal } from './components/promotion-form-modal';
import { ApiPromotionService } from '../../services/api-promotion.service';
import { ApiProductService } from '../../services/api-product.service';
import { PromotionModel } from '../../shared/models/promotion.model';
import { ProductModel } from '../../shared/models/product.model';
import { SharedService } from '../../services/shared.service';

@Component({
    selector: 'app-promotion',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        NgxPaginationModule,
        PromotionFormModal
    ],
    templateUrl: './promotion.component.html',
    styleUrls: ['./promotion.component.scss'],
})
export class PromotionComponent implements OnInit {

    products: ProductModel[] = [];

    promotions: PromotionModel[] = [];
    promotionsOrigins: PromotionModel[] = [];

    // UI
    showFormModal = false;
    showDeleteModal = false;
    editingPromotion: PromotionModel | null = null;
    promotionToDelete: PromotionModel | null = null;

    // Filters
    searchTerm = '';
    statusFilter = 1; // 0 all, 1 active, 2 inactive
    page = 1;

    constructor(
        private apiPromotionService: ApiPromotionService,
        private apiProductService: ApiProductService,
        private sharedService: SharedService,
        private cdr: ChangeDetectorRef,
    ) { }

    ngOnInit() {
        this.loadProducts();
        this.loadPromotions();
    }

    loadProducts() {
        this.apiProductService.getAll().subscribe({
            next: data => this.products = data,
            error: () => Swal.fire('Error', 'No se pudieron cargar los productos', 'error')
        });
    }

    loadPromotions() {

        this.sharedService.setLoading(true);

        this.apiPromotionService.getAll().subscribe({
            next: data => {
                this.promotions = data;
                this.promotionsOrigins = data;
                this.onFilterInfo();
                this.sharedService.setLoading(false);
                this.cdr.markForCheck();
            },
            error: () => {
                this.sharedService.setLoading(false);
                Swal.fire('Error', 'No se pudieron cargar las promociones', 'error');
            }
        });
    }

    getProductName(id?: number) {
        if (!id) return 'Producto desconocido';
        return this.products.find(p => p.productId === id)?.name ?? 'Producto desconocido';
    }

    // FILTERS
    onSearch(event: any) {
        this.searchTerm = event.target.value;
        this.onFilterInfo();
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

    onStatusChanged() {
        this.onFilterInfo();
    }

    onFilterInfo() {

        let data = this.promotionsOrigins;

        if (this.statusFilter == 1) {
            data = data.filter(p => p.isActive);
        } else if (this.statusFilter == 2) {
            data = data.filter(p => !p.isActive);
        }

        if (this.searchTerm?.trim()) {
            const term = this.searchTerm.toLowerCase();
            data = data.filter(p =>
                p.name.toLowerCase().includes(term) ||
                this.getProductName(p.productId).toLowerCase().includes(term)
            );
        }

        this.promotions = data;
        this.page = 1;
        this.cdr.markForCheck();
    }

    // ACTIONS
    openCreateModal() {
        this.editingPromotion = null;
        this.showFormModal = true;
    }

    openEditModal(promo: PromotionModel) {
        this.editingPromotion = promo;
        this.showFormModal = true;
    }

    openDeleteModal(promo: PromotionModel) {
        this.promotionToDelete = promo;
        this.showDeleteModal = true;
    }

    confirmDelete() {
        if (!this.promotionToDelete) return;

        const newStatus = !this.promotionToDelete.isActive;

        this.sharedService.setLoading(true);

        this.apiPromotionService
            .changeStatus(this.promotionToDelete.promotionId, newStatus)
            .subscribe({
                next: () => {
                    this.showDeleteModal = false;
                    this.promotionToDelete = null;
                    this.loadPromotions();
                },
                error: () => {
                    this.sharedService.setLoading(false);
                    Swal.fire('Error', 'No se pudo modificar la promoción', 'error');
                }
            });
    }

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
                this.showFormModal = false;
                this.loadPromotions();
                Swal.fire('Éxito', 'Promoción creada correctamente', 'success');
            },
            error: () => Swal.fire('Error', 'No se pudo crear la promoción', 'error')
        });
    }

    saveUpdatedPromotion(formData: any) {

        const promo = new PromotionModel({
            ...this.editingPromotion,
            ...formData
        });

        this.apiPromotionService.update(promo).subscribe({
            next: () => {
                this.showFormModal = false;
                this.loadPromotions();
                Swal.fire('Éxito', 'Promoción actualizada correctamente', 'success');
            },
            error: () => Swal.fire('Error', 'No se pudo actualizar la promoción', 'error')
        });
    }
}
