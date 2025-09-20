import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { AdminService, Theater, TheaterRoom } from '../../../services/admin.service';
import { DateFormatService } from '../../../services/date-format.service';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { CustomDateAdapter } from '../../../services/date-adapter.service';
import { CustomDateFormatProvider } from '../../../services/date-format.provider';

interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: number;
  releaseDate: string;
  posterUrl?: string;
  description?: string;
  director?: string;
  actors?: string[];
  rating?: string;
}


interface DialogData {
  movie: Movie;
  mode: 'create' | 'edit';
  session?: any;
}

@Component({
  selector: 'app-session-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatChipsModule,
    DateFormatPipe
  ],
  templateUrl: './session-form-dialog.component.html',
  styleUrls: ['./session-form-dialog.component.scss']
})
export class SessionFormDialogComponent implements OnInit {
  sessionForm: FormGroup;
  isEditMode: boolean;
  movie: Movie;
  
  theaters: Theater[] = [];
  theaterRooms: TheaterRoom[] = [];
  selectedTheaterId: number | null = null;
  loadingRooms = false;

  qualities = [
    { value: 'HD', label: 'HD (1080p)', icon: 'high_quality' },
    { value: 'UHD_4K', label: '4K Ultra HD', icon: '4k' },
    { value: 'IMAX', label: 'IMAX', icon: 'theaters' },
    { value: 'DOLBY_CINEMA', label: 'Dolby Cinema', icon: 'volume_up' }
  ];

  languages = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'Anglais' },
    { value: 'es', label: 'Espagnol' },
    { value: 'de', label: 'Allemand' },
    { value: 'it', label: 'Italien' }
  ];

  timeSlots = [
    '00:00', '00:30', '01:00', '01:30', '02:00', '02:30',
    '03:00', '03:30', '04:00', '04:30', '05:00', '05:30',
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SessionFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private adminService: AdminService,
    private dateFormatService: DateFormatService
  ) {
    this.isEditMode = data.mode === 'edit';
    this.movie = data.movie;
    this.sessionForm = this.createForm();
  }

  ngOnInit(): void {
    
    this.loadTheaters();
    if (this.isEditMode && this.data.session) {
      this.populateForm(this.data.session);
    } else {
      this.setDefaultValues();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      theaterId: ['', [Validators.required]],
      roomId: ['', [Validators.required]],
      date: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      quality: ['HD', [Validators.required]],
      language: ['fr', [Validators.required]],
      price: [12.50, [Validators.required, Validators.min(0)]],
      totalSeats: [150, [Validators.required, Validators.min(1)]]
    });
  }

  private loadTheaters(): void {
    this.adminService.getTheaters().subscribe({
      next: (theaters) => {
        this.theaters = theaters;
        
        // Si on est en mode édition et qu'on a les théâtres, relancer le préremplissage
        if (this.isEditMode && this.data.session && this.theaters.length > 0) {
          setTimeout(() => {
            this.populateForm(this.data.session);
          }, 100);
        }
      },
      error: (error) => {
      }
    });
  }

  private setDefaultValues(): void {
    // Date par défaut : demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.sessionForm.patchValue({
      date: tomorrow,
      startTime: '20:00',
      quality: 'HD',
      price: 12.50,
      totalSeats: 150
    });
  }

  private populateForm(session: any): void {
    
    // Corriger le format de l'heure si nécessaire
    let startTime = session.startTime;
    
    if (startTime) {
      // Si startTime est déjà au bon format (HH:MM), l'utiliser tel quel
      if (typeof startTime === 'string' && startTime.includes(':')) {
      } 
      // Si c'est un format sans deux points (ex: "0100")
      else if (typeof startTime === 'string' && startTime.length === 4 && !startTime.includes(':')) {
        startTime = startTime.substring(0, 2) + ':' + startTime.substring(2);
      }
      // Si startTime est vide, essayer d'extraire depuis une date
      else if (!startTime && session.date) {
        const sessionDate = new Date(session.date);
        startTime = sessionDate.toTimeString().slice(0, 5);
      }
    }
    
    
    // Vérifier et mapper la qualité
    
    let mappedQuality = session.quality;
    // Vérifier si la qualité existe dans les options disponibles
    const qualityExists = this.qualities.find(q => q.value === session.quality);
    if (!qualityExists) {
      mappedQuality = 'HD';
    } else {
    }
    
    // D'abord définir tous les champs sauf theaterId et roomId
    const formData = {
      date: new Date(session.date),
      startTime: startTime,
      quality: mappedQuality,
      language: session.language || 'fr',
      price: session.price || 12.50,
      totalSeats: session.totalSeats || 150
    };
    
    this.sessionForm.patchValue(formData);
    
    // Ensuite gérer le théâtre et la salle
    if (session.theaterId) {
      this.selectedTheaterId = session.theaterId;
      this.sessionForm.patchValue({
        theaterId: session.theaterId
      });
      
      // Charger les salles du théâtre
      this.loadingRooms = true;
      this.adminService.getTheaterRooms(session.theaterId).subscribe({
        next: (rooms) => {
          this.theaterRooms = rooms;
          this.loadingRooms = false;
          
          // Maintenant définir la salle
          this.sessionForm.patchValue({
            roomId: session.roomId
          });
        },
        error: (error) => {
          this.loadingRooms = false;
        }
      });
    } else {
    }
  }

  onTheaterSelected(theaterId: number): void {
    this.selectedTheaterId = theaterId;
    this.theaterRooms = [];
    
    // Ne pas vider roomId en mode édition
    if (!this.isEditMode) {
      this.sessionForm.get('roomId')?.setValue('');
    }
    
    if (theaterId) {
      this.loadingRooms = true;
      this.adminService.getTheaterRooms(theaterId).subscribe({
        next: (rooms) => {
          this.theaterRooms = rooms;
          this.loadingRooms = false;
        },
        error: (error) => {
          this.loadingRooms = false;
        }
      });
    }
  }

  calculateEndTime(): string {
    const startTime = this.sessionForm.get('startTime')?.value;
    if (!startTime || !this.movie.duration) {
      return '';
    }

    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + this.movie.duration + 20; // +20 min pour entracte et nettoyage
    
    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  }

  onStartTimeChange(): void {
    // Recalcule l'heure de fin quand l'heure de début change
    const endTime = this.calculateEndTime();
    if (endTime) {
    }
  }

  getQualityIcon(quality: string): string {
    const qualityObj = this.qualities.find(q => q.value === quality);
    return qualityObj?.icon || 'movie';
  }

  onSubmit(): void {
    if (this.sessionForm.valid) {
      const formValue = this.sessionForm.value;

      // IMPORTANT: Ces données seront filtrées par sessions-management-dialog.component.ts
      // qui ne garde que les champs acceptés par l'API NestJS
      const sessionData = {
        movieId: this.movie.id,
        theaterId: formValue.theaterId,
        roomId: formValue.roomId,
        date: this.formatDateForApi(formValue.date), // Format YYYY-MM-DD pour l'API
        startTime: formValue.startTime,
        endTime: this.calculateEndTime(),
        quality: formValue.quality,
        language: formValue.language,
        price: formValue.price,
        totalSeats: formValue.totalSeats,
        availableSeats: formValue.totalSeats // Initialement toutes les places sont disponibles
      };

      this.dialogRef.close(sessionData);
    } else {
      this.markFormGroupTouched();
    }
  }

  private formatDateForApi(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.sessionForm.controls).forEach(field => {
      const control = this.sessionForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.sessionForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} est requis`;
    }
    
    if (field?.hasError('min')) {
      const min = field.errors?.['min']?.min;
      return `La valeur minimale est ${min}`;
    }
    
    if (field?.hasError('max')) {
      const max = field.errors?.['max']?.max;
      return `La valeur maximale est ${max}`;
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      theaterId: 'Le cinéma',
      roomId: 'La salle',
      date: 'La date',
      startTime: 'L\'heure de début',
      quality: 'La qualité',
      price: 'Le prix',
      totalSeats: 'Le nombre de places'
    };
    
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.sessionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  formatMovieDuration(duration: number): string {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}h${minutes.toString().padStart(2, '0')}` : `${minutes}min`;
  }

  getSelectedTheaterName(): string {
    const theaterId = this.sessionForm.get('theaterId')?.value;
    const theater = this.theaters.find(t => t.id === Number(theaterId));
    return theater?.name || '';
  }

  getSelectedRoomName(): string {
    const roomId = this.sessionForm.get('roomId')?.value;
    const room = this.theaterRooms.find(r => r.id === Number(roomId));
    return room?.roomNumber.toString() || '';
  }

  getSelectedQualityLabel(): string {
    const qualityValue = this.sessionForm.get('quality')?.value;
    const quality = this.qualities.find(q => q.value === qualityValue);
    return quality?.label || '';
  }
}