import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../../services/user.service';
import { RoleService, Role } from '../../../services/role.service';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

    users: User[] = [];
    roles: Role[] = [];

    // Filters
    selectedRoleFilter: number | string = 'Todos';

    // Modal State
    showFormModal = false;
    showDeleteModal = false;

    // Edit/Create State
    isEditing = false;
    currentUser: User = this.getEmptyUser();

    constructor(
        private userService: UserService,
        private roleService: RoleService
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData() {
        this.users = this.userService.getUsers();
        this.roles = this.roleService.getRoles();
    }

    get filteredUsers() {
        if (this.selectedRoleFilter === 'Todos') {
            return this.users;
        }
        return this.users.filter(u => u.roleId === +this.selectedRoleFilter);
    }

    getRoleName(roleId: number): string {
        const role = this.roles.find(r => r.roleId === roleId);
        return role ? role.name : 'Desconocido';
    }

    getEmptyUser(): User {
        return {
            userId: 0,
            fullName: '',
            email: '',
            roleId: 0, // Invalid initially to force selection
            phone: '',
            isActive: true,
            password: ''
        };
    }

    // ======================================
    // ACTIONS
    // ======================================

    openCreateModal() {
        this.isEditing = false;
        this.currentUser = this.getEmptyUser();
        // Set default role if available
        if (this.roles.length > 0) {
            this.currentUser.roleId = this.roles[0].roleId;
        }
        this.showFormModal = true;
    }

    openEditModal(user: User) {
        this.isEditing = true;
        // Clone to avoid direct mutation before save
        this.currentUser = { ...user };
        this.showFormModal = true;
    }

    closeFormModal() {
        this.showFormModal = false;
    }

    saveUser() {
        // Basic Validation
        if (!this.currentUser.fullName || !this.currentUser.email) {
            alert('Por favor complete el nombre y el correo.');
            return;
        }

        try {
            if (this.isEditing) {
                this.userService.updateUser(this.currentUser);
                alert('Usuario actualizado correctamente.');
            } else {
                this.userService.createUser(this.currentUser);
                alert('Usuario creado correctamente.');
            }
            this.loadData(); // Refresh list
            this.closeFormModal();
        } catch (error: any) {
            alert(error.message || 'Ocurrió un error al guardar el usuario.');
        }
    }

    // ======================================
    // DELETE / DEACTIVATE
    // ======================================

    userToDelete: User | null = null;

    openDeleteConfirmation(user: User) {
        this.userToDelete = user;
        this.showDeleteModal = true;
    }

    confirmDelete() {
        if (this.userToDelete) {
            this.userService.deleteUser(this.userToDelete.userId);
            this.loadData();
            this.userToDelete = null;
            this.showDeleteModal = false;
        }
    }

    closeDeleteModal() {
        this.userToDelete = null;
        this.showDeleteModal = false;
    }
}
