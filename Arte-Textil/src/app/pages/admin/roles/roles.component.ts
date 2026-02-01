import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Role {
    roleId: number;
    name: string;
    description: string;
    isActive: boolean;
}

@Component({
    selector: 'app-roles',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './roles.component.html',
    styleUrls: ['./roles.component.scss']
})
export class RolesComponent {

    searchTerm: string = '';

    // Mock data matching DB schema
    roles: Role[] = [
        { roleId: 1, name: 'Admin', description: 'Acceso total al sistema', isActive: true },
        { roleId: 2, name: 'Colaborador', description: 'Acceso a ventas y clientes', isActive: true }
    ];

    get filteredRoles() {
        if (!this.searchTerm) return this.roles;

        return this.roles.filter(r =>
            r.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    onDeactivate(role: Role) {
        if (confirm(`¿Está seguro que desea desactivar el rol "${role.name}"?`)) {
            try {
                // Simulate API call
                role.isActive = false;
                alert('El rol ha sido desactivado correctamente.');
            } catch (error) {
                console.error(error);
                alert('Ocurrió un error al intentar desactivar el rol.');
            }
        }
    }
}
