import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AdminService, Theater, CreateTheaterDto } from '../../../services/admin.service';
import { TheaterFormDialogComponent } from '../theater-form-dialog/theater-form-dialog.component';

@Component({
  selector: 'app-theaters-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './theaters-management.component.html',
  styleUrls: ['./theaters-management.component.scss']
})
export class TheatersManagementComponent implements OnInit {
  theaters: Theater[] = [];
  filteredTheaters: Theater[] = [];
  displayedColumns: string[] = ['id', 'name', 'location', 'contact', 'hours', 'createDate', 'actions'];
  loading = false;
  searchTerm = '';
  selectedCountry = '';

  countries = [
    { value: 'FR', label: 'France' },
    { value: 'US', label: 'États-Unis' }
  ];

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTheaters();
  }

  loadTheaters(): void {
    this.loading = true;
    // Note: L'API n'a pas d'endpoint pour lister tous les cinémas
    // Pour l'instant, nous simulons avec des données vides
    // Vous devrez implémenter GET /theaters côté backend
    this.loading = false;
    this.theaters = [];
    this.filteredTheaters = [];
    
    // Simulation temporaire avec quelques cinémas d'exemple
    this.simulateTheaters();
  }

  private simulateTheaters(): void {
    // Simulation temporaire - à remplacer par un vrai appel API
    this.theaters = [
      {
        id: 1,
        name: 'Pathé Beaugrenelle',
        zipCode: 75015,
        city: 'Paris',
        address: '7 Rue Linois',
        codeCountry: 'FR',
        openingTime: '09:00',
        closingTime: '00:30',
        phoneNumber: '+33142501250',
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
        moviesTheaters: []
      },
      {
        id: 2,
        name: 'Pathé République',
        zipCode: 75003,
        city: 'Paris',
        address: '2-8 Avenue de la République',
        codeCountry: 'FR',
        openingTime: '08:30',
        closingTime: '01:00',
        phoneNumber: '+33144781818',
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
        moviesTheaters: []
      }
    ];
    this.filteredTheaters = [...this.theaters];
  }

  openCreateTheaterDialog(): void {
    const dialogRef = this.dialog.open(TheaterFormDialogComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createTheater(result);
      }
    });
  }

  openEditTheaterDialog(theater: Theater): void {
    const dialogRef = this.dialog.open(TheaterFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', theater: theater }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateTheater(theater.id, result);
      }
    });
  }

  createTheater(theaterData: CreateTheaterDto): void {
    this.adminService.createTheater(theaterData).subscribe({
      next: (theater) => {
        this.showSuccess('Cinéma créé avec succès');
        this.theaters.push(theater);
        this.applyFilters();
      },
      error: (error) => {
        this.showError('Erreur lors de la création du cinéma');
        console.error('Error creating theater:', error);
      }
    });
  }

  updateTheater(id: number, theaterData: Partial<CreateTheaterDto>): void {
    this.adminService.updateTheater(id, theaterData).subscribe({
      next: (updatedTheater) => {
        this.showSuccess('Cinéma modifié avec succès');
        const index = this.theaters.findIndex(t => t.id === id);
        if (index !== -1) {
          this.theaters[index] = updatedTheater;
          this.applyFilters();
        }
      },
      error: (error) => {
        this.showError('Erreur lors de la modification du cinéma');
        console.error('Error updating theater:', error);
      }
    });
  }

  deleteTheater(theater: Theater): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le cinéma "${theater.name}" ?`)) {
      this.adminService.deleteTheater(theater.id).subscribe({
        next: () => {
          this.showSuccess('Cinéma supprimé avec succès');
          this.theaters = this.theaters.filter(t => t.id !== theater.id);
          this.applyFilters();
        },
        error: (error) => {
          this.showError('Erreur lors de la suppression du cinéma');
          console.error('Error deleting theater:', error);
        }
      });
    }
  }

  viewTheaterDetails(theater: Theater): void {
    this.adminService.getTheaterById(theater.id).subscribe({
      next: (theaterDetails) => {
        // Ici vous pouvez ouvrir un dialog avec les détails complets
        console.log('Theater details:', theaterDetails);
        this.showSuccess('Détails du cinéma chargés');
      },
      error: (error) => {
        this.showError('Erreur lors du chargement des détails');
        console.error('Error loading theater details:', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.theaters];

    // Filtre par nom/ville
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(theater =>
        theater.name.toLowerCase().includes(term) ||
        theater.city.toLowerCase().includes(term) ||
        theater.address.toLowerCase().includes(term)
      );
    }

    // Filtre par pays
    if (this.selectedCountry) {
      filtered = filtered.filter(theater => theater.codeCountry === this.selectedCountry);
    }

    this.filteredTheaters = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCountry = '';
    this.filteredTheaters = [...this.theaters];
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(time: string): string {
    return time.substring(0, 5); // Remove seconds from HH:MM:SS
  }

  formatPhoneNumber(phone: string): string {
    if (phone.startsWith('+33')) {
      return phone.replace('+33', '0').replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    return phone;
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
}