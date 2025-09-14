import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { Booking, BookingStatus } from '../../models/session.model';
import { DateFormatService } from '../../services/date-format.service';
import { MoviesService } from '../../services/movies.service';

@Component({
  selector: 'app-booking-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule
  ],
  template: `
    <div class="booking-details-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>Détails de la réservation #{{ booking.id }}</h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="booking-content">
          <!-- Informations du film -->
          <mat-card class="movie-info-card">
            <mat-card-header>
              <div mat-card-avatar class="movie-avatar" 
                   [style.background-image]="'url(' + getMoviePosterUrl() + ')'">
              </div>
              <mat-card-title>{{ booking.sessionCinema?.movie?.title || 'Film non disponible' }}</mat-card-title>
              <mat-card-subtitle>
                {{ formatDateTime(booking.sessionCinema?.startTime) }}
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="movie-details">
                <div class="detail-row">
                  <mat-icon>location_on</mat-icon>
                  <span>{{ booking.sessionCinema?.movieTheater?.theater?.name }}</span>
                </div>
                <div class="detail-row">
                  <mat-icon>place</mat-icon>
                  <span>{{ booking.sessionCinema?.movieTheater?.theater?.address }}, {{ booking.sessionCinema?.movieTheater?.theater?.city }}</span>
                </div>
                <div class="detail-row">
                  <mat-icon>meeting_room</mat-icon>
                  <span>Salle {{ booking.sessionCinema?.movieTheater?.roomNumber }}</span>
                </div>
                <div class="detail-row">
                  <mat-icon>high_quality</mat-icon>
                  <span>{{ booking.sessionCinema?.quality }} - {{ booking.sessionCinema?.codeLanguage }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Plan de salle avec places réservées -->
          <mat-card class="seats-card">
            <mat-card-header>
              <mat-card-title>Vos places réservées</mat-card-title>
              <mat-card-subtitle>{{ booking.numberSeats }} place(s) - {{ booking.totalPrice }}€</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <!-- Écran -->
              <div class="screen-indicator">
                <div class="screen">ÉCRAN</div>
              </div>

              <!-- Plan de salle simplifié -->
              <div class="seat-map">
                <div class="seat-legend">
                  <div class="legend-item">
                    <div class="seat reserved"></div>
                    <span>Vos places</span>
                  </div>
                  <div class="legend-item">
                    <div class="seat disabled"></div>
                    <span>PMR</span>
                  </div>
                  <div class="legend-item">
                    <div class="seat available"></div>
                    <span>Autres places</span>
                  </div>
                </div>

                <!-- Génération du plan -->
                <div class="seat-grid">
                  <div *ngFor="let row of seatRows; let rowIndex = index" class="seat-row">
                    <div class="row-label">{{ getRowLabel(rowIndex) }}</div>
                    <div class="seats">
                      <div *ngFor="let seat of row" 
                           class="seat"
                           [class.reserved]="isReservedSeat(seat.number)"
                           [class.disabled]="seat.isDisabled"
                           [class.available]="!isReservedSeat(seat.number) && !seat.isDisabled"
                           [title]="getSeatTooltip(seat)">
                        {{ seat.number }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Liste des places réservées -->
              <div class="reserved-seats-list">
                <h4>Places réservées :</h4>
                <div class="seats-chips">
                  <mat-chip *ngFor="let seat of booking.reservedSeats" 
                           [class.pmr-seat]="isDisabledSeat(seat.seatNumber)">
                    <mat-icon *ngIf="isDisabledSeat(seat.seatNumber)">accessible</mat-icon>
                    Place {{ seat.seatNumber }}
                    <span *ngIf="seat.isValidated" class="validated-indicator">
                      <mat-icon>check_circle</mat-icon>
                    </span>
                  </mat-chip>
                </div>
                <p class="seats-note" *ngIf="booking.numberSeatsDisabled > 0">
                  <mat-icon>accessible</mat-icon>
                  {{ booking.numberSeatsDisabled }} place(s) PMR incluse(s)
                </p>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Informations de réservation -->
          <mat-card class="booking-info-card">
            <mat-card-header>
              <mat-card-title>Informations de réservation</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <mat-icon>confirmation_number</mat-icon>
                  <div>
                    <strong>Numéro de réservation</strong>
                    <p>#{{ booking.id }}</p>
                  </div>
                </div>
                <div class="info-item">
                  <mat-icon>today</mat-icon>
                  <div>
                    <strong>Date de réservation</strong>
                    <p>{{ formatDate(booking.createDate) }}</p>
                  </div>
                </div>
                <div class="info-item">
                  <mat-icon>euro</mat-icon>
                  <div>
                    <strong>Prix total</strong>
                    <p class="price">{{ booking.totalPrice }}€</p>
                  </div>
                </div>
                <div class="info-item">
                  <mat-icon>info</mat-icon>
                  <div>
                    <strong>Statut</strong>
                    <mat-chip [ngClass]="'chip-' + booking.status.toLowerCase()">
                      <mat-icon>{{ getStatusIcon(booking.status) }}</mat-icon>
                      {{ getStatusText(booking.status) }}
                    </mat-chip>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-button (click)="viewMovie()" *ngIf="booking.sessionCinema?.movie?.id">
          <mat-icon>movie</mat-icon>
          Voir le film
        </button>
        <button mat-button mat-dialog-close>
          <mat-icon>close</mat-icon>
          Fermer
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .booking-details-dialog {
      min-width: 600px;
      max-width: 800px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 20px 0 20px;
    }

    .dialog-header h2 {
      margin: 0;
      color: #333;
    }

    .booking-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 0 20px;
    }

    .movie-info-card {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    }

    .movie-avatar {
      background-size: cover;
      background-position: center;
      background-color: #ccc;
      width: 60px;
      height: 90px;
      border-radius: 4px;
    }

    .movie-details {
      margin-top: 15px;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      font-size: 14px;
    }

    .detail-row mat-icon {
      color: #666;
      font-size: 18px;
    }

    .seats-card {
      background: #fafafa;
    }

    .screen-indicator {
      text-align: center;
      margin-bottom: 20px;
    }

    .screen {
      background: linear-gradient(135deg, #333, #666);
      color: white;
      padding: 10px 30px;
      border-radius: 15px;
      display: inline-block;
      font-weight: bold;
      font-size: 14px;
    }

    .seat-legend {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
    }

    .seat-map {
      margin: 20px 0;
    }

    .seat-grid {
      max-width: 400px;
      margin: 0 auto;
    }

    .seat-row {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      justify-content: center;
    }

    .row-label {
      width: 25px;
      text-align: center;
      font-weight: bold;
      margin-right: 10px;
      font-size: 12px;
    }

    .seats {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .seat {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      cursor: default;
      border: 1px solid transparent;
    }

    .seat.reserved {
      background: #d32f2f;
      color: white;
      border-color: #b71c1c;
      box-shadow: 0 2px 4px rgba(211, 47, 47, 0.3);
    }

    .seat.disabled {
      background: #e0e0e0;
      color: #757575;
      border-color: #bdbdbd;
    }

    .seat.available {
      background: #e8f5e8;
      color: #2e7d2e;
      border-color: #4caf50;
    }

    .reserved-seats-list {
      margin-top: 20px;
    }

    .reserved-seats-list h4 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .seats-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 15px;
    }

    .seats-chips mat-chip {
      background: #d32f2f;
      color: white;
    }

    .pmr-seat {
      background: #ff9800 !important;
    }

    .validated-indicator {
      margin-left: 5px;
    }

    .validated-indicator mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #4caf50;
    }

    .seats-note {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #666;
      margin: 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      padding: 15px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .info-item mat-icon {
      color: #d32f2f;
      margin-top: 2px;
    }

    .info-item strong {
      display: block;
      margin-bottom: 5px;
      color: #333;
      font-size: 14px;
    }

    .info-item p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .price {
      font-weight: bold !important;
      color: #d32f2f !important;
      font-size: 16px !important;
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

    @media (max-width: 600px) {
      .booking-details-dialog {
        min-width: auto;
        width: 95vw;
        max-width: 95vw;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }
      
      .seat-legend {
        gap: 15px;
      }
      
      .seats {
        gap: 3px;
      }
      
      .seat {
        width: 24px;
        height: 24px;
        font-size: 9px;
      }
    }
  `]
})
export class BookingDetailsDialogComponent {
  seatRows: any[][] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public booking: Booking,
    private dialogRef: MatDialogRef<BookingDetailsDialogComponent>,
    private router: Router,
    private dateFormatService: DateFormatService,
    private moviesService: MoviesService
  ) {
    this.generateSeatMap();
  }

  private generateSeatMap() {
    // Génération simplifiée du plan de salle basée sur les places réservées
    const reservedSeats = this.booking.reservedSeats?.map(seat => seat.seatNumber) || [];
    const maxSeat = Math.max(...reservedSeats, 50); // Minimum 50 places pour l'affichage
    const seatsPerRow = 8;
    const numRows = Math.ceil(maxSeat / seatsPerRow);

    this.seatRows = [];

    for (let row = 0; row < numRows; row++) {
      const seatRow: any[] = [];
      const startSeat = row * seatsPerRow + 1;
      const endSeat = Math.min(startSeat + seatsPerRow - 1, maxSeat);

      for (let seatNum = startSeat; seatNum <= endSeat; seatNum++) {
        seatRow.push({
          number: seatNum,
          isDisabled: this.isDisabledSeat(seatNum),
          row: this.getRowLabel(row),
          column: seatNum - startSeat + 1
        });
      }
      
      this.seatRows.push(seatRow);
    }
  }

  getRowLabel(rowIndex: number): string {
    return String.fromCharCode(65 + rowIndex); // A, B, C, etc.
  }

  isReservedSeat(seatNumber: number): boolean {
    return this.booking.reservedSeats?.some(seat => seat.seatNumber === seatNumber) || false;
  }

  isDisabledSeat(seatNumber: number): boolean {
    // Les places PMR sont généralement dans les premières rangées et colonnes
    const row = Math.floor((seatNumber - 1) / 8);
    const column = (seatNumber - 1) % 8;
    return row < 2 && column <= 1;
  }

  getSeatTooltip(seat: any): string {
    if (this.isReservedSeat(seat.number)) {
      return `Votre place ${seat.number}`;
    }
    if (seat.isDisabled) {
      return `Place PMR ${seat.number}`;
    }
    return `Place ${seat.number}`;
  }

  getMoviePosterUrl(): string {
    const posterPath = this.booking.sessionCinema?.movie?.posterPath;
    return this.moviesService.getPosterUrl(posterPath);
  }

  getStatusIcon(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.PENDING: return 'schedule';
      case BookingStatus.VALIDATED: return 'check_circle';
      case BookingStatus.CANCELLED: return 'cancel';
      default: return 'help';
    }
  }

  getStatusText(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.PENDING: return 'En attente';
      case BookingStatus.VALIDATED: return 'Confirmée';
      case BookingStatus.CANCELLED: return 'Annulée';
      default: return 'Inconnu';
    }
  }

  formatDate(dateString: string): string {
    return this.dateFormatService.formatDate(dateString);
  }

  formatDateTime(dateTime?: string): string {
    if (!dateTime) return 'Date non disponible';
    return this.dateFormatService.formatDateTime(dateTime);
  }

  viewMovie() {
    if (this.booking.sessionCinema?.movie?.id) {
      this.dialogRef.close();
      this.router.navigate(['/movies', this.booking.sessionCinema.movie.id]);
    }
  }
}