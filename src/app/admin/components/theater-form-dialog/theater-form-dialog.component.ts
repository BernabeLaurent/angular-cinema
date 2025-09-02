import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { CreateTheaterDto, Theater } from '../../../services/admin.service';

interface DialogData {
  mode: 'create' | 'edit';
  theater?: Theater;
}

@Component({
  selector: 'app-theater-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './theater-form-dialog.component.html',
  styleUrls: ['./theater-form-dialog.component.scss']
})
export class TheaterFormDialogComponent implements OnInit {
  theaterForm: FormGroup;
  isEditMode: boolean;
  
  countries = [
    { value: 'FR', label: 'France' },
    { value: 'US', label: 'États-Unis' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TheaterFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.theaterForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.theater) {
      this.populateForm(this.data.theater);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      codeCountry: ['FR', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[\+]?[0-9\s\-\(\)]{10,}$/)]],
      openingTime: ['09:00', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
      closingTime: ['23:00', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]]
    });
  }

  private populateForm(theater: Theater): void {
    this.theaterForm.patchValue({
      name: theater.name,
      address: theater.address,
      city: theater.city,
      zipCode: theater.zipCode?.toString() || '',
      codeCountry: theater.codeCountry,
      phoneNumber: theater.phoneNumber,
      openingTime: theater.openingTime?.substring(0, 5) || '09:00',
      closingTime: theater.closingTime?.substring(0, 5) || '23:00'
    });
  }

  onSubmit(): void {
    if (this.theaterForm.valid) {
      const formValue = this.theaterForm.value;
      
      const theaterData: CreateTheaterDto = {
        name: formValue.name.trim(),
        address: formValue.address.trim(),
        city: formValue.city.trim(),
        zipCode: parseInt(formValue.zipCode, 10),
        codeCountry: formValue.codeCountry,
        phoneNumber: formValue.phoneNumber.trim(),
        openingTime: formValue.openingTime,
        closingTime: formValue.closingTime
      };
      
      this.dialogRef.close(theaterData);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.theaterForm.controls).forEach(field => {
      const control = this.theaterForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.theaterForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} est requis`;
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
      if (fieldName === 'openingTime' || fieldName === 'closingTime') {
        return 'Format d\'heure invalide (HH:MM)';
      }
    }
    
    // Validation personnalisée pour les horaires
    if (fieldName === 'closingTime' && this.theaterForm.get('openingTime')?.value && field?.value) {
      const openingTime = this.theaterForm.get('openingTime')?.value;
      const closingTime = field.value;
      
      if (this.timeToMinutes(closingTime) <= this.timeToMinutes(openingTime)) {
        return 'L\'heure de fermeture doit être après l\'heure d\'ouverture';
      }
    }
    
    return '';
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Le nom du cinéma',
      address: 'L\'adresse',
      city: 'La ville',
      zipCode: 'Le code postal',
      codeCountry: 'Le pays',
      phoneNumber: 'Le numéro de téléphone',
      openingTime: 'L\'heure d\'ouverture',
      closingTime: 'L\'heure de fermeture'
    };
    
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.theaterForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Méthode appelée quand les horaires changent pour revalider
  onTimeChange(): void {
    setTimeout(() => {
      this.theaterForm.get('closingTime')?.updateValueAndValidity();
    }, 100);
  }
}