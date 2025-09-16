import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AdminService, Booking } from '../../../services/admin.service';
import { DateFormatService } from '../../../services/date-format.service';
import { BookingDetailsDialogComponent } from '../booking-details-dialog/booking-details-dialog.component';

@Component({
  selector: 'app-bookings-management',
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
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSortModule
  ],
  templateUrl: './bookings-management.component.html',
  styleUrls: ['./bookings-management.component.scss']
})
export class BookingsManagementComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  displayedColumns: string[] = ['id', 'user', 'movie', 'session', 'theater', 'totalPrice', 'status', 'createDate', 'actions'];
  loading = false;
  searchTerm = '';
  selectedStatus = '';
  selectedTheater = '';

  statuses = [
    { value: '', label: 'Tous les statuts' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'CONFIRMED', label: 'Confirmée' },
    { value: 'VALIDATED', label: 'Validée' },
    { value: 'CANCELLED', label: 'Annulée' },
    { value: 'COMPLETED', label: 'Terminée' }
  ];

  theaters: any[] = [];

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private dateFormatService: DateFormatService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
    this.loadTheaters();
  }

  loadBookings(): void {
    console.log('Loading bookings from API...');
    this.loading = true;
    
    this.adminService.getAllBookings().subscribe({
      next: (bookings) => {
        console.log('Bookings loaded successfully:', bookings);


        // Trier par date de commande (plus récentes en premier)
        this.bookings = bookings.sort((a, b) => {
          const dateA = new Date(a.createDate).getTime();
          const dateB = new Date(b.createDate).getTime();
          return dateB - dateA; // Tri décroissant (plus récent en premier)
        });
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.bookings = [];
        this.filteredBookings = [];
        this.loading = false;
        this.showError('Erreur lors du chargement des réservations');
      }
    });
  }

  loadTheaters(): void {
    this.adminService.getTheaters().subscribe({
      next: (theaters) => {
        console.log('Theaters loaded successfully:', theaters);
        this.theaters = [
          { id: '', name: 'Tous les cinémas' },
          ...theaters
        ];
      },
      error: (error) => {
        console.error('Error loading theaters:', error);
        this.theaters = [{ id: '', name: 'Tous les cinémas' }];
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.bookings];

    // Filtre par terme de recherche (nom d'utilisateur, email, titre du film)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(booking => 
        booking.user?.firstName?.toLowerCase().includes(term) ||
        booking.user?.lastName?.toLowerCase().includes(term) ||
        booking.user?.email?.toLowerCase().includes(term) ||
        booking.id.toString().includes(term)
      );
    }

    // Filtre par statut
    if (this.selectedStatus) {
      filtered = filtered.filter(booking => booking.status === this.selectedStatus);
    }

    // Filtre par cinéma
    if (this.selectedTheater) {
      console.log('Filtering by theater ID:', this.selectedTheater);
      filtered = filtered.filter(booking => {
        // Vérifier si la réservation a une session avec un cinéma
        if (booking.sessionCinema?.movieTheater?.theater?.id) {
          const theaterMatch = booking.sessionCinema.movieTheater.theater.id.toString() === this.selectedTheater.toString();
          console.log(`Booking ${booking.id}: theater ID ${booking.sessionCinema.movieTheater.theater.id}, matches: ${theaterMatch}`);
          return theaterMatch;
        }

        // Fallback: vérifier via theaterId si theater n'est pas disponible
        if (booking.sessionCinema?.movieTheater?.theaterId) {
          const theaterMatch = booking.sessionCinema.movieTheater.theaterId.toString() === this.selectedTheater.toString();
          console.log(`Booking ${booking.id}: theaterId ${booking.sessionCinema.movieTheater.theaterId}, matches: ${theaterMatch}`);
          return theaterMatch;
        }

        console.log(`Booking ${booking.id}: no theater information found`);
        return false; // Exclure les réservations sans information de cinéma
      });
      console.log(`Filtered ${filtered.length} bookings for theater ${this.selectedTheater}`);
    }

    this.filteredBookings = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedTheater = '';
    this.applyFilters();
  }

  validateBooking(booking: Booking): void {
    if (confirm(`Êtes-vous sûr de vouloir valider la réservation #${booking.id} ?`)) {
      this.adminService.validateBooking(booking.id).subscribe({
        next: () => {
          this.showSuccess('Réservation validée avec succès');
          this.loadBookings(); // Recharger la liste
        },
        error: (error) => {
          console.error('Error validating booking:', error);
          this.showError('Erreur lors de la validation de la réservation');
        }
      });
    }
  }

  viewBookingDetails(booking: Booking): void {
    const dialogRef = this.dialog.open(BookingDetailsDialogComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'booking-details-dialog',
      data: { bookingId: booking.id }
    });

    dialogRef.afterClosed().subscribe(() => {
      // Recharger la liste des réservations pour avoir les données à jour
      this.loadBookings();
    });
  }

  getStatusLabel(status: string): string {
    const statusObj = this.statuses.find(s => s.value === status);
    return statusObj?.label || status;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'accent';
      case 'CONFIRMED':
        return 'primary';
      case 'VALIDATED':
        return 'primary';
      case 'CANCELLED':
        return 'warn';
      case 'COMPLETED':
        return 'primary';
      default:
        return '';
    }
  }

  formatDate(date: string): string {
    return this.dateFormatService.formatDate(date);
  }

  formatDateTime(dateTime: string): string {
    return this.dateFormatService.formatDateTime(dateTime);
  }

  formatPrice(price: number): string {
    if (typeof price === 'number' && !isNaN(price)) {
      return `${price.toFixed(2)}€`;
    }
    if (typeof price === 'string' && !isNaN(parseFloat(price))) {
      return `${parseFloat(price).toFixed(2)}€`;
    }
    return '0,00€';
  }

  getUserDisplayName(user: any): string {
    if (!user) return 'Utilisateur inconnu';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName} ${lastName}`.trim() || user.email || 'Utilisateur';
  }

  getMovieTitle(booking: Booking): string {
    // Essayer de récupérer le titre du film depuis différentes sources possibles
    if (booking.sessionCinema?.movie?.title) {
      return booking.sessionCinema.movie.title;
    }
    return 'Film inconnu';
  }

  getSessionInfo(booking: Booking): string {
    if (!booking.sessionCinema) return 'Session inconnue';
    
    const startTime = booking.sessionCinema.startTime;
    if (startTime) {
      return this.formatDateTime(startTime);
    }
    return 'Horaire inconnu';
  }

  getTheaterInfo(booking: Booking): string {
    if (booking.sessionCinema?.movieTheater?.theater) {
      const theater = booking.sessionCinema.movieTheater.theater;
      const room = booking.sessionCinema.movieTheater.roomNumber;
      return `${theater.name} - Salle ${room}`;
    }

    // Essayer de trouver le théâtre via l'ID
    if (booking.sessionCinema?.movieTheater?.theaterId) {
      const theaterId = booking.sessionCinema.movieTheater.theaterId;
      const theater = this.theaters.find(t => t.id === theaterId);
      if (theater) {
        const room = booking.sessionCinema.movieTheater.roomNumber;
        return `${theater.name} - Salle ${room}`;
      }
    }

    return 'Cinéma inconnu';
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