import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VacationModel } from '../../../shared/models/vacation.model';
import { ApiVacationService } from '../../../services/api-vacation.service';
import { SharedService } from '../../../services/shared.service';
import { ApiUserService } from '../../../services/api-user.service';
import { NotificationService } from '../../../services/notification.service';
import { UserModel } from '../../../shared/models/user.model';
import { VacationBalanceModel } from '../../../shared/models/vacation-balance.model';
import { NgxPaginationModule } from 'ngx-pagination';
import { sortUsersByName } from '../../../shared/utils/sort-users';

@Component({
    selector: 'app-vacations',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule],
    providers: [FormBuilder],
    templateUrl: './vacations.component.html',
    styleUrls: ['./vacations.component.scss']
})
export class VacationsComponent implements OnInit {

    vacations: VacationModel[] = [];
    vacationsOrigin: VacationModel[] = [];
    vacationForm: FormGroup;

    showFormModal = true;
    searchTerm = '';
    page = 1;
    availableState = {
        days: 0
    };

    // Desglose del saldo propio (colaborador) y de todos (admin).
    myBalance: VacationBalanceModel | null = null;
    balances: VacationBalanceModel[] = [];

    today = this.toDateInputValue(new Date());

    showError = false;
    errorMessage = '';

    // Confirmación de aprobar / rechazar
    vacationToDecide: VacationModel | null = null;
    pendingDecision: 'approve' | 'reject' | null = null;

    // cambiar manualmente para probar
    isAdmin = false;
    userId: number = 0;

    users: UserModel[] = [];

    constructor(
        private apiVacation: ApiVacationService,
        private apiUser: ApiUserService,
        private sharedService: SharedService,
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
    ) {
        this.vacationForm = this.fb.group(
            {
                userId: [null],
                startDate: ['', Validators.required],
                endDate: ['', Validators.required],
                notes: ['', Validators.maxLength(250)]
            },
            { validators: [this.dateRangeValidator, this.pastDateValidator(() => this.today)] }
        );
    }

    ngAfterViewInit(): void {
        setTimeout(() => this.loadAvailableDays());
    }

    ngOnInit(): void {

        const token = localStorage.getItem('auth_token');

        if (token) {
            const payload: any = JSON.parse(atob(token.split('.')[1]));

            this.isAdmin = payload?.roleId === "1";
            this.userId = Number(payload?.id);
        }

        this.showFormModal = false;

        // SI NO ES ADMIN → setear userId automáticamente
        if (!this.isAdmin) {
            this.vacationForm.get('userId')?.setValue(this.userId);
            this.vacationForm.get('userId')?.clearValidators();
            this.vacationForm.get('userId')?.updateValueAndValidity();
        } else {
            // El admin sí debe elegir a quién corresponde la solicitud.
            this.vacationForm.get('userId')?.setValidators([Validators.required]);
            this.vacationForm.get('userId')?.updateValueAndValidity();
            this.loadUsers();
        }

        this.loadVacations();

    }


    // Saldo de vacaciones: el colaborador ve el suyo, el admin el de todos.
    loadAvailableDays() {

        if (this.isAdmin) {

            this.apiVacation.getAllBalances().subscribe({
                next: (balances) => {
                    this.balances = balances;
                    this.cdr.detectChanges();
                },
                error: (err) => this.notificationService.error(
                    err?.error?.message || err?.message || 'Error al cargar los saldos de vacaciones.')
            });

            return;
        }

        this.apiVacation.getBalance().subscribe({
            next: (balance) => {
                this.myBalance = balance;
                this.availableState = { days: balance.availableDays };
                this.cdr.detectChanges();
            },
            error: (err) => this.notificationService.error(
                err?.error?.message || err?.message || 'Error al cargar los días disponibles.')
        });
    }

    // Saldo del usuario seleccionado en el formulario (vista de admin).
    get selectedUserBalance(): VacationBalanceModel | null {

        const userId = Number(this.vacationForm.get('userId')?.value);

        if (!userId) return null;

        return this.balances.find(b => b.userId === userId) ?? null;
    }

    // Saldo aplicable al formulario, sea admin o colaborador.
    get formBalance(): VacationBalanceModel | null {
        return this.isAdmin ? this.selectedUserBalance : this.myBalance;
    }

    availableDaysFor(userId: number): number | null {
        return this.balances.find(b => b.userId === userId)?.availableDays ?? null;
    }

    // Etiqueta del select: nombre + saldo, para no tener que abrir el detalle.
    userOptionLabel(user: UserModel): string {

        const days = this.availableDaysFor(user.userId);

        if (days === null) return user.fullName;

        return `${user.fullName} — ${days} día(s) disponible(s)`;
    }

    // carga segun el rol
    loadVacations() {

        this.sharedService.setLoading(true);

        const request = this.isAdmin
            ? this.apiVacation.getAll()   // Admin ve todo
            : this.apiVacation.getMine(); // Colaborador solo lo suyo

        request.subscribe({
            next: (data) => {
                this.vacations = data;
                this.vacationsOrigin = data;
                this.sharedService.setLoading(false);
            },
            error: () => {
                this.notificationService.error('Error al cargar las vacaciones');
                this.sharedService.setLoading(false);
            }
        });
    }

    loadUsers() {

        this.apiUser.getAll()
            .then((users: UserModel[]) => {

                this.users = sortUsersByName(users.filter(u => u.isActive));
                this.cdr.detectChanges();

            })
            .catch(() => {
                this.notificationService.error('Error al cargar los usuarios');
            });
    }

    // Buscador
    onSearch(event: any) {
        this.searchTerm = event.target.value;
        this.onFilter();
    }

    onFilter() {

        const source = [...this.vacationsOrigin];  // copia real

        if (!this.searchTerm || this.searchTerm.trim() === '') {
            this.vacations = source;
            return;
        }

        const term = this.searchTerm.toLowerCase();

        this.vacations = source.filter(v =>
            (v.userName && v.userName.toLowerCase().includes(term))
            || v.status.toLowerCase().includes(term)
            || new Date(v.startDate).toLocaleDateString().includes(term)
            || new Date(v.endDate).toLocaleDateString().includes(term)
        );
    }

    // Formulario para colaborador
    openCreateModal() {
        this.vacationForm.reset();
        this.showFormModal = true;
    }

    saveVacation() {

        if (!this.canSubmit) {
            this.vacationForm.markAllAsTouched();
            return;
        }

        const startDate = this.vacationForm.value.startDate;
        const endDate = this.vacationForm.value.endDate;

        this.sharedService.setLoading(true);

        const payload = {
            userId: this.isAdmin
                ? Number(this.vacationForm.value.userId)
                : this.userId,
            startDate: this.vacationForm.value.startDate,
            endDate: this.vacationForm.value.endDate,
            notes: this.vacationForm.value.notes
        };

        this.apiVacation.create(payload).subscribe({
            next: () => {

                this.vacationForm.reset();

                // volver a setear userId si es colaborador
                if (!this.isAdmin) {
                    this.vacationForm.get('userId')?.setValue(this.userId);
                }

                this.showFormModal = false;

                this.loadVacations();

                this.loadAvailableDays();

                this.notificationService.success(
                    'Solicitud de vacaciones enviada correctamente. Queda pendiente de aprobación.');

                this.sharedService.setLoading(false);
            },
            error: (err) => {

                this.showFormModal = false;

                const message =
                    err?.error?.message ||
                    err?.error?.Message ||
                    err?.message ||
                    "No tiene días disponibles";

                this.showErrorModal(message);

                this.sharedService.setLoading(false);
            }
        });
    }

    // modal de error
    showErrorModal(message: string) {
        this.errorMessage = message;
        this.showError = true;
    }

    // Admin: confirmación antes de resolver la solicitud
    openDecisionModal(vacation: VacationModel, decision: 'approve' | 'reject') {
        this.vacationToDecide = vacation;
        this.pendingDecision = decision;
    }

    closeDecisionModal() {
        this.vacationToDecide = null;
        this.pendingDecision = null;
    }

    confirmDecision() {

        if (!this.vacationToDecide || !this.pendingDecision) return;

        const vacation = this.vacationToDecide;
        const decision = this.pendingDecision;

        this.closeDecisionModal();

        if (decision === 'approve') {
            this.approve(vacation);
        } else {
            this.reject(vacation);
        }
    }

    approve(vacation: VacationModel) {

        this.sharedService.setLoading(true);

        const who = vacation.userName || `usuario #${vacation.userId}`;
        const range = this.formatRange(vacation);

        this.apiVacation.approve(vacation.vacationRequestId).subscribe({
            next: () => {
                this.loadVacations();
                this.loadAvailableDays();
                this.notificationService.success(
                    `Solicitud aprobada: ${who} tiene vacaciones del ${range}.`);
                this.sharedService.setLoading(false);
            },
            error: (err) => {
                // El API devuelve el motivo exacto (por ejemplo, fecha en el pasado).
                this.notificationService.error(
                    this.getApiMessage(err, `No se pudo aprobar la solicitud de ${who}.`));
                this.sharedService.setLoading(false);
            }
        });
    }

    reject(vacation: VacationModel) {

        this.sharedService.setLoading(true);

        const who = vacation.userName || `usuario #${vacation.userId}`;
        const range = this.formatRange(vacation);

        this.apiVacation.reject(vacation.vacationRequestId).subscribe({
            next: () => {
                this.loadVacations();
                this.loadAvailableDays();
                this.notificationService.warning(
                    `Solicitud rechazada: ${who} no tomará vacaciones del ${range}. Los días vuelven a su saldo.`);
                this.sharedService.setLoading(false);
            },
            error: (err) => {
                this.notificationService.error(
                    this.getApiMessage(err, `No se pudo rechazar la solicitud de ${who}.`));
                this.sharedService.setLoading(false);
            }
        });
    }

    private formatRange(vacation: VacationModel): string {

        const format = (value: any) => new Date(value).toLocaleDateString('es-CR');

        return `${format(vacation.startDate)} al ${format(vacation.endDate)}`;
    }

    private getApiMessage(err: any, fallback: string): string {
        return err?.error?.message || err?.error?.Message || err?.message || fallback;
    }

    private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
        const start = control.get('startDate')?.value;
        const end = control.get('endDate')?.value;

        if (!start || !end) return null;

        return end < start ? { invalidDateRange: true } : null;
    }

    // Las vacaciones solo pueden solicitarse de hoy en adelante (igual que el API).
    private pastDateValidator(getToday: () => string) {

        return (control: AbstractControl): ValidationErrors | null => {

            const today = getToday();
            const start = control.get('startDate')?.value;
            const end = control.get('endDate')?.value;

            if ((start && start < today) || (end && end < today)) {
                return { pastDate: true };
            }

            return null;
        };
    }

    // Días naturales solicitados (inclusive), para mostrarlos en el formulario.
    get requestedDays(): number {

        const start = this.vacationForm.get('startDate')?.value;
        const end = this.vacationForm.get('endDate')?.value;

        if (!start || !end || end < start) return 0;

        const startDate = new Date(`${start}T00:00:00`);
        const endDate = new Date(`${end}T00:00:00`);

        const diff = endDate.getTime() - startDate.getTime();

        return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
    }

    // No se pueden pedir más días de los que tiene disponibles el colaborador
    // (aplica también cuando el admin solicita en nombre de alguien más).
    get exceedsAvailableDays(): boolean {

        const balance = this.formBalance;

        if (!balance) return false;

        return this.requestedDays > 0 && this.requestedDays > balance.availableDays;
    }

    get canSubmit(): boolean {
        return this.vacationForm.valid && !this.exceedsAvailableDays;
    }

    private getVacationFormError(): string {

        if (this.isAdmin && this.vacationForm.get('userId')?.hasError('required')) {
            return 'Debe seleccionar el usuario al que corresponde la solicitud.';
        }

        if (this.vacationForm.get('startDate')?.hasError('required')) {
            return 'Debe indicar la fecha de inicio de las vacaciones.';
        }

        if (this.vacationForm.get('endDate')?.hasError('required')) {
            return 'Debe indicar la fecha fin de las vacaciones.';
        }

        if (this.vacationForm.hasError('invalidDateRange')) {
            return 'La fecha fin no puede ser anterior a la fecha de inicio.';
        }

        if (this.vacationForm.hasError('pastDate')) {
            return 'Las vacaciones solo pueden solicitarse para fechas presentes o futuras.';
        }

        if (this.vacationForm.get('notes')?.hasError('maxlength')) {
            return 'El motivo no puede superar los 250 caracteres.';
        }

        if (this.exceedsAvailableDays) {
            return `Está solicitando ${this.requestedDays} día(s) y solo hay ${this.formBalance?.availableDays ?? 0} disponible(s).`;
        }

        return 'Revise los datos de la solicitud.';
    }

    private toDateInputValue(date: Date): string {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }
}
