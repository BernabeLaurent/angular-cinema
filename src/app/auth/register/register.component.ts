import {Component} from '@angular/core';
import {FormBuilder, Validators, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';
import {CreateUserDto} from '../../users/dtos/create-user.dto';
import {RoleUser} from '../../users/enums/roles-users.enum';
import {RegionsIso} from '../../common/enums/regions-iso.enum';

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
  roles = [
    { value: RoleUser.CUSTOMER, label: 'Client' },
    { value: RoleUser.ADMIN, label: 'Administrateur' },
    { value: RoleUser.WORKER, label: 'Employé' }
  ];
  countries = [
    { value: RegionsIso.FRANCE, label: 'France' },
    { value: RegionsIso.USA, label: 'États-Unis' }
  ];

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, public dialogRef: MatDialogRef<RegisterComponent>) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      roleUser: [RoleUser.CUSTOMER, [Validators.required]],
      hasDisability: [false],
      address: [''],
      city: [''],
      zipCode: [''],
      codeCountry: [RegionsIso.FRANCE],
      phoneNumber: [''],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.error = null;
      const formData: CreateUserDto = {
        ...this.registerForm.value,
        roleUser: this.registerForm.value.roleUser as RoleUser,
        codeCountry: this.registerForm.value.codeCountry as RegionsIso
      };
      
      this.authService.register(formData).subscribe({
        next: () => {
          this.dialogRef.close();
          window.location.reload(); // Refresh to update navbar state
        },
        error: err => {
          console.error('Registration error:', err);
          this.error = err.error?.message || 'Erreur lors de la création du compte';
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(field => {
      const control = this.registerForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
