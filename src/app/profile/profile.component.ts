import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AsyncPipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, ignoreElements, map, Subject, switchMap, tap, throwError } from 'rxjs';
import { FormErrHelperService } from '../../services/form-err-helper.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  imports: [AsyncPipe, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  authService = inject(AuthService);
  userDetails$ = this.authService.getUserDetails().pipe(
    tap((res) => {
      if (res.userDetails !== null) {
        this.userForm.patchValue(res.userDetails);
      }
    }),
    map((res: any) => res.userDetails)
  );

  @ViewChild('passwordConfirmDialog', { static: true })
  passwordConfirm!: ElementRef<HTMLDialogElement>;
  userForm: FormGroup = new FormGroup({
    user_name: new FormControl('', [Validators.required]),
    user_email: new FormControl('', [Validators.required, Validators.email]),
  });

  verifyPasswordForm: FormGroup = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  submittedVerifyPassword = false;
  formErrHelperService = inject(FormErrHelperService);
  twoFAToggle:boolean | null = null;

  toggle2FA(enable = true) {
    this.twoFAToggle = enable;
    if (this.passwordConfirm) {
      this.passwordConfirm.nativeElement.showModal();
    }
  }

  submiVerifyPasswordSubject = new Subject<void>();
  formError = new Subject<string>()
  submitVerifyPassword$ = this.submiVerifyPasswordSubject.pipe(
    switchMap((_) => {
      return this.authService
        .verifyPassword(this.verifyPasswordForm.value)
        .pipe(
          tap((res: any) => {
            if (res.success) {
              this.passwordConfirm.nativeElement.close();
              this.verifyPasswordForm.reset();
              if(this.twoFAToggle !== null){
                if(this.twoFAToggle){
                  this.enable2FASubject.next();
                }
                if(!this.twoFAToggle){
                  this.disable2FASubject.next();
                }
              }
            }
          })
        );
    })
  );

  errorSubmitVerifyPassword$ = this.submitVerifyPassword$.pipe(
    ignoreElements(),
    catchError((err: HttpErrorResponse) => {
      this.formError.next(err.error.message)
      return throwError(() => err)
    })
  )

  disable2FASubject = new Subject<void>()
  disable2FA$ = this.disable2FASubject.pipe(
    switchMap(_ => {
      return this.authService.disable2FA().pipe(
        tap((res: any) => {
          if(res.success){
            this.getUserDetailsSubject.next()
          }
        })
      )
    })
  )

  enable2FASubject = new Subject<void>();
  enable2FA$ = this.enable2FASubject.pipe(
    switchMap((_) => {
      return this.authService.enable2FA().pipe(
        tap((res: any) => {
          if (res.success) {
            this.getUserDetailsSubject.next();
          }
        })
      );
    })
  );

  getUserDetailsSubject = new Subject<void>();
  getUserDetails$ = this.getUserDetailsSubject.pipe(
    switchMap((_) => {
      return (this.userDetails$ = this.authService
        .getUserDetails()
        .pipe(map((res: any) => res.userDetails)));
    })
  );


  submitVerifyPassword() {
    this.submittedVerifyPassword = true;
    if(this.verifyPasswordForm.invalid){
      return
    }
    this.submiVerifyPasswordSubject.next();
  }

  resetForm() {
    this.submittedVerifyPassword = false;
    this.verifyPasswordForm.reset();
  }
}
