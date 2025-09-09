import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AdminService, Theater, TheaterRoom, CreateTheaterRoomDto, UpdateTheaterRoomDto } from '../../../services/admin.service';

@Component({
  selector: 'app-theater-rooms-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './theater-rooms-dialog.component.html',
  styleUrls: ['./theater-rooms-dialog.component.scss']
})
export class TheaterRoomsDialogComponent implements OnInit {
  theater: Theater;
  rooms: TheaterRoom[] = [];
  displayedColumns: string[] = ['roomNumber', 'numberSeats', 'numberSeatsDisabled', 'actions'];
  loading = false;
  showForm = false;
  editingRoom: TheaterRoom | null = null;

  roomForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<TheaterRoomsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { theater: Theater },
    private adminService: AdminService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.theater = data.theater;
    this.roomForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadRooms();
  }

  createForm(): FormGroup {
    return this.formBuilder.group({
      roomNumber: ['', [Validators.required, Validators.min(1)]],
      numberSeats: ['', [Validators.required, Validators.min(1), Validators.max(1000)]],
      numberSeatsDisabled: [0, [Validators.min(0), Validators.max(100)]]
    });
  }

  loadRooms(): void {
    this.loading = true;
    this.adminService.getTheaterRooms(this.theater.id).subscribe({
      next: (rooms) => {
        this.rooms = rooms.sort((a, b) => a.roomNumber - b.roomNumber);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.rooms = [];
        this.loading = false;
        this.showError('Erreur lors du chargement des salles');
      }
    });
  }

  showCreateForm(): void {
    this.editingRoom = null;
    this.roomForm.reset({ numberSeatsDisabled: 0 });
    this.showForm = true;
  }

  showEditForm(room: TheaterRoom): void {
    this.editingRoom = room;
    this.roomForm.patchValue({
      roomNumber: room.roomNumber,
      numberSeats: room.numberSeats,
      numberSeatsDisabled: room.numberSeatsDisabled || 0
    });
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingRoom = null;
    this.roomForm.reset();
  }

  saveRoom(): void {
    if (!this.roomForm.valid) return;

    const formValue = this.roomForm.value;

    if (this.editingRoom) {
      // Modification
      const updateData: UpdateTheaterRoomDto = {
        roomNumber: formValue.roomNumber,
        numberSeats: formValue.numberSeats,
        numberSeatsDisabled: formValue.numberSeatsDisabled
      };

      this.adminService.updateTheaterRoom(this.editingRoom.id, updateData).subscribe({
        next: (updatedRoom) => {
          this.showSuccess('Salle modifiée avec succès');
          this.loadRooms();
          this.cancelForm();
        },
        error: (error) => {
          console.error('Error updating room:', error);
          this.showError('Erreur lors de la modification de la salle');
        }
      });
    } else {
      // Création
      const createData: CreateTheaterRoomDto = {
        theaterId: this.theater.id,
        roomNumber: formValue.roomNumber,
        numberSeats: formValue.numberSeats,
        numberSeatsDisabled: formValue.numberSeatsDisabled
      };

      this.adminService.createTheaterRoom(createData).subscribe({
        next: (newRoom) => {
          this.showSuccess('Salle créée avec succès');
          this.loadRooms();
          this.cancelForm();
        },
        error: (error) => {
          console.error('Error creating room:', error);
          this.showError('Erreur lors de la création de la salle');
        }
      });
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.roomForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.roomForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return `${fieldName} est requis`;
    if (field.errors['min']) return `Valeur minimale: ${field.errors['min'].min}`;
    if (field.errors['max']) return `Valeur maximale: ${field.errors['max'].max}`;

    return 'Champ invalide';
  }
}