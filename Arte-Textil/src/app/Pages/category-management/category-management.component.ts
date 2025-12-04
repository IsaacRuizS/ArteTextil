import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-category-management',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './category-management.component.html',
    styleUrls: ['./category-management.component.scss']
})
export class CategoryManagementComponent {

    categories: { name: string; active: boolean }[] = [
        { name: 'Camisas', active: true },
        { name: 'Pantalones', active: true },
        { name: 'Uniformes', active: false }
    ];

    newCategory = '';
    errorMsg = '';
    successMsg = '';

    selectedStatus = 0;

    createCategory() {
        this.errorMsg = '';
        this.successMsg = '';

        if (!this.newCategory.trim()) {
            this.errorMsg = 'El nombre de la categoría es obligatorio.';
            return;
        }

        if (this.categories.some(c => c.name.toLowerCase() === this.newCategory.trim().toLowerCase())) {
            this.errorMsg = 'La categoría ya existe.';
            return;
        }

        this.categories.push({ name: this.newCategory.trim(), active: true });
        this.successMsg = 'Categoría creada correctamente.';
        this.newCategory = '';
    }

    toggleActive(category: any) {
        category.active = !category.active;
    }

}
