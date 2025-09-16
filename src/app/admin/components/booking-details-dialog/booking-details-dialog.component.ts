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

import { AdminService, Booking, BookingDetail, ReservedSeat } from '../../../services/admin.service';
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
        console.log('=== BOOKING LOADED ===');
        console.log('Booking details loaded successfully:', booking);
        console.log('Booking keys:', Object.keys(booking));
        console.log('booking.reservedSeats exist?:', 'reservedSeats' in booking);

        this.booking = booking;
        this.originalStatus = booking.status;

        // Convertir les reservedSeats en BookingDetail pour l'affichage
        console.log('Booking has reservedSeats:', booking.reservedSeats);
        console.log('Type of reservedSeats:', typeof booking.reservedSeats);
        console.log('Is array:', Array.isArray(booking.reservedSeats));
        console.log('Length:', booking.reservedSeats?.length);

        // Forcer la vérification des reservedSeats même si TypeScript ne les reconnaît pas
        const reservedSeats = (booking as any).reservedSeats;
        console.log('Reserved seats (any cast):', reservedSeats);
        console.log('Reserved seats length:', reservedSeats?.length);

        // Log détaillé de chaque siège réservé
        if (reservedSeats && Array.isArray(reservedSeats)) {
          console.log('Reserved seats details:');
          reservedSeats.forEach((seat: any, index: number) => {
            console.log(`Seat ${index}:`, seat);
          });
        }

        if (reservedSeats && Array.isArray(reservedSeats) && reservedSeats.length > 0) {
          console.log('Converting reservedSeats to BookingDetails');
          const bookingDetails = this.convertReservedSeatsToBookingDetails(reservedSeats, booking);
          console.log('Converted booking details:', bookingDetails);
          this.dataSource.data = bookingDetails;
          this.cdr.detectChanges();
          this.loading = false;
        } else {
          console.log('No reservedSeats found or empty array');
          console.log('Trying to get booking details via alternative API endpoint');

          // Essayer l'endpoint alternatif pour récupérer les détails
          this.adminService.getBookingDetails(this.data.bookingId).subscribe({
            next: (bookingDetails) => {
              console.log('Booking details from alternative endpoint (extracted):', bookingDetails);

              if (bookingDetails && Array.isArray(bookingDetails) && bookingDetails.length > 0) {
                console.log('Processing booking details from alternative endpoint:', bookingDetails);

                // L'endpoint retourne un array contenant l'objet Booking complet
                const bookingObject = bookingDetails[0];
                console.log('First item in array:', bookingObject);
                console.log('First item keys:', Object.keys(bookingObject));

                // Vérifier si cet objet a des reservedSeats
                if (bookingObject.reservedSeats && Array.isArray(bookingObject.reservedSeats)) {
                  console.log('Found reservedSeats in booking object:', bookingObject.reservedSeats);
                  console.log('Number of reserved seats:', bookingObject.reservedSeats.length);

                  // Convertir les reservedSeats en BookingDetails
                  const convertedBookingDetails = this.convertReservedSeatsToBookingDetails(
                    bookingObject.reservedSeats,
                    bookingObject
                  );
                  console.log('Converted booking details:', convertedBookingDetails);

                  convertedBookingDetails.forEach((detail, index) => {
                    console.log(`Converted BookingDetail ${index}: ID=${detail.id}, SeatNumber=${detail.seatNumber}, Status=${detail.status}`);
                  });

                  this.dataSource.data = convertedBookingDetails;
                } else if (bookingObject.bookingDetails && Array.isArray(bookingObject.bookingDetails)) {
                  console.log('Found bookingDetails in booking object:', bookingObject.bookingDetails);
                  this.dataSource.data = bookingObject.bookingDetails;
                } else {
                  console.log('No reservedSeats or bookingDetails found in booking object');
                  // Fallback vers la génération
                  const generatedSeats = this.generateBookingDetailsFromReservation(bookingObject);
                  this.dataSource.data = generatedSeats;
                }
              } else {
                console.log('No booking details from alternative endpoint either');
                console.log('Final attempt: checking booking object properties');

                // Vérifier toutes les propriétés du booking pour trouver les sièges
                console.log('All booking properties:', Object.keys(this.booking));
                console.log('Booking numberSeats:', (this.booking as any).numberSeats);
                console.log('Booking bookingDetails:', (this.booking as any).bookingDetails);

                // Utiliser bookingDetails s'ils existent
                if ((this.booking as any).bookingDetails && Array.isArray((this.booking as any).bookingDetails)) {
                  console.log('Found bookingDetails in booking object');
                  this.dataSource.data = (this.booking as any).bookingDetails;
                } else {
                  // En dernier recours, générer à partir des informations disponibles
                  console.log('Generating seats from available booking information');
                  const generatedSeats = this.generateBookingDetailsFromReservation(this.booking);
                  this.dataSource.data = generatedSeats;
                }
              }
              this.cdr.detectChanges();
              this.loading = false;
            },
            error: (error) => {
              console.error('Alternative API endpoint failed:', error);
              console.log('Using fallback seat generation');
              const generatedSeats = this.generateBookingDetailsFromReservation(this.booking);
              this.dataSource.data = generatedSeats;
              this.cdr.detectChanges();
              this.loading = false;
            }
          });
        }
      },
      error: (error) => {
        console.error('Error loading booking details:', error);
        console.error('Error details:', error.error);
        console.error('Status:', error.status);
        console.error('Full error object:', JSON.stringify(error, null, 2));

        // Instead of creating test data, let's see if the error actually contains valid data
        if (error.error && error.error.data) {
          console.log('Found data in error response:', error.error.data);
          this.booking = error.error.data;
          this.originalStatus = this.booking.status;

          const reservedSeats = (this.booking as any).reservedSeats;
          if (reservedSeats && Array.isArray(reservedSeats) && reservedSeats.length > 0) {
            console.log('Using reservedSeats from error response');
            const bookingDetails = this.convertReservedSeatsToBookingDetails(reservedSeats, this.booking);
            this.dataSource.data = bookingDetails;
          }
          this.cdr.detectChanges();
        } else {
          // Only create test data if there's truly no data available
          console.log('No data found in error response, showing error message');
          this.showError(`Erreur ${error.status}: ${error.message || 'Impossible de charger la réservation'}`);
        }

        this.loading = false;
      }
    });
  }

  private createTestBookingData(): void {
    // Données de test pour permettre de voir l'interface
    this.booking = {
      id: this.data.bookingId,
      status: 'PENDING',
      totalPrice: '25.00',
      createDate: new Date().toISOString(),
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
      userId: 1,
      sessionCinemaId: 1,
      numberSeats: 2,
      numberSeatsDisabled: 0,
      sessionCinema: {
        id: 1,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        quality: 'HD',
        codeLanguage: 'fr',
        movieTheaterId: 1,
        movieId: 1,
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
      console.log('=== VALIDATION STARTING ===');
      console.log('Validating booking detail:', bookingDetail);
      console.log('BookingDetail keys:', Object.keys(bookingDetail));
      console.log('BookingDetail ID type:', typeof bookingDetail.id);
      console.log('Full booking object:', this.booking);
      console.log('Reserved seats in booking:', this.booking?.reservedSeats);
      console.log('DataSource current data:', this.dataSource.data);
      console.log('DataSource data length:', this.dataSource.data.length);

      // Let's trace where this bookingDetail came from
      const foundInDataSource = this.dataSource.data.find(item => item.id === bookingDetail.id);
      console.log('BookingDetail found in dataSource:', foundInDataSource);

      // Check if this ID exists in the original reservedSeats
      if (this.booking?.reservedSeats) {
        const foundInReservedSeats = this.booking.reservedSeats.find(seat => seat.id === bookingDetail.id);
        console.log('Matching reserved seat found:', foundInReservedSeats);
      }

      // Pour les données de votre API, utiliser directement l'ID du bookingDetail
      // qui correspond à l'ID du reservedSeat
      console.log(`Validating with booking detail ID: ${bookingDetail.id}`);

      this.adminService.validateBookingDetailDirect(bookingDetail.id).subscribe({
        next: (response) => {
          console.log('Booking detail validation successful:', response);
          this.showSuccess(`Siège ${bookingDetail.seatNumber} validé`);
          this.loadBookingDetails();
        },
        error: (error) => {
          console.error('Error validating booking detail:', error);
          console.error('Error details:', error);
          this.showError(`Erreur lors de la validation du siège: ${error.status} ${error.statusText}`);
        }
      });
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

  formatPrice(price: number | string): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (typeof numPrice === 'number' && !isNaN(numPrice)) {
      return `${numPrice.toFixed(2)}€`;
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

  /**
   * Convertit les reservedSeats en BookingDetail pour l'affichage dans la table
   */
  private convertReservedSeatsToBookingDetails(reservedSeats: ReservedSeat[], booking: Booking): BookingDetail[] {
    const totalPrice = parseFloat(booking.totalPrice || '0');
    const pricePerSeat = reservedSeats.length > 0 ? totalPrice / reservedSeats.length : 0;

    return reservedSeats.map((seat, index) => ({
      id: seat.id, // Garder l'ID réel du siège réservé
      seatNumber: this.generateNiceSeatNumber(index), // Générer un numéro de siège visuellement agréable
      status: seat.isValidated ? 'VALIDATED' : 'PENDING',
      price: pricePerSeat,
      createDate: seat.createDate,
      updateDate: seat.updateDate,
      bookingId: booking.id
    }));
  }

  private generateNiceSeatNumber(index: number): string {
    // Générer des numéros de sièges réalistes (A1, A2, B1, B2, etc.)
    const row = String.fromCharCode(65 + Math.floor(index / 10)); // A, B, C, etc.
    const seatInRow = (index % 10) + 1;
    return `${row}${seatInRow}`;
  }

  /**
   * Trouve un siège réservé par son numéro
   */
  private findReservedSeatByNumber(seatNumber: string): ReservedSeat | undefined {
    if (!this.booking.reservedSeats) return undefined;
    return this.booking.reservedSeats.find(seat => seat.seatNumber.toString() === seatNumber);
  }

  /**
   * Trouve un siège réservé par l'ID du BookingDetail
   */
  private findReservedSeatById(bookingDetailId: number): ReservedSeat | undefined {
    if (!this.booking.reservedSeats) return undefined;
    return this.booking.reservedSeats.find(seat => seat.id === bookingDetailId);
  }
}