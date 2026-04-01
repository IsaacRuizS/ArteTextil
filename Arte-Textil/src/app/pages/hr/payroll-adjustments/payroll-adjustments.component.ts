import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { UserModel } from '../../../shared/models/user.model';
import { PayrollAdjustmentModel } from '../../../shared/models/payroll-adjustment.model';
import { ApiPayrollAdjustmentService } from '../../../services/api-payroll-adjustment.service';
import { ApiUserService } from '../../../services/api-user.service';
import { SharedService } from '../../../services/shared.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { CustomCurrencyPipe } from '../../../shared/pipes/crc-currency.pipe';
import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'app-payroll-adjustments',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule, CustomCurrencyPipe],
    providers: [FormBuilder],
    templateUrl: './payroll-adjustments.component.html',
    styleUrls: ['./payroll-adjustments.component.scss']
})
export class PayrollAdjustmentsComponent implements OnInit {

    adjustments: PayrollAdjustmentModel[] = [];
    adjustmentsOrigin: PayrollAdjustmentModel[] = [];
    users: any[] = [];
    page = 1;

    adjustmentForm: FormGroup;

    showFormModal = false;
    showDeleteModal = false;
    adjustmentToDelete: PayrollAdjustmentModel | null = null;
    searchTerm = '';

    isAdmin = false;

    messageText: string = '';
    modalType: 'success' | 'error' = 'error';
    showMessageModal = false;

    constructor(
        private apiAdjustment: ApiPayrollAdjustmentService,
        private apiUser: ApiUserService,
        private sharedService: SharedService,
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder
    ) {
        this.adjustmentForm = this.fb.group({
            adjustmentId: [0],
            userId: ['', Validators.required],
            amount: ['', Validators.required],
            type: ['Extra', Validators.required],
            reason: [''],
            month: ['', Validators.required]
        });
    }

    ngOnInit(): void {

        // detectar rol desde token
        const token = localStorage.getItem('auth_token');
        if (token) {
            const payload: any = JSON.parse(atob(token.split('.')[1]));
            this.isAdmin = payload?.roleId === "1";
        }

        this.loadUsers();
        this.loadAdjustments();
    }

    // cargar los usuarios (dropdown)
    loadUsers() {

        this.apiUser.getAll()
            .then((users) => {
                this.users = users;
                this.cdr.markForCheck();
            })
            .catch(() => {
                this.notificationService.error('Error al cargar los usuarios');
            });
    }

    // cargar los ajustes
    loadAdjustments() {

        this.sharedService.setLoading(true);

        const request = this.isAdmin
            ? this.apiAdjustment.getAll()      // admin ve todo
            : this.apiAdjustment.getMine();   // usuario/colaborador ve lo suyo

        request.subscribe({
            next: (data: PayrollAdjustmentModel[]) => {
                this.adjustments = data;
                this.adjustmentsOrigin = data;
                this.cdr.markForCheck();
                this.sharedService.setLoading(false);
            },
            error: () => {
                this.notificationService.error('Error al cargar los ajustes de nómina');
                this.sharedService.setLoading(false);
            }
        });
    }

    // buscador
    onSearch(event: any) {
        this.searchTerm = event.target.value;
        this.onFilter();
    }

    onFilter() {

        const source = [...this.adjustmentsOrigin];

        if (!this.searchTerm || this.searchTerm.trim() === '') {
            this.adjustments = source;
            return;
        }

        const term = this.searchTerm.toLowerCase();

        this.adjustments = source.filter(a =>
            (a.userName && a.userName.toLowerCase().includes(term))
            || a.userId.toString().includes(term)
            || a.type.toLowerCase().includes(term)
        );
    }

    // modal crear
    openCreateModal() {
        this.adjustmentForm.reset({
            adjustmentId: 0,
            type: 'Extra',
            month: ''
        });
        this.showFormModal = true;
    }

    // crear ajuste
    saveAdjustment() {

        if (this.adjustmentForm.invalid) {
            this.adjustmentForm.markAllAsTouched();
            return;
        }

        const monthValue = this.adjustmentForm.value.month;

        if (!monthValue) {
            this.showModal("Seleccione un mes", 'error');
            return;
        }

        const [year, month] = monthValue.split('-');

        const payload = {
            ...this.adjustmentForm.value,
            year: Number(year),
            month: Number(month)
        };

        this.sharedService.setLoading(true);

        this.apiAdjustment.create(payload).subscribe({

            next: (res: any) => {

                if (!res.success) {
                    this.showModal(res.message, 'error');
                    return;
                }

                this.showFormModal = false;
                this.adjustmentForm.reset({ type: 'Extra' });

                this.showModal('Ajuste creado correctamente', 'success');

                this.loadAdjustments();
                this.sharedService.setLoading(false);
            },

            error: (err) => {

                this.sharedService.setLoading(false);

                const msg = err?.error?.message || 'Error';

                this.showMessageModal = true;
                this.messageText = msg;
                this.modalType = 'error';
            }

        });
    }

    // modal para error
    showModal(message: string, type: 'success' | 'error' = 'error') {

        this.messageText = message;
        this.modalType = type;
        this.showMessageModal = true;
    }

    closeModal() {
        this.showMessageModal = false;
    }

    // eliminar
    openDeleteModal(adj: PayrollAdjustmentModel) {
        this.adjustmentToDelete = adj;
        this.showDeleteModal = true;
    }

    confirmDelete() {

        if (!this.adjustmentToDelete) return;

        this.sharedService.setLoading(true);

        this.apiAdjustment.delete(this.adjustmentToDelete.adjustmentId).subscribe({
            next: () => {
                this.showDeleteModal = false;
                this.adjustmentToDelete = null;
                this.loadAdjustments();
                this.sharedService.setLoading(false);
            },
            error: () => {
                this.notificationService.error('Error al eliminar el ajuste de nómina');
                this.sharedService.setLoading(false);
            }
        });
        this.showModal(
            this.adjustmentToDelete?.isActive
                ? 'Ajuste ocultado correctamente'
                : 'Ajuste activado correctamente',
            'success'
        );
    }
}