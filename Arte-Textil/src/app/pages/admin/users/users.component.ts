import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BulkImportComponent } from '../../../components/bulk-import/bulk-import.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { UserModel } from '../../../shared/models/user.model';
import { RolModel } from '../../../shared/models/rol.model';
import { ApiUserService } from '../../../services/api-user.service';
import { ApiRolService } from '../../../services/api-role.service';
import { SharedService } from '../../../services/shared.service';
import { NotificationService } from '../../../services/notification.service';
import { sortByDateDesc } from '../../../shared/utils/sort-by-date';
import {
    checkPasswordRequirements,
    PasswordRequirements,
    passwordPolicyValidator
} from '../../../shared/validators/password.validator';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [FormsModule, CommonModule, ReactiveFormsModule, BulkImportComponent, NgxPaginationModule],
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

    users: UserModel[] = [];
    roles: RolModel[] = [];
    usersOrigins: UserModel[] = [];
    filteredUsers: UserModel[] = [];
    userForm: FormGroup;

    page = 1;
    statusFilter: number = 1;
    searchTerm = '';

    // UI State
    showFormModal = false;
    showDeleteModal = false;
    isEditing = false;
    userToDelete: UserModel | null = null;

    constructor(
        private apiUserService: ApiUserService,
        private apiRolService: ApiRolService,
        private sharedService: SharedService,
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder
    ) {
        this.userForm = this.fb.group({
            userId: [0],
            fullName: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.minLength(8)]],
            passwordHash: ['', [Validators.required, passwordPolicyValidator]],
            roleId: [null, Validators.required],
            lastLoginAt: [null],
            isActive: [true]
        });
    }

    ngOnInit(): void {
        this.loadUsers();
    }

    get formErrors(): string[] {

        const errors: string[] = [];
        const controls = this.userForm.controls;

        if (controls['fullName'].touched && controls['fullName'].errors) {
            if (controls['fullName'].errors['required']) errors.push('El nombre completo es obligatorio.');
            if (controls['fullName'].errors['minlength']) errors.push('El nombre completo debe tener al menos 3 caracteres.');
        }

        if (controls['email'].touched && controls['email'].errors) {
            if (controls['email'].errors['required']) errors.push('El correo electrónico es obligatorio.');
            if (controls['email'].errors['email']) errors.push('El formato del correo no es válido.');
        }

        if (controls['phone'].touched && controls['phone'].errors) {
            if (controls['phone'].errors['required']) errors.push('El teléfono es obligatorio.');
            if (controls['phone'].errors['minlength']) errors.push('El teléfono debe tener al menos 8 caracteres.');
        }

        if (!this.isEditing && controls['passwordHash'].touched && controls['passwordHash'].errors) {
            if (controls['passwordHash'].errors['required']) errors.push('La contraseña es obligatoria.');
        }

        if (controls['roleId'].touched && controls['roleId'].errors) {
            if (controls['roleId'].errors['required']) errors.push('Debe seleccionar un rol.');
        }

        return errors;
    }

    loadRoles() {
        this.apiRolService.getAll().then(roles => {
            this.roles = roles;

            this.sharedService.setLoading(false);
            this.cdr.detectChanges();

        });
    }

    loadUsers() {

        this.sharedService.setLoading(true);

        this.apiUserService.getAll().then(
            (users: UserModel[]) => {

                this.usersOrigins = sortByDateDesc(users);
                this.users = this.usersOrigins;

                this.applyFilters();
                this.loadRoles();
            },
            (err: any) => {
                this.sharedService.setLoading(false);
                this.cdr.detectChanges();
            }
        );

    }

    getRoleName(roleId: number): string {
        const role = this.roles.find(r => r.roleId === roleId);
        return role ? role.name : 'Desconocido';
    }

    onSearch(event: any) {
        this.searchTerm = event.target.value;
        this.applyFilters();
    }

    applyFilters() {

        this.filteredUsers = [...this.usersOrigins];

        const filter = +this.statusFilter;

        if (filter === 1) {
            this.filteredUsers = this.filteredUsers.filter(u => u.isActive);
        } else if (filter === 2) {
            this.filteredUsers = this.filteredUsers.filter(u => !u.isActive);
        }

        if (this.searchTerm?.trim()) {
            const term = this.searchTerm.toLowerCase();
            this.filteredUsers = this.filteredUsers.filter(u =>
                u.fullName?.toLowerCase().includes(term) ||
                u.email?.toLowerCase().includes(term) ||
                u.phone?.toLowerCase().includes(term) ||
                this.getRoleName(u.roleId)?.toLowerCase().includes(term)
            );
        }

        this.page = 1;
        this.cdr.detectChanges();
    }

    // Checklist en vivo de los requisitos de contraseña.
    get passwordRequirements(): PasswordRequirements {
        return checkPasswordRequirements(this.userForm.get('passwordHash')?.value);
    }

    // ACTIONS
    openCreateModal() {
        this.isEditing = false;
        this.userForm.reset({ userId: 0, isActive: true });
        this._setPasswordValidators(true);
        this.showFormModal = true;
    }

    openEditModal(user: UserModel) {
        this.isEditing = true;
        this.userForm.patchValue({ ...user, passwordHash: '' });
        // Al editar, la contraseña es opcional: solo se valida si se escribe una nueva.
        this._setPasswordValidators(false);
        this.showFormModal = true;
    }

    private _setPasswordValidators(isRequired: boolean) {

        const passwordControl = this.userForm.get('passwordHash');

        passwordControl?.setValidators(
            isRequired
                ? [Validators.required, passwordPolicyValidator]
                : [passwordPolicyValidator]
        );

        passwordControl?.updateValueAndValidity();
    }

    saveUser() {
        if (this.userForm.invalid) {
            this.userForm.markAllAsTouched();
            return;
        }

        this.sharedService.setLoading(true);

        const userData: UserModel = {
            ...this.userForm.value,
            phone: String(this.userForm.value.phone ?? '')
        };

        if (this.isEditing) {
            this._editUser(userData);
        } else {
            this._createUser(userData);
        }
    }

    // DELETE
    openDeleteModal(user: UserModel) {
        this.userToDelete = user;
        this.showDeleteModal = true;
    }

    confirmDelete() {

        if (this.userToDelete) {

            this._updateUserStatus(this.userToDelete.userId, !this.userToDelete.isActive);
        }
    }

    private _createUser(userData: UserModel) {

        this.apiUserService.create(userData).then(
            (users: UserModel) => {

                this.showFormModal = false;
                this.loadUsers();

                this.sharedService.setLoading(false);
            },
            (err: any) => {
                this.sharedService.setLoading(false);
                this.notificationService.error(err?.message || 'Error al crear el usuario. Intente de nuevo.');
            }
        );
    }

    private _editUser(userData: UserModel) {

        this.apiUserService.update(userData).then(
            (users: UserModel) => {

                this.showFormModal = false;
                this.loadUsers();

                this.sharedService.setLoading(false);
            },
            (err: any) => {
                this.sharedService.setLoading(false);
                this.notificationService.error(err?.message || 'Error al actualizar el usuario. Intente de nuevo.');
            }
        );
    }

    private _updateUserStatus(userId: number, isActive: boolean) {

        this.sharedService.setLoading(true);

        this.apiUserService.updateStatus(userId, isActive).then(
            () => {

                this.showDeleteModal = false;
                this.userToDelete = null;
                this.loadUsers();

                this.notificationService.success(
                    isActive
                        ? 'Usuario activado correctamente.'
                        : 'Usuario desactivado correctamente.'
                );

                this.sharedService.setLoading(false);
            },
            (err: any) => {
                this.sharedService.setLoading(false);
                this.notificationService.error(err?.message || 'Error al cambiar el estado del usuario. Intente de nuevo.');
            }
        );
    }
}
