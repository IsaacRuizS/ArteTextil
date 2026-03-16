import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiSalaryService } from '../../../services/api-salary.service';
import { ApiUserService } from '../../../services/api-user.service';
import { SharedService } from '../../../services/shared.service';
import { SalaryModel } from '../../../shared/models/salary.model';
import { UserModel } from '../../../shared/models/user.model';

@Component({
    selector: 'app-salaries',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
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

    constructor(
        private api: ApiSalaryService,
        private apiUser: ApiUserService,
        private shared: SharedService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) {
        this.form = this.fb.group({
            userId: ['', Validators.required],
            baseSalary: [0, Validators.required]
        });
    }

    ngOnInit(): void {
        this.load();
        this.apiUser.getAll().then(u => { this.users = u; this.cdr.markForCheck(); }).catch(() => { });
    }

    load() {
        this.shared.setLoading(true);
        this.api.getAll().subscribe({
            next: data => { this.salaries = data; this.shared.setLoading(false); this.cdr.markForCheck(); },
            error: () => this.shared.setLoading(false)
        });
    }

    openCreate() {
        this.showModal = true;
        this.editingId = null;
        this.form.reset({ userId: '', baseSalary: 0 });
    }

    edit(s: SalaryModel) {
        this.editingId = s.salaryId;
        this.form.patchValue({ userId: s.userId, baseSalary: s.baseSalary });
        this.showModal = true;
    }

    save() {

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const payload = {
            salaryId: this.editingId ?? 0,
            userId: Number(this.form.get('userId')?.value),
            userName: "",
            baseSalary: Number(this.form.get('baseSalary')?.value),
            isActive: true
        };

        console.log("SALARY PAYLOAD:", payload);

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
                    this.shared.setLoading(false);
                },

                error: (err) => {
                    console.error("ERROR UPDATE SALARY:", err);
                    console.log("BACKEND RESPONSE:", err.error);
                    this.shared.setLoading(false);
                }

            });
        } else {

            // Crear salario
            this.api.create(payload).subscribe({

                next: () => {
                    this.showModal = false;
                    this.load();
                    this.shared.setLoading(false);
                },

                error: (err) => {
                    console.error("ERROR CREATE SALARY:", err);
                    this.shared.setLoading(false);
                }

            });

        }
    }
}