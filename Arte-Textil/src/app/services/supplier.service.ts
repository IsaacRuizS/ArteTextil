import { Injectable } from '@angular/core';

export interface Supplier {
    supplierId: number;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    isActive: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class SupplierService {

    private suppliers: Supplier[] = [
        { supplierId: 1, name: 'Textiles del Este', contactPerson: 'Juan Pérez', email: 'juan@textileseste.com', phone: '2222-3333', isActive: true },
        { supplierId: 2, name: 'Hilos y Agujas SA', contactPerson: 'María García', email: 'ventas@hilosyagujas.com', phone: '4444-5555', isActive: true },
        { supplierId: 3, name: 'Importadora Global', contactPerson: 'Carlos Ruiz', email: 'cruiz@globalimp.com', phone: '8888-9999', isActive: true }
    ];

    getSuppliers() {
        return this.suppliers;
    }

    saveSupplier(supplier: Supplier) {
        if (supplier.supplierId === 0) {
            // Create
            const newId = this.suppliers.length > 0 ? Math.max(...this.suppliers.map(s => s.supplierId)) + 1 : 1;
            this.suppliers.push({ ...supplier, supplierId: newId, isActive: true });
        } else {
            // Update
            const index = this.suppliers.findIndex(s => s.supplierId === supplier.supplierId);
            if (index !== -1) {
                this.suppliers[index] = { ...this.suppliers[index], ...supplier };
            }
        }
    }

    deleteSupplier(id: number) {
        const supplier = this.suppliers.find(s => s.supplierId === id);
        if (supplier) {
            supplier.isActive = false;
        }
    }
}
