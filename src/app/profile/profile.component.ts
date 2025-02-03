import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AsyncPipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  catchError,
  ignoreElements,
  map,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';
import { FormErrHelperService } from '../../services/form-err-helper.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  imports: [AsyncPipe, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnDestroy {
  authService = inject(AuthService);
  userDetails$ = this.authService.getUserDetails().pipe(
    tap((res) => {
      if (res.userDetails !== null) {
        this.userForm.patchValue(res.userDetails);
        this.userDetails = res.userDetails
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
  twoFAToggle: boolean | null = null;

  destroy$ = new Subject<void>();

  toggle2FA(enable = true) {
    this.twoFAToggle = enable;
    if (this.passwordConfirm) {
      this.passwordConfirm.nativeElement.showModal();
    }
  }

  submiVerifyPasswordSubject = new Subject<boolean>();
  formError = new Subject<string>();

  disable2FASubject = new Subject<void>();
  disable2FA$ = this.disable2FASubject.pipe(
    take(1),
    switchMap((_) => {
      return this.authService.disable2FA().pipe(
        tap((res: any) => {
          if (res.success) {
            this.getUserDetails();
          }
        })
      );
    })
  );

  enable2FASubject = new Subject<void>();
  enable2FA$ = this.enable2FASubject.pipe(
    take(1),
    switchMap((_) => {
      return this.authService.enable2FA().pipe(
        tap((res: any) => {
          if (res.success) {
            this.getUserDetails();
          }
        })
      );
    })
  );

  userDetails: {[key: string]: string | number | boolean } = {}

  getUserDetails(){
    this.authService.getUserDetails().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        this.userDetails = res.userDetails
      },
      error: (err) => {
        console.error(err)
      }
    })
  }

  submitVerifyPassword() {
    this.submittedVerifyPassword = true;
    if (this.verifyPasswordForm.invalid) {
      return;
    }

    this.authService
      .verifyPassword(this.verifyPasswordForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.passwordConfirm.nativeElement.close();
            this.resetForm();
            if (this.twoFAToggle !== null) {
              if (this.twoFAToggle) {
                this.enable2FASubject.next();
              }
              if (!this.twoFAToggle) {
                this.disable2FASubject.next();
              }
            }
          }
        },
        error: (err: HttpErrorResponse) => {
          this.formError.next(err.error.message);
        },
      });
  }

  resetForm() {
    this.submittedVerifyPassword = false;
    this.verifyPasswordForm.reset();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
