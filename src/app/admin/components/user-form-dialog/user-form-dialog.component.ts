import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

import { CreateUserDto } from '../../../users/dtos/create-user.dto';
import { User } from '../../../auth/user.interface';
import { RoleUser } from '../../../users/enums/roles-users.enum';
import { RegionsIso } from '../../../common/enums/regions-iso.enum';

interface DialogData {
  mode: 'create' | 'edit';
  user?: User;
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule
  ],
  templateUrl: './user-form-dialog.component.html',
  styleUrls: ['./user-form-dialog.component.scss']
})
export class UserFormDialogComponent implements OnInit {
  userForm: FormGroup;
  isEditMode: boolean;
  
  roles = [
    { value: RoleUser.CUSTOMER, label: 'Client' },
    { value: RoleUser.WORKER, label: 'Employé' },
    { value: RoleUser.ADMIN, label: 'Administrateur' }
  ];
  
  countries = [
    { value: RegionsIso.FRANCE, label: 'France' },
    { value: RegionsIso.USA, label: 'États-Unis' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.user) {
      this.populateForm(this.data.user);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '', 
        this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]
      ],
      roleUser: [RoleUser.CUSTOMER, [Validators.required]],
      hasDisability: [false],
      address: [''],
      city: [''],
      zipCode: ['', [Validators.pattern(/^\d{5}$/)]],
      codeCountry: [RegionsIso.FRANCE],
      phoneNumber: ['', [Validators.pattern(/^[\+]?[0-9\s\-\(\)]{10,}$/)]],
      googleId: ['']
    });
  }

  private populateForm(user: User): void {
    this.userForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      roleUser: user.roleUser,
      hasDisability: user.hasDisability || false,
      address: user.address || '',
      city: user.city || '',
      zipCode: user.zipCode || '',
      codeCountry: user.codeCountry || RegionsIso.FRANCE,
      phoneNumber: user.phoneNumber || '',
      googleId: user.googleId || ''
    });
    
    // Remove password requirement for edit mode
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      
      // Remove empty password for edit mode
      if (this.isEditMode && !formValue.password) {
        delete formValue.password;
      }
      
      // Convert zipCode to number if provided
      if (formValue.zipCode) {
        formValue.zipCode = parseInt(formValue.zipCode, 10);
      }
      
      const userData: CreateUserDto = {
        ...formValue,
        roleUser: formValue.roleUser as RoleUser,
        codeCountry: formValue.codeCountry as RegionsIso
      };
      
      this.dialogRef.close(userData);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(field => {
      const control = this.userForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} est requis`;
    }
    
    if (field?.hasError('email')) {
      return 'Email invalide';
    }
    
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength']?.requiredLength;
      return `Minimum ${minLength} caractères requis`;
    }
    
    if (field?.hasError('pattern')) {
      if (fieldName === 'zipCode') {
        return 'Code postal invalide (5 chiffres)';
      }
      if (fieldName === 'phoneNumber') {
        return 'Numéro de téléphone invalide';
      }
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'Le prénom',
      lastName: 'Le nom',
      email: 'L\'email',
      password: 'Le mot de passe',
      roleUser: 'Le rôle'
    };
    
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}