import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserModel } from '../../../shared/models/user.model';
import { RolModel } from '../../../shared/models/rol.model';
import { ApiUserService } from '../../../services/api-user.service';
import { ApiRolService } from '../../../services/api-role.service';
import { SharedService } from '../../../services/shared.service';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

    users: UserModel[] = [];
    roles: RolModel[] = [];
    usersOrigins: UserModel[] = [];
    userForm: FormGroup;

    // UI State
    showFormModal = false;
    showDeleteModal = false;
    isEditing = false;
    userToDelete: UserModel | null = null;
    searchTerm = '';

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
            passwordHash: ['', [Validators.required, Validators.minLength(8)]],
            roleId: [null, Validators.required],
            lastLoginAt: [null],
            isActive: [true]
        });
    }

    ngOnInit(): void {
        this.loadUsers();
        this.loadRoles();
    }

    loadRoles() {
        this.apiRolService.getAll().then(roles => {
            this.roles = roles;
        });
    }

    loadUsers() {

        this.sharedService.setLoading(true);

        this.apiUserService.getAll().then(
            (users: UserModel[]) => {

                this.users = users;
                this.usersOrigins = users;


                this.sharedService.setLoading(false);
                this.cdr.detectChanges();
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
        this.onFilterInfo();
    }

    onFilterInfo() {

        this.users = this.usersOrigins;

        if (!this.searchTerm || this.searchTerm.trim() === '') return;
        
        const term = this.searchTerm.toLowerCase();
        
        this.users = this.users.filter(s =>
            s.fullName?.toLowerCase().includes(term) ||
            s.email?.toLowerCase().includes(term) ||
            s.phone?.toLowerCase().includes(term) ||
            (
                s.lastLoginAt &&
                new Date(s.lastLoginAt)
                    .toLocaleString()
                    .toLowerCase()
                    .includes(term)
            ) ||
            (
                this.getRoleName(s.roleId)
                    ?.toLowerCase()
                    .includes(term)
            )
        );
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

        if(this.isEditing) {
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
