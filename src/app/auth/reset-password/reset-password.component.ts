import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { LoggerService } from '../../services/logger.service';
import { Subscription } from 'rxjs';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    NgIf,
    MatIcon,
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['../auth.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  resetPasswordForm: FormGroup;
  message: string | null = null;
  error: string | null = null;
  isSubmitting = false;
  token: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private logger: LoggerService
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Récupérer le token depuis les query parameters
    this.token = this.route.snapshot.queryParams['token'];

    // Fallback avec observable au cas où le snapshot ne fonctionne pas
    if (!this.token) {
      this.subscription.add(
        this.route.queryParams.subscribe(params => {
          this.token = params['token'];
          if (this.token) {
            this.error = null; // Clear error if token found
          }
        })
      );
    }

    if (!this.token) {
      this.error = 'Token de réinitialisation manquant ou invalide. Veuillez utiliser le lien reçu par email.';
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword?.hasError('passwordMismatch')) {
      delete confirmPassword.errors?.['passwordMismatch'];
      if (Object.keys(confirmPassword.errors || {}).length === 0) {
        confirmPassword.setErrors(null);
      }
    }

    return null;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && !this.isSubmitting && this.token) {
      this.isSubmitting = true;
      this.error = null;
      this.message = null;

      const newPassword = this.resetPasswordForm.get('newPassword')?.value;

      this.authService.resetPassword(this.token, newPassword).subscribe({
        next: (response) => {
          this.message = 'Votre mot de passe a été réinitialisé avec succès.';
          this.isSubmitting = false;
          // Log du succès de la réinitialisation
          this.logger.logPasswordReset(true);
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (err) => {
          if (err.status === 429) {
            this.error = 'Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.';
          } else if (err.status === 400) {
            this.error = 'Token invalide ou expiré. Veuillez refaire une demande de réinitialisation.';
          } else {
            this.error = err.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
          }
          this.isSubmitting = false;
          // Log de l'échec de la réinitialisation
          this.logger.logPasswordReset(false, err);
        }
      });
    }
  }

  goBackToLogin(): void {
    this.router.navigate(['/login']);
  }
}