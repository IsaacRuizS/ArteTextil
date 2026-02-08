import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class Login {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    error = '';

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private authService: AuthService
    ) {
        // redirect to home if already logged in
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/dashboard']);
        }

        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    ngOnInit(): void {
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onSubmit() {
        this.submitted = true;
        this.error = '';

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.authService.login({
            email: this.f['email'].value,
            password: this.f['password'].value
        })
            .then((user: any) => {
                // Login successful, redirect handled in AuthService or here if needed
                // AuthService handles redirect to dashboard
            })
            .catch((error: any) => {
                this.error = error.message;
                this.loading = false;
            });
    }
}
