import {Component} from '@angular/core';
import {FormBuilder, Validators, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import {NgIf} from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatSelectModule,
    NgIf,
    MatIcon,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['../auth.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  error: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, public dialogRef: MatDialogRef<RegisterComponent>) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      roleUser: ['CUSTOMER', [Validators.required]],
      hasDisability: [false],
      address: [''],
      city: [''],
      zipCode: [''],
      codeCountry: ['FRANCE'],
      phoneNumber: [''],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: () => this.router.navigate(['/']),
        error: err => (this.error = err.error?.message || 'Erreur inconnue'),
      });
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
