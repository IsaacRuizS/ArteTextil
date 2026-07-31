import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiUserService } from '../../services/api-user.service';
import {
    checkPasswordRequirements,
    PasswordRequirements,
    passwordPolicyValidator
} from '../../shared/validators/password.validator';

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    const password = control.get('password');
    const confirm = control.get('confirmPassword');

    if (!password || !confirm) return null;

    // Se conservan los errores propios del control (por ejemplo 'required') y
    // solo se agrega o quita 'mismatch'.
    const { mismatch, ...otherErrors } = confirm.errors ?? {};

    const hasMismatch = !!confirm.value && password.value !== confirm.value;

    const errors = hasMismatch
        ? { ...otherErrors, mismatch: true }
        : otherErrors;

    confirm.setErrors(Object.keys(errors).length ? errors : null);

    return hasMismatch ? { mismatch: true } : null;
};

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss',
})
export class RegisterComponent {
    registerForm: FormGroup;
    loading = false;
    submitted = false;
    error = '';
    success = false;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private apiUserService: ApiUserService,
        private cdr: ChangeDetectorRef
    ) {
        this.registerForm = this.formBuilder.group({
            fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
            phone: ['', [Validators.required, Validators.pattern(/^[0-9+\s-]{8,15}$/)]],
            password: ['', [Validators.required, passwordPolicyValidator]],
            confirmPassword: ['', Validators.required]
        }, { validators: passwordMatchValidator });
    }

    get f() { return this.registerForm.controls; }

    // Checklist en vivo de los requisitos de contraseña.
    get passwordRequirements(): PasswordRequirements {
        return checkPasswordRequirements(this.f['password'].value);
    }

    onSubmit() {
        this.submitted = true;
        this.error = '';

        if (this.registerForm.invalid) return;

        this.loading = true;

        this.apiUserService.register({
            fullName: this.f['fullName'].value,
            email: this.f['email'].value,
            password: this.f['password'].value,
            phone: String(this.f['phone'].value ?? '')
        })
        .then(() => {
            this.success = true;
            this.loading = false;

            this.cdr.markForCheck();

            setTimeout(() => this.router.navigate(['/login']), 3000);
        })
        .catch((err: Error) => {
            this.error = err.message;
            this.loading = false;
            this.cdr.markForCheck();
        });
    }
}
