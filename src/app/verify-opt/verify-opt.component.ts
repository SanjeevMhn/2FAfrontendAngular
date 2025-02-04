import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormErrHelperService } from '../../services/form-err-helper.service';
import { AuthService } from '../../services/auth.service';
import {
  catchError,
  ignoreElements,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-verify-opt',
  imports: [ReactiveFormsModule, AsyncPipe, RouterLink],
  templateUrl: './verify-opt.component.html',
  styleUrl: './verify-opt.component.scss',
})
export class VerifyOptComponent implements OnDestroy, AfterViewInit {
  verifyOPTForm: FormGroup = new FormGroup({
    token: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  @ViewChild('token',{static: false}) token !: ElementRef<HTMLInputElement>

  ngAfterViewInit(): void {
    if(this.token){
      this.token.nativeElement.focus()
    }
  }

  submitted = false;
  formErrHelper = inject(FormErrHelperService);
  authService = inject(AuthService);
  router = inject(Router);
  destroy$ = new Subject<void>()

  otpFormError = new Subject<string>();

  submitOTPForm() {
    this.submitted = true;
    if (this.verifyOPTForm.invalid) {
      return;
    }
    let formData = {
      ...AuthService.twoFACredentials,
      ...this.verifyOPTForm.value,
    };
    this.authService.verifyOTP(formData)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.authService.setAccessToken(res.accessToken);
          this.router.navigate(['/home'], {
            queryParams: { message: res.message },
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.otpFormError.next(err.error.message);
        console.error(err);
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete();
  }
}
