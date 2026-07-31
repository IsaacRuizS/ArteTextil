import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Política de contraseña de la aplicación:
 * mínimo 8 caracteres, una mayúscula, un número y un carácter especial.
 *
 * Debe mantenerse alineada con UserBusiness.ValidatePassword del API.
 */
export interface PasswordRequirements {
    minLength: boolean;
    upperCase: boolean;
    number: boolean;
    specialChar: boolean;
}

export const PASSWORD_MIN_LENGTH = 8;

export function checkPasswordRequirements(value: string | null | undefined): PasswordRequirements {

    const password = value ?? '';

    return {
        minLength: password.length >= PASSWORD_MIN_LENGTH,
        upperCase: /[A-ZÁÉÍÓÚÑ]/.test(password),
        number: /[0-9]/.test(password),
        specialChar: /[^A-Za-z0-9]/.test(password)
    };
}

export const passwordPolicyValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    const value = control.value;

    // El "requerido" lo maneja Validators.required, aquí solo la política.
    if (!value) return null;

    const requirements = checkPasswordRequirements(value);

    const errors: ValidationErrors = {};

    if (!requirements.minLength) errors['passwordMinLength'] = true;
    if (!requirements.upperCase) errors['passwordUpperCase'] = true;
    if (!requirements.number) errors['passwordNumber'] = true;
    if (!requirements.specialChar) errors['passwordSpecialChar'] = true;

    return Object.keys(errors).length ? errors : null;
};
