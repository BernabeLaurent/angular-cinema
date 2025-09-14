import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { SessionsService } from '../../services/sessions.service';
import { AuthService } from '../../auth/auth.service';
import { DateFormatService } from '../../services/date-format.service';
import { SessionBookingInfo, SeatMap, CreateBookingDto, CreateBookingDetailDto } from '../../models/session.model';

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <div class="seat-selection-container" *ngIf="bookingInfo">
      <!-- En-tête avec informations de la séance -->
      <mat-card class="session-info-card">
        <mat-card-header>
          <mat-card-title>{{ bookingInfo.sessionCinema.movie?.title }}</mat-card-title>
          <mat-card-subtitle>
            {{ formatDateTime(bookingInfo.sessionCinema.startTime) }} -
            {{ bookingInfo.sessionCinema.movieTheater?.theater?.name }}
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="session-details">
            <span class="detail">Salle {{ bookingInfo.sessionCinema.movieTheater?.roomNumber }}</span>
            <span class="detail">{{ bookingInfo.sessionCinema.quality }}</span>
            <span class="detail">{{ bookingInfo.sessionCinema.codeLanguage }}</span>
            <span class="detail price">{{ bookingInfo.pricePerSeat }}€ par place</span>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Plan de salle -->
      <mat-card class="seat-map-card">
        <mat-card-header>
          <mat-card-title>Sélectionnez vos places</mat-card-title>
          <mat-card-subtitle>{{ selectedSeats.length }} place(s) sélectionnée(s)</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Écran -->
          <div class="screen">
            <div class="screen-indicator">ÉCRAN</div>
          </div>

          <!-- Légende -->
          <div class="legend">
            <div class="legend-item">
              <div class="seat available"></div>
              <span>Disponible</span>
            </div>
            <div class="legend-item">
              <div class="seat selected"></div>
              <span>Sélectionnée</span>
            </div>
            <div class="legend-item">
              <div class="seat occupied"></div>
              <span>Occupée</span>
            </div>
            <div class="legend-item">
              <div class="seat disabled"></div>
              <span>PMR</span>
            </div>
          </div>

          <!-- Plan de salle -->
          <div class="seat-grid">
            <div *ngFor="let row of seatRows; let rowIndex = index" class="seat-row">
              <div class="row-label">{{ getRowLabel(rowIndex) }}</div>
              <div class="seats">
                <div
                  *ngFor="let seat of row; let seatIndex = index"
                  class="seat"
                  [class.available]="seat.isAvailable"
                  [class.occupied]="seat.isOccupied"
                  [class.disabled]="seat.isDisabled"
                  [class.selected]="seat.isSelected"
                  [title]="getSeatTooltip(seat)"
                  (click)="toggleSeat(seat)">
                  {{ seat.seatNumber }}
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Résumé et validation -->
      <mat-card class="booking-summary" *ngIf="selectedSeats.length > 0">
        <mat-card-header>
          <mat-card-title>Résumé de votre réservation</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="summary-details">
            <div class="summary-row">
              <span>Places sélectionnées:</span>
              <span>{{ getSelectedSeatsText() }}</span>
            </div>
            <div class="summary-row">
              <span>Nombre de places:</span>
              <span>{{ selectedSeats.length }}</span>
            </div>
            <div class="summary-row">
              <span>Prix unitaire:</span>
              <span>{{ bookingInfo.pricePerSeat }}€</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>{{ getTotalPrice() }}€</span>
            </div>
          </div>

          <!-- Message de connexion requis si non connecté -->
          <div class="login-required" *ngIf="!currentUser">
            <div class="login-message">
              <mat-icon>account_circle</mat-icon>
              <h3>Connexion requise</h3>
              <p>Vous devez être connecté pour effectuer une réservation.</p>
              <button mat-raised-button color="primary" (click)="redirectToLogin()">
                <mat-icon>login</mat-icon>
                Se connecter
              </button>
            </div>
          </div>

          <div class="booking-actions">
            <button mat-button (click)="goBack()">Retour</button>
            <button mat-button (click)="viewMovieDetails()" *ngIf="bookingInfo?.sessionCinema?.movie?.id">
              <mat-icon>info</mat-icon>
              Voir les détails du film
            </button>
            <button
              mat-raised-button
              color="primary"
              [disabled]="!canConfirmBooking()"
              (click)="confirmBooking()"
              *ngIf="currentUser">
              Confirmer la réservation
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="loading" *ngIf="loading">
      <p>Chargement du plan de salle...</p>
    </div>
  `,
  styles: [`
    .seat-selection-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
      color: #333;
    }
    
    /* Force text colors to black for main content */
    .seat-map-card mat-card-title,
    .seat-map-card mat-card-subtitle,
    .booking-summary mat-card-title,
    .booking-summary mat-card-subtitle,
    .summary-details,
    .user-form,
    .user-form h3,
    .loading {
      color: #333 !important;
    }

    .session-info-card {
      margin-bottom: 20px;
      background: linear-gradient(135deg, #1a1a1a, #333);
      color: white;
    }

    .session-details {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .detail {
      padding: 5px 10px;
      background: rgba(255,255,255,0.1);
      border-radius: 15px;
      font-size: 14px;
    }

    .detail.price {
      background: #d32f2f;
      color: white;
      font-weight: bold;
    }

    .seat-map-card {
      margin-bottom: 20px;
    }

    .screen {
      text-align: center;
      margin-bottom: 30px;
    }

    .screen-indicator {
      background: linear-gradient(135deg, #333, #666);
      color: white;
      padding: 15px 40px;
      border-radius: 20px;
      display: inline-block;
      font-weight: bold;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }

    .legend {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .seat-grid {
      max-width: 800px;
      margin: 0 auto;
    }

    .seat-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      justify-content: center;
    }

    .row-label {
      width: 30px;
      text-align: center;
      font-weight: bold;
      margin-right: 10px;
    }

    .seats {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .seat {
      width: 35px;
      height: 35px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
      border: 2px solid transparent;
    }

    .seat.available {
      background: #e8f5e8;
      color: #2e7d2e;
      border-color: #4caf50;
    }

    .seat.available:hover {
      background: #c8e6c9;
      transform: scale(1.1);
    }

    .seat.selected {
      background: #d32f2f;
      color: white;
      border-color: #b71c1c;
      transform: scale(1.1);
    }

    .seat.occupied {
      background: #ffcdd2;
      color: #c62828;
      border-color: #f44336;
      cursor: not-allowed;
    }

    .seat.disabled {
      background: #e0e0e0;
      color: #757575;
      border-color: #bdbdbd;
    }

    .seat.disabled:hover {
      background: #f5f5f5;
      transform: scale(1.05);
    }

    .booking-summary {
      margin-bottom: 20px;
    }

    .summary-details {
      margin-bottom: 20px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding: 5px 0;
    }

    .summary-row.total {
      border-top: 2px solid #ddd;
      padding-top: 15px;
      margin-top: 15px;
      font-size: 18px;
      font-weight: bold;
      color: #d32f2f;
    }

    .user-form {
      margin: 20px 0;
    }

    .user-form h3 {
      margin-bottom: 15px;
      color: #333;
    }

    .full-width {
      width: 100%;
    }

    .booking-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .login-required {
      margin: 20px 0;
      padding: 30px;
      background: #fff3e0;
      border: 2px solid #ff9800;
      border-radius: 12px;
      text-align: center;
    }

    .login-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }

    .login-message mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ff9800;
    }

    .login-message h3 {
      margin: 0;
      color: #333;
      font-size: 20px;
    }

    .login-message p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .login-message button {
      margin-top: 10px;
    }

    @media (max-width: 768px) {
      .seat {
        width: 30px;
        height: 30px;
        font-size: 10px;
      }

      .seats {
        gap: 4px;
      }

      .legend {
        gap: 15px;
      }

      .session-details {
        gap: 10px;
      }
    }
  `]
})
export class SeatSelectionComponent implements OnInit {
  sessionId: number | null = null;
  bookingInfo: SessionBookingInfo | null = null;
  seatRows: SeatMap[][] = [];
  selectedSeats: SeatMap[] = [];
  currentUser: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionsService: SessionsService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dateFormatService: DateFormatService
  ) {}

  ngOnInit() {
    this.sessionId = Number(this.route.snapshot.paramMap.get('sessionId'));
    this.currentUser = this.authService.getCurrentUser();

    if (this.sessionId) {
      this.loadBookingInfo();
    }
  }

  loadBookingInfo() {
    if (!this.sessionId) return;

    this.sessionsService.getSessionBookingInfo(this.sessionId).subscribe({
      next: (info) => {
        this.bookingInfo = info;
        this.generateSeatMap();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des informations de réservation:', error);
        this.snackBar.open('Erreur lors du chargement du plan de salle', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  generateSeatMap() {
    if (!this.bookingInfo) return;

    const totalSeats = this.bookingInfo.totalSeats;
    const occupiedSeats = this.bookingInfo.occupiedSeats;
    const seatsPerRow = 10; // Configuration par défaut
    const numRows = Math.ceil(totalSeats / seatsPerRow);

    this.seatRows = [];

    for (let row = 0; row < numRows; row++) {
      const seatRow: SeatMap[] = [];
      const startSeat = row * seatsPerRow + 1;
      const endSeat = Math.min(startSeat + seatsPerRow - 1, totalSeats);

      for (let seatNum = startSeat; seatNum <= endSeat; seatNum++) {
        const seat: SeatMap = {
          seatNumber: seatNum,
          isOccupied: occupiedSeats.includes(seatNum),
          isDisabled: this.isSeatDisabled(seatNum, row), // Places PMR généralement en bas
          isSelected: false,
          row: this.getRowLabel(row),
          column: seatNum - startSeat + 1
        };

        // Une place est disponible si elle n'est ni occupée ni désactivée
        (seat as any).isAvailable = !seat.isOccupied && !seat.isDisabled;

        seatRow.push(seat);
      }

      this.seatRows.push(seatRow);
    }
  }

  isSeatDisabled(seatNumber: number, row: number): boolean {
    // Places PMR généralement dans les 2 premières rangées
    return row < 2 && seatNumber % 10 <= 2;
  }

  getRowLabel(rowIndex: number): string {
    return String.fromCharCode(65 + rowIndex); // A, B, C, etc.
  }

  toggleSeat(seat: SeatMap) {
    if (seat.isOccupied) return;

    const seatWithAvailable = seat as any;

    if (seatWithAvailable.isAvailable || seat.isDisabled) {
      seat.isSelected = !seat.isSelected;

      if (seat.isSelected) {
        this.selectedSeats.push(seat);
      } else {
        this.selectedSeats = this.selectedSeats.filter(s => s.seatNumber !== seat.seatNumber);
      }
    }
  }

  getSeatTooltip(seat: SeatMap): string {
    if (seat.isOccupied) return 'Place occupée';
    if (seat.isDisabled) return 'Place PMR';
    if (seat.isSelected) return 'Place sélectionnée';
    return `Place ${seat.seatNumber}`;
  }

  getSelectedSeatsText(): string {
    return this.selectedSeats
      .map(seat => `${seat.row}${seat.column}`)
      .join(', ');
  }

  getTotalPrice(): number {
    if (!this.bookingInfo) return 0;
    return this.selectedSeats.length * this.bookingInfo.pricePerSeat;
  }

  canConfirmBooking(): boolean {
    return this.selectedSeats.length > 0 && this.currentUser;
  }


  confirmBooking() {
    if (!this.canConfirmBooking() || !this.bookingInfo || !this.sessionId || !this.currentUser) {
      this.snackBar.open('Vous devez être connecté pour effectuer une réservation', 'Fermer', { duration: 3000 });
      return;
    }

    const userId = this.currentUser.id;
    const reservedSeats: CreateBookingDetailDto[] = this.selectedSeats.map(seat => ({
      seatNumber: seat.seatNumber,
      isValidated: false
    }));

    const bookingDto: CreateBookingDto = {
      userId: userId,
      sessionCinemaId: this.sessionId,
      numberSeats: this.selectedSeats.length,
      numberSeatsDisabled: this.selectedSeats.filter(seat => seat.isDisabled).length,
      totalPrice: this.getTotalPrice(),
      reservedSeats: reservedSeats
    };

    this.sessionsService.createBooking(bookingDto).subscribe({
      next: (booking) => {
        this.snackBar.open('Réservation confirmée avec succès!', 'Fermer', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });

        // Rediriger vers la page de confirmation ou mes réservations
        this.router.navigate(['/my-bookings']);
      },
      error: (error) => {
        console.error('Erreur lors de la création de la réservation:', error);
        this.snackBar.open('Erreur lors de la réservation. Veuillez réessayer.', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/booking']);
  }

  redirectToLogin() {
    // Sauvegarder l'URL actuelle pour revenir après connexion
    const returnUrl = this.router.url;
    this.router.navigate(['/login'], { queryParams: { returnUrl } });
  }

  viewMovieDetails() {
    if (this.bookingInfo?.sessionCinema?.movie?.id) {
      this.router.navigate(['/movies', this.bookingInfo?.sessionCinema?.movie.id]);
    }
  }

  formatDateTime(dateTime: string): string {
    return this.dateFormatService.formatDateTime(dateTime);
  }
}
