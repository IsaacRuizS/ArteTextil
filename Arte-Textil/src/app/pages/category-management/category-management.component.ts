import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CategoryModel } from '../../shared/models/category.model';
import { ApiCategoryService } from '../../services/api-category.service';
import { SharedService } from '../../services/shared.service';
import { NotificationService } from '../../services/notification.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
    selector: 'app-category-management',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule, FormsModule],
    providers: [FormBuilder],
    templateUrl: './category-management.component.html',
    styleUrls: ['./category-management.component.scss']
})
export class CategoryManagementComponent implements OnInit {

    categories: CategoryModel[] = [];
    categoriesOrigins: CategoryModel[] = [];
    categoryForm: FormGroup;

    showFormModal = false;
    showDeleteModal = false;
    isEditing = false;
    categoryToDelete: CategoryModel | null = null;
    searchTerm = '';

    statusFilter: number = 1; // 0: all, 1: active, 2: inactive

    page = 1;

    constructor(
        private apiCategoryService: ApiCategoryService,
        private sharedService: SharedService,
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder
    ) {
        this.categoryForm = this.fb.group({
            categoryId: [0],
            name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
            description: ['', [Validators.maxLength(250)]],
            isActive: [true]
        });
    }

    // Valida que no exista otra categoría activa con el mismo nombre.
    private _isDuplicateName(name: string, categoryId: number): boolean {

        const normalized = name.trim().toLowerCase();

        return this.categoriesOrigins.some(c =>
            c.categoryId !== categoryId &&
            (c.name ?? '').trim().toLowerCase() === normalized
        );
    }

    // Para deshabilitar el botón Guardar.
    get hasDuplicateName(): boolean {

        const name = (this.categoryForm.get('name')?.value ?? '').trim();

        if (!name) return false;

        return this._isDuplicateName(name, this.categoryForm.get('categoryId')?.value ?? 0);
    }

    // Para mostrar el mensaje solo después de que el usuario tocó el campo.
    get duplicateNameError(): boolean {
        return !!this.categoryForm.get('name')?.touched && this.hasDuplicateName;
    }

    ngOnInit(): void {
        this.loadCategories();
    }

    // LOAD
    loadCategories() {

        this.sharedService.setLoading(true);

        this.apiCategoryService.getAll().subscribe({
            next: (categories: CategoryModel[]) => {

                this.categories = categories;
                this.categoriesOrigins = categories;

                this.onFilterInfo();

                this.cdr.markForCheck();
                this.sharedService.setLoading(false);
            },
            error: () => {
                this.notificationService.error('Error al cargar las categorías. Intente de nuevo.');
                this.sharedService.setLoading(false);
            }
        });
    }

    onSearch(event: any) {
        this.searchTerm = event.target.value;
        this.onFilterInfo();
    }

    onStatusChanged() {

        this.onFilterInfo();
    }

    onFilterInfo() {

        this.categories = this.categoriesOrigins;

        const filter = +this.statusFilter;

        if (filter === 1) {
            this.categories = this.categories.filter(c => c.isActive);
        } else if (filter === 2) {
            this.categories = this.categories.filter(c => !c.isActive);
        }

        if (this.searchTerm != null && this.searchTerm.trim() != '') {
            
            const term = this.searchTerm.toLowerCase();

            this.categories = this.categories.filter(c =>
                c.name.toLowerCase().includes(term) ||
                (c.description ?? '').toLowerCase().includes(term)
            );
        }
        
        this.page = 1;

        this.cdr.markForCheck();

        
    }

    // ACTIONS
    openCreateModal() {
        this.isEditing = false;
        this.categoryForm.reset({ categoryId: 0, isActive: true });
        this.showFormModal = true;
    }

    openEditModal(category: CategoryModel) {
        this.isEditing = true;
        this.categoryForm.patchValue(category);
        this.showFormModal = true;
    }

    saveCategory() {

        if (this.categoryForm.invalid) {
            this.categoryForm.markAllAsTouched();
            this.notificationService.warning('Revise los campos marcados antes de guardar.');
            return;
        }

        const name = (this.categoryForm.get('name')?.value ?? '').trim();
        const categoryId = this.categoryForm.get('categoryId')?.value ?? 0;

        if (this._isDuplicateName(name, categoryId)) {
            this.categoryForm.get('name')?.markAsTouched();
            this.notificationService.error(`Ya existe una categoría llamada "${name}".`);
            return;
        }

        this.sharedService.setLoading(true);

        const data = { ...this.categoryForm.value, name };

        if (this.isEditing) {
            this._editCategory(data);
        } else {
            this._createCategory(data);
        }
    }

    openDeleteModal(category: CategoryModel) {
        this.categoryToDelete = category;
        this.showDeleteModal = true;
    }

    confirmDelete() {

        if (this.categoryToDelete) {
            this._deleteCategory(this.categoryToDelete.categoryId);
        }
    }

    // RF-04 – Exportar Excel (CSV compatible)
    onGenerateExcel() {
        const headers = ['Nombre', 'Descripción', 'Estado'];
        const rows = this.categories.map(c => [
            c.name,
            c.description ?? '',
            c.isActive ? 'Activa' : 'Inactiva'
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
            .join('\r\n');

        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `categorias_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // CREATE
    private _createCategory(data: CategoryModel) {

        this.apiCategoryService.create(data).subscribe({
            next: () => {
                this.showFormModal = false;
                this.loadCategories();
                this.notificationService.success(`Categoría "${data.name}" creada correctamente.`);
                this.sharedService.setLoading(false);
            },
            error: (err) => {
                this.notificationService.error(
                    err?.error?.message || err?.message || 'Error al crear la categoría. Intente de nuevo.');
                this.sharedService.setLoading(false);
            }
        });
    }

    // UPDATE
    private _editCategory(data: CategoryModel) {

        this.apiCategoryService.update(data).subscribe({
            next: () => {
                this.showFormModal = false;
                this.loadCategories();
                this.notificationService.success(`Categoría "${data.name}" actualizada correctamente.`);
                this.sharedService.setLoading(false);
            },
            error: (err) => {
                this.notificationService.error(
                    err?.error?.message || err?.message || 'Error al actualizar la categoría. Intente de nuevo.');
                this.sharedService.setLoading(false);
            }
        });
    }

    // DELETE
    private _deleteCategory(categoryId: number) {

        var status = this.categoriesOrigins.find(c => c.categoryId === categoryId)?.isActive;

        this.apiCategoryService.updateStatus(categoryId, !status).subscribe({
            next: () => {
                this.showDeleteModal = false;
                this.categoryToDelete = null;
                this.loadCategories();
                this.sharedService.setLoading(false);
            },
            error: () => {
                this.notificationService.error('Error al cambiar el estado de la categoría. Intente de nuevo.');
                this.sharedService.setLoading(false);
            }
        });
    }
}
