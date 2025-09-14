import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

import { AdminService, Booking, BookingDetail } from '../../../services/admin.service';
import { DateFormatService } from '../../../services/date-format.service';
import { RoleUser } from '../../../users/enums/roles-users.enum';

@Component({
  selector: 'app-booking-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './booking-details-dialog.component.html',
  styleUrls: ['./booking-details-dialog.component.scss']
})
export class BookingDetailsDialogComponent implements OnInit {
  booking!: Booking;
  loading = false;
  originalStatus: string;
  dataSource = new MatTableDataSource<BookingDetail>([]);
  
  displayedColumns: string[] = ['seatNumber', 'price', 'status', 'createDate', 'actions'];

  statusOptions = [
    { value: 'PENDING', label: 'En attente', color: 'accent' },
    { value: 'CONFIRMED', label: 'Confirmée', color: 'primary' },
    { value: 'VALIDATED', label: 'Validée', color: 'primary' },
    { value: 'CANCELLED', label: 'Annulée', color: 'warn' },
    { value: 'COMPLETED', label: 'Terminée', color: 'primary' }
  ];

  constructor(
    public dialogRef: MatDialogRef<BookingDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { bookingId: number },
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private dateFormatService: DateFormatService,
    private cdr: ChangeDetectorRef
  ) {
    this.originalStatus = '';
  }

  ngOnInit(): void {
    this.loadBookingDetails();
  }

  loadBookingDetails(): void {
    console.log('Loading booking details for ID:', this.data.bookingId);
    this.loading = true;

    // Charger d'abord les détails du booking
    this.adminService.getBookingById(this.data.bookingId).subscribe({
      next: (booking) => {
        console.log('Booking details loaded successfully:', booking);
        this.booking = booking;
        this.originalStatus = booking.status;

        // Essayer de récupérer les vrais booking details depuis l'API
        this.adminService.getBookingDetails(this.data.bookingId).subscribe({
          next: (bookingDetails) => {
            console.log('Real booking details loaded:', bookingDetails);
            if (bookingDetails && bookingDetails.length > 0) {
              this.dataSource.data = bookingDetails;
            } else {
              // Si pas de vrais booking details, générer des données fictives
              const generatedSeats = this.generateBookingDetailsFromReservation(this.booking);
              this.dataSource.data = generatedSeats;
            }
            this.cdr.detectChanges();
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading real booking details:', error);
            // Fallback vers les données générées
            const generatedSeats = this.generateBookingDetailsFromReservation(this.booking);
            this.dataSource.data = generatedSeats;
            this.cdr.detectChanges();
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading booking details:', error);
        console.error('Error details:', error.error);
        console.error('Status:', error.status);
        
        // Créer des données de test pour le débogage
        this.createTestBookingData();
        this.loading = false; // Mettre à false APRÈS avoir créé les données
        this.showError(`Erreur ${error.status}: Utilisation de données de test`);
      }
    });
  }

  private createTestBookingData(): void {
    // Données de test pour permettre de voir l'interface
    this.booking = {
      id: this.data.bookingId,
      reservationDate: new Date().toISOString(),
      status: 'PENDING',
      totalPrice: 25.00,
      createDate: new Date().toISOString(),
      updateDate: new Date().toISOString(),
      user: {
        id: 1,
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        role: RoleUser.CUSTOMER,
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString()
      },
      bookingDetails: [
        {
          id: 1,
          seatNumber: 'A1',
          status: 'PENDING',
          price: 12.50,
          createDate: new Date().toISOString(),
          updateDate: new Date().toISOString(),
          bookingId: this.data.bookingId
        },
        {
          id: 2,
          seatNumber: 'A2',
          status: 'CONFIRMED',
          price: 12.50,
          createDate: new Date().toISOString(),
          updateDate: new Date().toISOString(),
          bookingId: this.data.bookingId
        }
      ],
      sessionCinema: {
        id: 1,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        quality: 'HD',
        codeLanguage: 'fr',
        movie: {
          id: 1,
          title: 'Film Test'
        },
        movieTheater: {
          id: 1,
          theaterId: 1,
          roomNumber: 1,
          numberSeats: 150,
          theater: {
            id: 1,
            name: 'Cinéma Test',
            city: 'Test City',
            address: '123 Test Street',
            zipCode: 12345,
            codeCountry: 'FR',
            openingTime: '09:00',
            closingTime: '23:00',
            phoneNumber: '0123456789'
          }
        }
      }
    };
    this.originalStatus = this.booking.status;
    
    // Mettre à jour la dataSource de la table
    if (this.booking.bookingDetails && this.booking.bookingDetails.length > 0) {
      this.dataSource.data = this.booking.bookingDetails;
      this.cdr.detectChanges(); // Forcer la détection des changements
      console.log('DataSource updated with booking details:', this.booking.bookingDetails);
      console.log('DataSource.data after update:', this.dataSource.data);
    } else {
      console.log('No booking details found');
    }
    
    console.log('Test booking data created:', this.booking);
    console.log('Booking object exists:', !!this.booking);
    console.log('Loading status:', this.loading);
    console.log('DataSource data:', this.dataSource.data);
    console.log('DataSource length:', this.dataSource.data.length);
  }



  validateBookingDetail(bookingDetail: BookingDetail): void {
    if (confirm(`Êtes-vous sûr de vouloir valider le siège ${bookingDetail.seatNumber} ?`)) {
      // Si le bookingDetail a un vrai ID (pas fictif), utiliser la méthode directe
      if (bookingDetail.id < 1000) {
        // ID réel, utiliser la validation directe
        this.adminService.validateBookingDetailDirect(bookingDetail.id).subscribe({
          next: () => {
            this.showSuccess(`Siège ${bookingDetail.seatNumber} validé`);
            this.loadBookingDetails();
          },
          error: (error) => {
            console.error('Error validating booking detail:', error);
            this.showError('Erreur lors de la validation du siège');
          }
        });
      } else {
        // ID fictif, utiliser la méthode avec body
        this.adminService.validateBookingDetailWithBody(bookingDetail.id, {
          bookingId: this.booking.id,
          seatNumber: bookingDetail.seatNumber
        }).subscribe({
          next: () => {
            this.showSuccess(`Siège ${bookingDetail.seatNumber} validé`);
            this.loadBookingDetails();
          },
          error: (error) => {
            console.error('Error validating booking detail:', error);
            this.showError('Erreur lors de la validation du siège');
          }
        });
      }
    }
  }

  getStatusLabel(status: string): string {
    const statusObj = this.statusOptions.find(s => s.value === status);
    return statusObj?.label || status;
  }

  getStatusColor(status: string): string {
    const statusObj = this.statusOptions.find(s => s.value === status);
    return statusObj?.color || '';
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
    return '0,00€';
  }

  getUserDisplayName(): string {
    if (!this.booking.user) return 'Utilisateur inconnu';
    const firstName = this.booking.user.firstName || '';
    const lastName = this.booking.user.lastName || '';
    return `${firstName} ${lastName}`.trim() || this.booking.user.email || 'Utilisateur';
  }

  getMovieTitle(): string {
    if (this.booking.sessionCinema?.movie?.title) {
      return this.booking.sessionCinema.movie.title;
    }
    return 'Film inconnu';
  }

  getSessionInfo(): string {
    if (!this.booking.sessionCinema) return 'Session inconnue';
    
    const startTime = this.booking.sessionCinema.startTime;
    if (startTime) {
      return this.formatDateTime(startTime);
    }
    return 'Horaire inconnu';
  }

  getTheaterInfo(): string {
    if (this.booking.sessionCinema?.movieTheater?.theater) {
      const theater = this.booking.sessionCinema.movieTheater.theater;
      const room = this.booking.sessionCinema.movieTheater.roomNumber;
      return `${theater.name} - Salle ${room}`;
    }
    return 'Cinéma inconnu';
  }

  getTotalSeats(): number {
    return this.dataSource.data?.length || 0;
  }


  close(): void {
    this.dialogRef.close();
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private generateBookingDetailsFromReservation(booking: Booking): BookingDetail[] {
    const seats: BookingDetail[] = [];
    const numberOfSeats = (booking as any).numberSeats || 0;
    const totalPrice = parseFloat((booking.totalPrice || 0).toString());
    const pricePerSeat = numberOfSeats > 0 ? totalPrice / numberOfSeats : 0;

    for (let i = 0; i < numberOfSeats; i++) {
      const seatNumber = this.generateSeatNumber(i);
      // Utiliser un statut approprié selon isValidated ou autres propriétés
      const seatStatus = (booking as any).isValidated === true ? 'VALIDATED' : 'PENDING';

      const bookingDetail: BookingDetail = {
        id: booking.id + i + 1000, // ID temporaire unique
        seatNumber: seatNumber,
        status: seatStatus,
        price: pricePerSeat,
        createDate: booking.createDate,
        updateDate: booking.createDate,
        bookingId: booking.id
      };
      seats.push(bookingDetail);
    }

    return seats;
  }

  private generateSeatNumber(index: number): string {
    // Générer des numéros de sièges réalistes (A1, A2, B1, B2, etc.)
    const row = String.fromCharCode(65 + Math.floor(index / 10)); // A, B, C, etc.
    const seatInRow = (index % 10) + 1;
    return `${row}${seatInRow}`;
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}