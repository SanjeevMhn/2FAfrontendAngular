import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FormErrHelperService } from '../../services/form-err-helper.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  registerForm: FormGroup = new FormGroup(
    {
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: this.confirmPasswordValidator }
  );

  submitted = false;
  formErrHelper = inject(FormErrHelperService);
  http = inject(HttpClient);
  router = inject(Router);
  formError: string | null = null;
  formSuccess: string | null = null;

  confirmPasswordValidator(c: AbstractControl): ValidationErrors | null {
    if (c.get('password')?.value !== c.get('confirmPassword')?.value) {
      return {
        confirm_password: true,
      };
    }
    return null;
  }

  authService = inject(AuthService);

  registerFormSubmit() {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }
    this.authService.register(this.registerForm.value).subscribe({
      next: (res: any) => {
        this.formError = null;
        if (res.success) {
          this.router.navigate(['/login'], {
            queryParams: { message: res.message },
          });
        }
      },
      error: (err: any) => {
        this.formError = err.error.message;
      },
    });
  }
}
