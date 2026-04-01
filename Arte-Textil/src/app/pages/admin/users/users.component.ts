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
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder
    ) {
        this.userForm = this.fb.group({
            userId: [0],
            fullName: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.minLength(8)]],
            passwordHash: ['',],
            roleId: [null, Validators.required],
            lastLoginAt: [null],
            isActive: [true]
        });
    }

    ngOnInit(): void {
        this.loadUsers();
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

                this.users = users;
                this.usersOrigins = users;

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

    // ACTIONS
    openCreateModal() {
        this.isEditing = false;
        this.userForm.reset({ userId: 0, isActive: true });
        this.showFormModal = true;
    }

    openEditModal(user: UserModel) {
        this.isEditing = true;
        this.userForm.patchValue(user);
        this.showFormModal = true;
    }

    saveUser() {
        if (this.userForm.invalid) {
            this.userForm.markAllAsTouched();
            return;
        }

        this.sharedService.setLoading(true);

        if (this.isEditing) {
            this._editUser(this.userForm.value);
        } else {
            this._createUser(this.userForm.value);
        }
    }

    // DELETE
    openDeleteModal(user: UserModel) {
        this.userToDelete = user;
        this.showDeleteModal = true;
    }

    confirmDelete() {

        if (this.userToDelete) {

            this._deleteUser(this.userToDelete.userId);
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
            }
        );
    }

    private _deleteUser(userId: number) {

        this.apiUserService.delete(userId).then(
            (deleted: boolean) => {

                this.showDeleteModal = false;
                this.userToDelete = null;
                this.loadUsers();

                this.sharedService.setLoading(false);
            },
            (err: any) => {
                this.sharedService.setLoading(false);
            }
        );
    }
}
