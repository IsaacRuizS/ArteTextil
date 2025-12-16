import { Injectable } from '@angular/core';

export interface Role {
    roleId: number;
    name: string;
    description: string;
    isActive: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class RoleService {

    private roles: Role[] = [
        { roleId: 1, name: 'Admin', description: 'Acceso total al sistema', isActive: true },
        { roleId: 2, name: 'Gerente', description: 'Acceso a reportes y supervisión', isActive: true }
    ];

    constructor() { }

    getRoles() {
        return this.roles;
    }

    getRoleById(id: number) {
        return this.roles.find(r => r.roleId === id);
    }
}
