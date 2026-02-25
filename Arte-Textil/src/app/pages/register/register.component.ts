import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirm = control.get('confirmPassword');
    if (password && confirm && password.value !== confirm.value) {
        confirm.setErrors({ mismatch: true });
        return { mismatch: true };
    }
    confirm?.setErrors(null);
    return null;
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
        private apiUserService: ApiUserService
    ) {
        this.registerForm = this.formBuilder.group({
            fullName: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        }, { validators: passwordMatchValidator });
    }

    get f() { return this.registerForm.controls; }

    onSubmit() {
        this.submitted = true;
        this.error = '';

        if (this.registerForm.invalid) return;

        this.loading = true;

        this.apiUserService.register({
            fullName: this.f['fullName'].value,
            email: this.f['email'].value,
            password: this.f['password'].value,
            phone: this.f['phone'].value
        })
        .then(() => {
            this.success = true;
            this.loading = false;
            setTimeout(() => this.router.navigate(['/login']), 3000);
        })
        .catch((err: Error) => {
            this.error = err.message;
            this.loading = false;
        });
    }
}
