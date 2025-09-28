import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { LoggerService } from '../../services/logger.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-forgot-password',
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
  templateUrl: './forgot-password.component.html',
  styleUrls: ['../auth.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  message: string | null = null;
  error: string | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private logger: LoggerService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.forgotPasswordForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.error = null;
      this.message = null;

      const email = this.forgotPasswordForm.get('email')?.value;

      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          this.message = 'Un email de réinitialisation a été envoyé à votre adresse.';
          this.isSubmitting = false;
          // Log du succès de la demande
          this.logger.logPasswordResetRequest(email, true);
        },
        error: (err) => {
          if (err.status === 429) {
            this.error = 'Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.';
          } else {
            this.error = err.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
          }
          this.isSubmitting = false;
          // Log de l'échec de la demande
          this.logger.logPasswordResetRequest(email, false, err);
        }
      });
    }
  }

  goBackToLogin(): void {
    this.router.navigate(['/login']);
  }
}