import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiSalaryService } from '../../../services/api-salary.service';
import { ApiUserService } from '../../../services/api-user.service';
import { SharedService } from '../../../services/shared.service';
import { NotificationService } from '../../../services/notification.service';
import { SalaryModel } from '../../../shared/models/salary.model';
import { UserModel } from '../../../shared/models/user.model';
import { CustomCurrencyPipe } from '../../../shared/pipes/crc-currency.pipe';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { AuthService } from '../../../services/auth.service';
import { sortUsersByName } from '../../../shared/utils/sort-users';

@Component({
    selector: 'app-salaries',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, CustomCurrencyPipe, FormsModule, NgxPaginationModule],
    templateUrl: './salary.component.html',
    changeDetection: ChangeDetectionStrategy.Default,
    providers: [FormBuilder]
})
export class SalaryComponent implements OnInit {
    salaries: SalaryModel[] = [];
    users: UserModel[] = [];
    form!: FormGroup;
    showModal = false;
    editingId: number | null = null;
    searchTerm: string = '';
    salariesOrigin: SalaryModel[] = [];
    page = 1;
    isAdmin: boolean = false;

    // El salario base siempre es un monto positivo; el tope evita errores de digitación.
    readonly MIN_SALARY = 1;
    readonly MAX_SALARY = 100_000_000;

    constructor(
        private api: ApiSalaryService,
        private apiUser: ApiUserService,
        private shared: SharedService,
        private notificationService: NotificationService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef,
        private authService: AuthService
    ) {
        this.form = this.fb.group({
            userId: ['', Validators.required],
            baseSalary: [null, [
                Validators.required,
                Validators.min(this.MIN_SALARY),
                Validators.max(this.MAX_SALARY)
            ]]
        });
    }

    ngOnInit(): void {
        this.isAdmin = this.authService.currentUserValue?.roleId === 1;
        this.load();
        if (this.isAdmin) {
            this.apiUser.getAll().then(u => {
                this.users = sortUsersByName(u.filter(x => x.isActive));
                this.cdr.markForCheck();
            }).catch(() => {
                this.notificationService.error('Error al cargar los usuarios');
            });
        }
    }

    get filteredSalaries() {

        const term = this.searchTerm.toLowerCase().trim();

        if (!term) return this.salariesOrigin;

        return this.salariesOrigin.filter(s =>
            s.userName?.toLowerCase().includes(term)
        );
    }


    load() {
        this.shared.setLoading(true);
        this.api.getAll().subscribe({
            next: data => {
                this.salariesOrigin = data;
                this.salaries = data;
                this.shared.setLoading(false);
                this.cdr.markForCheck();
            },
            error: () => {
                this.notificationService.error('Error al cargar los salarios');
                this.shared.setLoading(false);
            }
        });
    }

    openCreate() {
        this.showModal = true;
        this.editingId = null;
        this.form.reset({ userId: '', baseSalary: null });
    }

    get modalTitle(): string {
        return this.editingId ? 'Editar salario' : 'Nuevo salario';
    }

    // Mensaje específico según el error del salario base.
    get baseSalaryError(): string | null {

        const control = this.form.get('baseSalary');

        if (!control?.touched || !control?.errors) return null;

        if (control.errors['required']) return 'Debe indicar el salario base.';
        if (control.errors['min']) return 'El salario base debe ser mayor que cero. No se admiten valores negativos.';
        if (control.errors['max']) return `El salario base no puede superar ₡${this.MAX_SALARY.toLocaleString('es-CR')}.`;

        return 'El salario base no es válido.';
    }

    edit(s: SalaryModel) {
        this.editingId = s.salaryId;
        this.form.patchValue({ userId: s.userId, baseSalary: s.baseSalary });
        this.showModal = true;
    }

    save() {

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.notificationService.error(
                this.baseSalaryError || 'Revise los campos marcados antes de guardar.');
            return;
        }

        const payload = {
            salaryId: this.editingId ?? 0,
            userId: Number(this.form.get('userId')?.value),
            userName: "",
            baseSalary: Number(this.form.get('baseSalary')?.value),
            isActive: true
        };

        this.shared.setLoading(true);

        if (this.editingId) {

            const payload = {
                salaryId: this.editingId,
                userId: Number(this.form.get('userId')?.value),
                userName: "",
                baseSalary: Number(this.form.get('baseSalary')?.value),
                isActive: true
            };

            this.api.update(this.editingId, payload).subscribe({

                next: () => {
                    this.showModal = false;
                    this.load();
                    this.notificationService.success(
                        this.editingId ? 'Salario actualizado correctamente.' : 'Salario creado correctamente.');
                    this.shared.setLoading(false);
                },

                error: () => {
                    this.notificationService.error('Error al actualizar el salario');
                    this.shared.setLoading(false);
                }

            });
        } else {

            // Crear salario
            this.api.create(payload).subscribe({

                next: () => {
                    this.showModal = false;
                    this.load();
                    this.notificationService.success(
                        this.editingId ? 'Salario actualizado correctamente.' : 'Salario creado correctamente.');
                    this.shared.setLoading(false);
                },

                error: () => {
                    this.notificationService.error('Error al crear el salario');
                    this.shared.setLoading(false);
                }

            });

        }
    }
}