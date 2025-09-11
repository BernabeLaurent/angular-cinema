import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

import { AdminService } from '../../../services/admin.service';
import { SessionFormDialogComponent } from '../session-form-dialog/session-form-dialog.component';

interface SessionCinema {
  id: number;
  startTime: string;
  endTime: string;
  quality: string;
  codeLanguage: string;
  movieTheaterId: number;
  movieId: number;
  // Données enrichies dynamiquement
  movieTheater?: {
    id: number;
    theaterId: number;
    roomNumber: number;
    numberSeats: number;
    numberSeatsDisabled?: number;
    theater?: {
      id: number;
      name: string;
      city: string;
      address: string;
      zipCode: number;
      codeCountry: string;
      openingTime: string;
      closingTime: string;
      phoneNumber: string;
      createDate?: string;
      updateDate?: string;
    };
  };
}

@Component({
  selector: 'app-sessions-management-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './sessions-management-dialog.component.html',
  styleUrls: ['./sessions-management-dialog.component.scss']
})
export class SessionsManagementDialogComponent implements OnInit {
  sessions: SessionCinema[] = [];
  displayedColumns: string[] = ['theater', 'room', 'datetime', 'quality', 'language', 'actions'];
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<SessionsManagementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { movie: any },
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    
    // PROBLÈME IDENTIFIÉ: Les APIs sessions-cinemas ne retournent pas toutes les sessions
    // Solution: Utiliser l'API de recherche de films qui contient toutes les sessions
    this.adminService.searchMovies(this.data.movie.title).subscribe({
      next: (searchResults) => {
        console.log('Movie search results:', searchResults);
        
        // Trouver le film correspondant
        const movieData = searchResults.find(movie => movie.id === this.data.movie.id);
        if (!movieData || !movieData.sessionsCinemas) {
          console.log('No movie data or sessions found in search results');
          this.sessions = [];
          this.loading = false;
          return;
        }

        const movieSessions = movieData.sessionsCinemas;
        console.log('Sessions loaded for movie:', this.data.movie.id, movieSessions);
        console.log('Sessions count:', movieSessions.length);
        
        if (movieSessions.length === 0) {
          this.sessions = [];
          this.loading = false;
          return;
        }

        // Les sessions de l'API de recherche ont déjà toutes les données enrichies
        this.sessions = movieSessions.map((session: any) => ({
          ...session,
          // Les données movieTheater sont déjà présentes et complètes
        }));
        
        this.loading = false;
        console.log('Sessions loaded and displayed:', this.sessions);
      },
      error: (error) => {
        console.error('Error loading sessions from search:', error);
        
        // Fallback: essayer avec l'ancienne méthode si la recherche échoue
        this.adminService.getAllSessions().subscribe({
          next: (allSessions) => {
            const movieSessions = allSessions.filter(session => session.movieId === this.data.movie.id);
            
            this.sessions = movieSessions.map(session => ({
              ...session,
              movieTheater: {
                id: session.movieTheaterId,
                theaterId: 2,
                roomNumber: 0,
                numberSeats: 150,
                numberSeatsDisabled: 0,
                theater: {
                  id: 2,
                  name: 'Données incomplètes',
                  city: 'N/A',
                  address: '',
                  zipCode: 0,
                  codeCountry: '',
                  openingTime: '',
                  closingTime: '',
                  phoneNumber: ''
                }
              }
            }));
            this.loading = false;
          },
          error: (fallbackError) => {
            console.error('Error in fallback:', fallbackError);
            this.sessions = [];
            this.loading = false;
            this.showError('Erreur lors du chargement des sessions');
          }
        });
      }
    });
  }

  private enrichSessionWithTheaterDetails(session: SessionCinema) {
    return this.adminService.getTheaterRoomById(session.movieTheaterId).pipe(
      switchMap(movieTheater => {
        console.log('MovieTheater data:', movieTheater);
        // Récupérer les détails du cinéma
        return forkJoin({
          session: of(session),
          movieTheater: of(movieTheater),
          theater: this.adminService.getTheaterById(movieTheater.theaterId).pipe(
            catchError((error) => {
              console.error(`Theater ID ${movieTheater.theaterId} not found, trying to get all theaters to find a match`);
              // Si le théâtre spécifique n'est pas trouvé, essayons de récupérer le premier disponible
              return this.adminService.getTheaters().pipe(
                map(theaters => {
                  if (theaters.length > 0) {
                    console.log(`Using first available theater: ${theaters[0].name}`);
                    return theaters[0];
                  }
                  return {
                    id: movieTheater.theaterId,
                    name: `Cinéma ${movieTheater.theaterId} (Introuvable)`,
                    city: 'N/A',
                    address: '',
                    zipCode: 0,
                    codeCountry: '',
                    openingTime: '',
                    closingTime: '',
                    phoneNumber: ''
                  };
                }),
                catchError(() => of({
                  id: movieTheater.theaterId,
                  name: `Cinéma ${movieTheater.theaterId} (Erreur)`,
                  city: 'N/A',
                  address: '',
                  zipCode: 0,
                  codeCountry: '',
                  openingTime: '',
                  closingTime: '',
                  phoneNumber: ''
                }))
              );
            })
          )
        }).pipe(
          map(({ session, movieTheater, theater }) => ({
            ...session,
            movieTheater: {
              id: movieTheater.id,
              theaterId: movieTheater.theaterId,
              roomNumber: movieTheater.roomNumber,
              numberSeats: movieTheater.numberSeats,
              numberSeatsDisabled: movieTheater.numberSeatsDisabled,
              theater: theater
            }
          }))
        );
      }),
      catchError((error) => {
        console.error('Error getting theater room:', error);
        return of({
          ...session,
          movieTheater: {
            id: session.movieTheaterId,
            theaterId: 0,
            roomNumber: 0,
            numberSeats: 0,
            numberSeatsDisabled: 0,
            theater: {
              id: 0,
              name: 'N/A',
              city: 'N/A',
              address: '',
              zipCode: 0,
              codeCountry: '',
              openingTime: '',
              closingTime: '',
              phoneNumber: ''
            }
          }
        });
      })
    );
  }

  deleteSession(session: SessionCinema): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette session du ${this.formatDateTime(session.startTime)} ?`)) {
      this.adminService.deleteSession(session.id).subscribe({
        next: () => {
          this.showSuccess('Session supprimée avec succès');
          this.loadSessions();
        },
        error: (error) => {
          console.error('Error deleting session:', error);
          this.showError('Erreur lors de la suppression de la session');
        }
      });
    }
  }

  editSession(session: SessionCinema): void {
    // Transformer la session au format attendu par le formulaire
    const sessionDate = new Date(session.startTime);
    console.log('Session edit - Original session.startTime:', session.startTime);
    console.log('Session edit - sessionDate created:', sessionDate);
    console.log('Session edit - sessionDate.toTimeString():', sessionDate.toTimeString());
    console.log('Session edit - extracted time:', sessionDate.toTimeString().slice(0, 5));
    
    // Utiliser les données enrichies du théâtre, ou fallback vers le théâtre existant
    let theaterId = session.movieTheater?.theater?.id || 2; // Utiliser le théâtre réel, pas le theaterId du movieTheater
    
    // Pour le roomId, nous devons d'abord récupérer les salles du théâtre
    // et trouver une correspondance appropriée
    console.log('Theater mapping - Original theaterId:', session.movieTheater?.theaterId, 
                'Using theaterId:', theaterId, 'movieTheaterId:', session.movieTheaterId);
    
    // Récupérer les salles du théâtre pour trouver la bonne correspondance
    this.adminService.getTheaterRooms(theaterId).subscribe({
      next: (rooms) => {
        console.log('Available rooms for theater', theaterId, ':', rooms);
        
        // Essayer de trouver une salle qui correspond au movieTheaterId
        let roomId = rooms.find(room => room.id === session.movieTheaterId)?.id;
        
        // Si pas de correspondance, utiliser la première salle disponible
        if (!roomId && rooms.length > 0) {
          roomId = rooms[0].id;
          console.log('No matching room found, using first available room:', roomId);
        }
        
        // Récupérer les informations de la salle pour le prix et le nb de places
        const selectedRoom = rooms.find(room => room.id === roomId) || rooms[0];
        
        const sessionForEdit = {
          theaterId: theaterId,
          roomId: roomId || rooms[0]?.id,
          date: session.startTime, // Garder la date complète pour le datepicker
          startTime: sessionDate.toTimeString().slice(0, 5), // HH:MM format
          quality: session.quality,
          language: session.codeLanguage,
          price: 12.50, // Prix par défaut - pourrait être récupéré d'une autre source
          totalSeats: selectedRoom?.numberSeats || 150
        };

        console.log('Editing session with data:', sessionForEdit);
        console.log('Original session:', session);

        const dialogRef = this.dialog.open(SessionFormDialogComponent, {
          width: '700px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          panelClass: 'session-form-dialog',
          data: { 
            movie: this.data.movie, 
            mode: 'edit',
            session: sessionForEdit
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.updateSession(session.id, result);
          }
        });
      },
      error: (error) => {
        console.error('Error loading rooms for edit:', error);
        
        // Fallback avec des valeurs par défaut
        const sessionForEdit = {
          theaterId: theaterId,
          roomId: session.movieTheaterId,
          date: session.startTime,
          startTime: sessionDate.toTimeString().slice(0, 5),
          quality: session.quality,
          language: session.codeLanguage,
          price: 12.50,
          totalSeats: session.movieTheater?.numberSeats || 150
        };

        console.log('Using fallback session data:', sessionForEdit);

        const dialogRef = this.dialog.open(SessionFormDialogComponent, {
          width: '700px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          panelClass: 'session-form-dialog',
          data: { 
            movie: this.data.movie, 
            mode: 'edit',
            session: sessionForEdit
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.updateSession(session.id, result);
          }
        });
      }
    });
  }

  createNewSession(): void {
    const dialogRef = this.dialog.open(SessionFormDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'session-form-dialog',
      data: { 
        movie: this.data.movie, 
        mode: 'create'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createSession(result);
      }
    });
  }

  private updateSession(sessionId: number, sessionData: any): void {
    // Filtrer les données pour ne garder que les champs acceptés par l'API
    const filteredData: any = {};
    
    // Combiner date et heure si nécessaire
    if (sessionData.date && sessionData.startTime) {
      const date = new Date(sessionData.date);
      const [hours, minutes] = sessionData.startTime.split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      filteredData.startTime = date.toISOString();
    } else if (sessionData.startTime) {
      filteredData.startTime = sessionData.startTime;
    }
    
    // Ajouter les autres champs acceptés
    if (sessionData.endTime) filteredData.endTime = sessionData.endTime;
    if (sessionData.quality) filteredData.quality = sessionData.quality;
    if (sessionData.language) filteredData.codeLanguage = sessionData.language;
    if (sessionData.theaterId) filteredData.theaterId = sessionData.theaterId;
    if (sessionData.roomId) filteredData.movieTheaterId = sessionData.roomId;
    
    // Ajouter l'ID du film (nécessaire)
    filteredData.movieId = this.data.movie.id;
    
    console.log('Filtered data for update:', filteredData);
    console.log('Original data from form:', sessionData);
    
    this.adminService.updateSession(sessionId, filteredData).subscribe({
      next: () => {
        this.showSuccess('Session modifiée avec succès');
        this.loadSessions();
      },
      error: (error) => {
        console.error('Error updating session:', error);
        this.showError('Erreur lors de la modification de la session');
      }
    });
  }

  private createSession(sessionData: any): void {
    // Filtrer les données pour ne garder que les champs acceptés par l'API
    const filteredData: any = {};
    
    // Combiner date et heure si nécessaire
    if (sessionData.date && sessionData.startTime) {
      const date = new Date(sessionData.date);
      const [hours, minutes] = sessionData.startTime.split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      filteredData.startTime = date.toISOString();
    } else if (sessionData.startTime) {
      filteredData.startTime = sessionData.startTime;
    }
    
    // Ajouter les autres champs acceptés
    if (sessionData.endTime) filteredData.endTime = sessionData.endTime;
    if (sessionData.quality) filteredData.quality = sessionData.quality;
    if (sessionData.language) filteredData.codeLanguage = sessionData.language;
    if (sessionData.theaterId) filteredData.theaterId = sessionData.theaterId;
    if (sessionData.roomId) filteredData.movieTheaterId = sessionData.roomId;
    
    // Ajouter l'ID du film (nécessaire)
    filteredData.movieId = this.data.movie.id;
    
    console.log('Filtered data for creation:', filteredData);
    console.log('Original data from form:', sessionData);
    
    this.adminService.createSession(filteredData).subscribe({
      next: () => {
        this.showSuccess('Session créée avec succès');
        this.loadSessions();
      },
      error: (error) => {
        console.error('Error creating session:', error);
        this.showError('Erreur lors de la création de la session');
      }
    });
  }

  formatDateTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}