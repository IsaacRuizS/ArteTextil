import { Injectable } from '@angular/core';

export interface User {
    userId: number;
    fullName: string;
    email: string;
    roleId: number;
    phone?: string;
    isActive: boolean;
    password?: string; // Optional for UI listing, required for creation
}

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private users: User[] = [
        { userId: 1, fullName: 'Carlos Admin', email: 'admin@artetextil.com', roleId: 1, phone: '8888-8888', isActive: true },
        { userId: 2, fullName: 'Ana Vendedora', email: 'ana@artetextil.com', roleId: 3, phone: '7777-7777', isActive: true },
        { userId: 3, fullName: 'Pedro Almacén', email: 'pedro@artetextil.com', roleId: 4, phone: '6666-6666', isActive: true }
    ];

    constructor() { }

    getUsers() {
        return this.users;
    }

    createUser(user: User) {
        // Mock ID generation
        const newId = this.users.length > 0 ? Math.max(...this.users.map(u => u.userId)) + 1 : 1;

        // Mock duplicate email check
        if (this.users.some(u => u.email === user.email)) {
            throw new Error('El correo electrónico ya está registrado.');
        }

        const newUser = { ...user, userId: newId, isActive: true };
        this.users.push(newUser);
        return newUser;
    }

    updateUser(user: User) {
        const index = this.users.findIndex(u => u.userId === user.userId);
        if (index !== -1) {
            // Check for unique email if changed
            if (this.users.some(u => u.email === user.email && u.userId !== user.userId)) {
                throw new Error('El correo electrónico ya está en uso por otro usuario.');
            }

            this.users[index] = { ...this.users[index], ...user };
            return this.users[index];
        }
        throw new Error('Usuario no encontrado');
    }

    deleteUser(userId: number) {
        const user = this.users.find(u => u.userId === userId);
        if (user) {
            user.isActive = false;
        }
    }
}
