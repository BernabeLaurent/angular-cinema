import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { SessionsService } from '../../services/sessions.service';
import { AuthService } from '../../auth/auth.service';
import { Booking, BookingStatus } from '../../models/session.model';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="my-bookings-container">
      <div class="header">
        <h1>Mes réservations</h1>
      </div>

      <div class="bookings-list" *ngIf="bookings.length > 0">
        <mat-card *ngFor="let booking of bookings" class="booking-card">
          <mat-card-header>
            <div mat-card-avatar class="booking-status" [ngClass]="'status-' + booking.status.toLowerCase()">
              <mat-icon>{{ getStatusIcon(booking.status) }}</mat-icon>
            </div>
            <mat-card-title>{{ booking.sessionCinema?.movie?.title || 'Film non disponible' }}</mat-card-title>
            <mat-card-subtitle>
              Réservation #{{ booking.id }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="booking-details">
              <!-- Informations sur la séance -->
              <div class="session-info">
                <h3>Séance</h3>
                <div class="info-row">
                  <mat-icon>schedule</mat-icon>
                  <span>{{ formatDateTime(booking.sessionCinema?.startTime) }}</span>
                </div>
                <div class="info-row" *ngIf="booking.sessionCinema?.movieTheater?.theater">
                  <mat-icon>location_on</mat-icon>
                  <span>{{ booking.sessionCinema?.movieTheater?.theater?.name }} - {{ booking.sessionCinema?.movieTheater?.theater?.city }}</span>
                </div>
                <div class="info-row">
                  <mat-icon>meeting_room</mat-icon>
                  <span>Salle {{ booking.sessionCinema?.movieTheater?.roomNumber }}</span>
                </div>
                <div class="info-row">
                  <mat-icon>high_quality</mat-icon>
                  <span>{{ booking.sessionCinema?.quality }} - {{ booking.sessionCinema?.codeLanguage }}</span>
                </div>
              </div>

              <!-- Informations sur la réservation -->
              <div class="reservation-info">
                <h3>Réservation</h3>
                <div class="info-row">
                  <mat-icon>event_seat</mat-icon>
                  <span>{{ booking.numberSeats }} place(s)</span>
                  <span *ngIf="booking.numberSeatsDisabled > 0"> ({{ booking.numberSeatsDisabled }} PMR)</span>
                </div>
                <div class="info-row" *ngIf="booking.reservedSeats && booking.reservedSeats.length > 0">
                  <mat-icon>chair</mat-icon>
                  <span>Places: {{ getSeatsText(booking.reservedSeats) }}</span>
                </div>
                <div class="info-row">
                  <mat-icon>euro</mat-icon>
                  <span class="price">{{ booking.totalPrice }}€</span>
                </div>
                <div class="info-row">
                  <mat-icon>calendar_today</mat-icon>
                  <span>Réservé le {{ formatDate(booking.createDate) }}</span>
                </div>
              </div>
            </div>

            <!-- Statut de la réservation -->
            <div class="booking-status-section">
              <mat-chip-listbox>
                <mat-chip [ngClass]="'chip-' + booking.status.toLowerCase()">
                  <mat-icon>{{ getStatusIcon(booking.status) }}</mat-icon>
                  {{ getStatusText(booking.status) }}
                </mat-chip>
              </mat-chip-listbox>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button 
              mat-button 
              color="primary" 
              *ngIf="booking.status === 'PENDING'"
              (click)="validateBooking(booking)">
              <mat-icon>check_circle</mat-icon>
              Valider
            </button>
            <button 
              mat-button 
              color="warn" 
              *ngIf="booking.status === 'PENDING' || booking.status === 'VALIDATED'"
              (click)="cancelBooking(booking)">
              <mat-icon>cancel</mat-icon>
              Annuler
            </button>
            <button mat-button (click)="showBookingDetails(booking)">
              <mat-icon>info</mat-icon>
              Détails
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="no-bookings" *ngIf="bookings.length === 0 && !loading">
        <mat-card>
          <mat-card-content>
            <div class="empty-state">
              <mat-icon>event_seat</mat-icon>
              <h3>Aucune réservation</h3>
              <p>Vous n'avez pas encore effectué de réservation.</p>
              <button mat-raised-button color="primary" routerLink="/booking">
                Réserver maintenant
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="loading" *ngIf="loading">
        <p>Chargement de vos réservations...</p>
      </div>
    </div>
  `,
  styles: [`
    .my-bookings-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 30px;
    }

    .header h1 {
      color: #333;
      font-size: 28px;
      margin: 0;
    }

    .bookings-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .booking-card {
      transition: all 0.3s;
    }

    .booking-card:hover {
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .booking-status {
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .booking-status.status-pending {
      background: #ff9800;
      color: white;
    }

    .booking-status.status-validated {
      background: #4caf50;
      color: white;
    }

    .booking-status.status-cancelled {
      background: #f44336;
      color: white;
    }

    .booking-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .session-info, .reservation-info {
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .session-info h3, .reservation-info h3 {
      margin: 0 0 15px 0;
      color: #d32f2f;
      font-size: 16px;
      font-weight: 600;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      font-size: 14px;
    }

    .info-row mat-icon {
      font-size: 18px;
      color: #666;
    }

    .info-row .price {
      font-weight: bold;
      color: #d32f2f;
      font-size: 16px;
    }

    .booking-status-section {
      margin-bottom: 15px;
    }

    .chip-pending {
      background: #fff3e0;
      color: #e65100;
    }

    .chip-validated {
      background: #e8f5e8;
      color: #2e7d2e;
    }

    .chip-cancelled {
      background: #ffebee;
      color: #c62828;
    }

    .no-bookings {
      margin-top: 40px;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      color: #666;
      margin: 20px 0 10px 0;
    }

    .empty-state p {
      color: #999;
      margin-bottom: 30px;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    @media (max-width: 768px) {
      .booking-details {
        grid-template-columns: 1fr;
        gap: 15px;
      }
      
      .info-row {
        font-size: 13px;
      }
      
      .session-info h3, .reservation-info h3 {
        font-size: 14px;
      }
    }
  `]
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  loading = true;

  constructor(
    private sessionsService: SessionsService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.snackBar.open('Vous devez être connecté pour voir vos réservations', 'Fermer', { duration: 3000 });
      return;
    }

    this.sessionsService.getUserBookings(currentUser.id).subscribe({
      next: (bookings) => {
        this.bookings = bookings.sort((a, b) => 
          new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réservations:', error);
        this.snackBar.open('Erreur lors du chargement des réservations', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  getStatusIcon(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.PENDING:
        return 'schedule';
      case BookingStatus.VALIDATED:
        return 'check_circle';
      case BookingStatus.CANCELLED:
        return 'cancel';
      default:
        return 'help';
    }
  }

  getStatusText(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.PENDING:
        return 'En attente';
      case BookingStatus.VALIDATED:
        return 'Confirmée';
      case BookingStatus.CANCELLED:
        return 'Annulée';
      default:
        return 'Inconnu';
    }
  }

  formatDateTime(dateTime: string | undefined): string {
    if (!dateTime) return 'Date non disponible';
    const date = new Date(dateTime);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getSeatsText(reservedSeats: any[]): string {
    return reservedSeats
      .map(seat => seat.seatNumber)
      .sort((a, b) => a - b)
      .join(', ');
  }

  validateBooking(booking: Booking) {
    if (confirm('Voulez-vous vraiment confirmer cette réservation ?')) {
      this.sessionsService.validateBooking(booking.id).subscribe({
        next: (updatedBooking) => {
          const index = this.bookings.findIndex(b => b.id === booking.id);
          if (index > -1) {
            this.bookings[index] = updatedBooking;
          }
          this.snackBar.open('Réservation confirmée avec succès!', 'Fermer', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Erreur lors de la validation:', error);
          this.snackBar.open('Erreur lors de la validation de la réservation', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  cancelBooking(booking: Booking) {
    if (confirm('Voulez-vous vraiment annuler cette réservation ?')) {
      this.sessionsService.cancelBooking(booking.id).subscribe({
        next: (updatedBooking) => {
          const index = this.bookings.findIndex(b => b.id === booking.id);
          if (index > -1) {
            this.bookings[index] = updatedBooking;
          }
          this.snackBar.open('Réservation annulée avec succès!', 'Fermer', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Erreur lors de l\'annulation:', error);
          this.snackBar.open('Erreur lors de l\'annulation de la réservation', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  showBookingDetails(booking: Booking) {
    // TODO: Implémenter une modale avec plus de détails
    console.log('Détails de la réservation:', booking);
  }
}