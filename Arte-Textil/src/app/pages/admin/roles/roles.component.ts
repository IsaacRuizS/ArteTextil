import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { RolModel } from '../../../shared/models/rol.model';
import { ApiRolService } from '../../../services/api-role.service';
import { SharedService } from '../../../services/shared.service';

@Component({
    selector: 'app-roles',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule],
    templateUrl: './roles.component.html',
    styleUrls: ['./roles.component.scss']
})

export class RolesComponent implements OnInit {

    roles: RolModel[] = [];
    rolesOrigins: RolModel[] = [];
    filteredRoles: RolModel[] = [];
    rolForm: FormGroup;

    page = 1;
    statusFilter: number = 1; // 0 todos, 1 activos, 2 inactivos
    searchTerm = '';

    // UI State
    showFormModal = false;
    showDeleteModal = false;
    isEditing = false;
    RolToDelete: RolModel | null = null;

    constructor(
        private apiRolService: ApiRolService,
        private sharedService: SharedService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder
    ) {
        this.rolForm = this.fb.group({
            roleId: [0],
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required, Validators.minLength(3)]],
            isActive: [true]
        });
    }

    ngOnInit(): void {
        this.loadRoles();
    }

    loadRoles() {

        this.sharedService.setLoading(true);

        this.apiRolService.getAll().then(
            (Roles: RolModel[]) => {

                this.roles = Roles;
                this.rolesOrigins = Roles;

                this.applyFilters();

                this.sharedService.setLoading(false);
                this.cdr.detectChanges();
            },
            (err: any) => {
                this.sharedService.setLoading(false);
                this.cdr.detectChanges();
            }
        );

    } 

    onSearch(event: any) {
        this.searchTerm = event.target.value;
        this.applyFilters();
    }

    applyFilters() {

        this.filteredRoles = [...this.rolesOrigins];

        const filter = +this.statusFilter;

        if (filter === 1) {
            this.filteredRoles = this.filteredRoles.filter(r => r.isActive);
        } else if (filter === 2) {
            this.filteredRoles = this.filteredRoles.filter(r => !r.isActive);
        }

        if (this.searchTerm?.trim()) {
            const term = this.searchTerm.toLowerCase();
            this.filteredRoles = this.filteredRoles.filter(r =>
                r.name.toLowerCase().includes(term) ||
                r.description.toLowerCase().includes(term)
            );
        }

        this.page = 1;
        this.cdr.detectChanges();
    }

    // ACTIONS
    openCreateModal() {
        this.isEditing = false;
        this.rolForm.reset({ roleId: 0, isActive: true });
        this.showFormModal = true;
    }

    openEditModal(Rol: RolModel) {
        this.isEditing = true;
        this.rolForm.patchValue(Rol);
        this.showFormModal = true;
    } 

    saveRol() {
        if (this.rolForm.invalid) {
            this.rolForm.markAllAsTouched();
            return;
        }
        
        this.sharedService.setLoading(true);

        if(this.isEditing) {
            this._editRol(this.rolForm.value);
        } else {
            this._createRol(this.rolForm.value);
        }
    } 

    // DELETE
    openDeleteModal(Rol: RolModel) {
        this.RolToDelete = Rol;
        this.showDeleteModal = true;
    }

    confirmDelete() {

        if (this.RolToDelete) {

            this._deleteRol(this.RolToDelete.roleId); 
        }
    }

    private _createRol(RolData: RolModel) {

        this.apiRolService.create(RolData).then(
            (Roles: RolModel) => {

                this.showFormModal = false;
                this.loadRoles();

                this.sharedService.setLoading(false);
            },
            (err: any) => {
                this.sharedService.setLoading(false);
            }
        );
    }

    private _editRol(RolData: RolModel) {

        this.apiRolService.update(RolData).then(
            (Roles: RolModel) => {

                this.showFormModal = false;
                this.loadRoles();

                this.sharedService.setLoading(false);
            },
            (err: any) => {
                this.sharedService.setLoading(false);
            }
        );
    }

    private _deleteRol(RolId: number) {

        let status = this.rolesOrigins.find(c => c.roleId === RolId)?.isActive;

        this.apiRolService.updateStatus(RolId, !status).then(
            (deleted: boolean) => {
                
                this.showDeleteModal = false;
                this.RolToDelete = null;
                this.loadRoles();

                this.sharedService.setLoading(false);
            },
            (err: any) => {
                this.sharedService.setLoading(false);
            }
        );
    }
}
