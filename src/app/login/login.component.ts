type FormErrors = any;

import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { FormErrHelperService } from '../../services/form-err-helper.service';
import { map, Subject, switchMap, tap } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  submitted = false;
  http = inject(HttpClient);
  formErrHelper = inject(FormErrHelperService);
  route = inject(ActivatedRoute);
  queryParamsMessage$ = new Subject<string | null>();

  qrcode: string | null = null;
  formError: string | null = null;
  redirectMessage: string | null = null;

  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit(): void {
    this.redirectMessage = this.route.snapshot.queryParamMap.get('message');
  }

  loginTwoFA() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        this.formError = null;
        if (res.success) {
          this.authService.setAccessToken(res.accessToken);
          this.router.navigate(['/home'], {
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
