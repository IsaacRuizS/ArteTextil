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
import { NgZone } from '@angular/core';
import { sortUsersByName } from '../../../shared/utils/sort-users';

import { sortByDateDesc } from '../../../shared/utils/sort-by-date';
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

    // Tope de seguridad para evitar montos escritos por error (ej. un cero de más).
    readonly MAX_AMOUNT = 10_000_000;

    // Un ajuste no puede registrarse para un mes futuro.
    readonly maxMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    constructor(
        private apiAdjustment: ApiPayrollAdjustmentService,
        private apiUser: ApiUserService,
        private sharedService: SharedService,
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        private ngZone: NgZone,
    ) {
        this.adjustmentForm = this.fb.group({
            adjustmentId: [0],
            userId: ['', Validators.required],
            amount: ['', [Validators.required, Validators.min(1), Validators.max(this.MAX_AMOUNT)]],
            type: ['Extra', Validators.required],
            reason: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(250)]],
            month: ['', [Validators.required]]
        });
    }

    get isFutureMonth(): boolean {
        const month = this.adjustmentForm?.get('month')?.value;
        return !!month && month > this.maxMonth;
    }

    get canSubmit(): boolean {
        return this.adjustmentForm.valid && !this.isFutureMonth;
    }

    ngOnInit(): void {

        // detectar rol desde token
        const token = localStorage.getItem('auth_token');
        if (token) {
            const payload: any = JSON.parse(atob(token.split('.')[1]));
            this.isAdmin = payload?.roleId === "1";
        }

        if (this.isAdmin) {
            this.loadUsers();
        }
        this.loadAdjustments();
    }

    // cargar los usuarios (dropdown)
    loadUsers() {

        this.apiUser.getAll()
            .then((users) => {
                this.users = sortUsersByName(users.filter(u => u.isActive));
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
                this.adjustmentsOrigin = sortByDateDesc(data);
                this.adjustments = this.adjustmentsOrigin;
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
            userId: '',
            amount: '',
            type: 'Extra',
            reason: '',
            month: ''
        });
        this.showFormModal = true;
    }

    // Primer error pendiente, con el detalle de qué corregir.
    private getFormError(): string {

        const controls = this.adjustmentForm.controls;

        if (controls['userId'].errors?.['required']) {
            return 'Debe seleccionar el colaborador al que se aplica el ajuste.';
        }

        if (controls['amount'].errors?.['required']) {
            return 'Debe indicar el monto del ajuste.';
        }

        if (controls['amount'].errors?.['min']) {
            return 'El monto debe ser mayor que cero. Para descontar dinero use el tipo "Rebajo".';
        }

        if (controls['amount'].errors?.['max']) {
            return `El monto no puede superar ₡${this.MAX_AMOUNT.toLocaleString('es-CR')}.`;
        }

        if (controls['month'].errors?.['required']) {
            return 'Debe seleccionar el mes de planilla al que corresponde el ajuste.';
        }

        if (this.isFutureMonth) {
            return 'No se pueden registrar ajustes para un mes futuro.';
        }

        if (controls['type'].errors?.['required']) {
            return 'Debe indicar si el ajuste es un Extra o un Rebajo.';
        }

        if (controls['reason'].errors?.['required']) {
            return 'Debe indicar la razón del ajuste.';
        }

        if (controls['reason'].errors?.['minlength']) {
            return 'La razón debe tener al menos 5 caracteres.';
        }

        if (controls['reason'].errors?.['maxlength']) {
            return 'La razón no puede superar los 250 caracteres.';
        }

        return 'Revise los datos del ajuste antes de guardar.';
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

    // crear ajuste
    saveAdjustment() {

        if (!this.canSubmit) {
            this.adjustmentForm.markAllAsTouched();
            this.showModal(this.getFormError(), 'error');
            return;
        }

        const monthValue = this.adjustmentForm.value.month;

        const [year, month] = monthValue.split('-');

        const payload = {
            ...this.adjustmentForm.value,
            userId: Number(this.adjustmentForm.value.userId),
            amount: Number(this.adjustmentForm.value.amount),
            year: Number(year),
            month: Number(month)
        };

        this.sharedService.setLoading(true);

        this.apiAdjustment.create(payload).subscribe({

            next: () => {

                this.showFormModal = false;
                this.adjustmentForm.reset({ type: 'Extra' });

                this.showModal('Ajuste creado correctamente', 'success');

                this.loadAdjustments();
                this.sharedService.setLoading(false);
            },

            error: (err) => {

                const msg = err?.error?.message || 'Error al crear el ajuste';

                this.sharedService.setLoading(false);

                this.showFormModal = false;

                this.showModal(msg, 'error');

            }
        });
    }

    // eliminar
    openDeleteModal(adj: PayrollAdjustmentModel) {
        this.adjustmentToDelete = adj;
        this.showDeleteModal = true;
    }

    confirmDelete() {

        if (!this.adjustmentToDelete) return;

        // Se guardan los datos antes de limpiar la referencia, para poder
        // construir el mensaje correcto dentro del callback.
        const target = this.adjustmentToDelete;
        const newStatus = !target.isActive;

        this.sharedService.setLoading(true);

        this.apiAdjustment.updateStatus(target.adjustmentId, newStatus).subscribe({
            next: () => {
                this.showDeleteModal = false;
                this.adjustmentToDelete = null;
                this.loadAdjustments();
                this.sharedService.setLoading(false);

                // El mensaje debe emitirse solo cuando la operación realmente
                // fue exitosa, no de forma sincrónica al lanzar la petición.
                this.showModal(
                    newStatus
                        ? `Movimiento activado. Volverá a aplicarse en la planilla de ${target.userName}.`
                        : `Movimiento desactivado. Ya no se aplicará en la planilla de ${target.userName}.`,
                    'success'
                );
            },
            error: (err) => {
                this.sharedService.setLoading(false);
                this.showModal(
                    err?.error?.message || err?.message || 'No se pudo cambiar el estado del movimiento.',
                    'error'
                );
            }
        });
    }
}
