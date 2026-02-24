import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CategoryModel } from '../../shared/models/category.model';
import { ApiCategoryService } from '../../services/api-category.service';
import { SharedService } from '../../services/shared.service';
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
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder
    ) {
        this.categoryForm = this.fb.group({
            categoryId: [0],
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            isActive: [true]
        });
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

        if (this.statusFilter > 0) {

            if (this.statusFilter == 1) {
                this.categories = this.categories.filter(c => c.isActive);
            } else if (this.statusFilter == 2) {
                this.categories = this.categories.filter(c => !c.isActive);
            }
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
            return;
        }

        this.sharedService.setLoading(true);

        if (this.isEditing) {
            this._editCategory(this.categoryForm.value);
        } else {
            this._createCategory(this.categoryForm.value);
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

    // CREATE
    private _createCategory(data: CategoryModel) {

        this.apiCategoryService.create(data).subscribe({
            next: () => {
                this.showFormModal = false;
                this.loadCategories();
                this.sharedService.setLoading(false);
            },
            error: () => this.sharedService.setLoading(false)
        });
    }

    // UPDATE
    private _editCategory(data: CategoryModel) {

        this.apiCategoryService.update(data).subscribe({
            next: () => {
                this.showFormModal = false;
                this.loadCategories();
                this.sharedService.setLoading(false);
            },
            error: () => this.sharedService.setLoading(false)
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
            error: () => this.sharedService.setLoading(false)
        });
    }
}
