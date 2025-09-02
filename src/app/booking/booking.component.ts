import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { SessionsService } from '../services/sessions.service';
import { AdminService } from '../services/admin.service';
import { AuthService } from '../auth/auth.service';
import { MovieWithSessions, Theater, SessionCinema } from '../models/session.model';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatTabsModule,
    MatChipsModule,
    MatIconModule,
    FormsModule
  ],
  template: `
    <div class="booking-container">
      <mat-card class="booking-header">
        <mat-card-header>
          <mat-card-title>Réservation de séances</mat-card-title>
          <mat-card-subtitle>Choisissez votre cinéma, film et séance</mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <!-- Sélection du cinéma -->
      <mat-card class="selection-card">
        <mat-card-content>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Sélectionnez un cinéma</mat-label>
            <mat-select [(value)]="selectedTheaterId" (selectionChange)="onTheaterChange()">
              <mat-option *ngFor="let theater of theaters" [value]="theater.id">
                {{ theater.name }} - {{ theater.city }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <!-- Films et séances disponibles -->
      <div class="movies-sessions" *ngIf="selectedTheaterId && moviesWithSessions.length > 0">
        <mat-card *ngFor="let movieData of moviesWithSessions" class="movie-card">
          <mat-card-header>
            <div mat-card-avatar class="movie-poster" [style.background-image]="'url(' + getMoviePosterUrl(movieData.movie.posterPath || movieData.movie.poster) + ')'"></div>
            <mat-card-title>
              <a [routerLink]="['/movies', movieData.movie.id]" class="movie-title-link">
                {{ movieData.movie.title }}
              </a>
            </mat-card-title>
            <mat-card-subtitle>
              <span *ngIf="movieData.movie.runtime || movieData.movie.duration">
                Durée: {{ movieData.movie.runtime || movieData.movie.duration }}min | 
              </span>
              <span *ngIf="movieData.movie.averageRating || movieData.movie.rating">
                Note: {{ movieData.movie.averageRating || movieData.movie.rating }}/10
              </span>
            </mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <p class="movie-description">{{ movieData.movie.description }}</p>
            
            <!-- Sessions par théâtre -->
            <div *ngFor="let theaterData of movieData.theaters" class="theater-sessions">
              <h4>{{ theaterData.theater.name }}</h4>
              
              <!-- Sessions par date -->
              <div *ngFor="let sessionsByDate of theaterData.sessions" class="sessions-by-date">
                <h5 class="session-date">{{ formatDate(sessionsByDate.date) }}</h5>
                <div class="sessions-grid">
                  <button 
                    mat-raised-button 
                    *ngFor="let session of sessionsByDate.sessions"
                    class="session-button"
                    [class.session-full]="session.availableSeats === 0"
                    [disabled]="session.availableSeats === 0"
                    (click)="selectSession(session)">
                    <div class="session-time">{{ formatTime(session.startTime) }}</div>
                    <div class="session-info">
                      <mat-chip-listbox>
                        <mat-chip>{{ session.quality }}</mat-chip>
                        <mat-chip>{{ session.codeLanguage }}</mat-chip>
                      </mat-chip-listbox>
                    </div>
                    <div class="session-availability">
                      {{ session.availableSeats }} places disponibles
                    </div>
                    <div class="session-price" *ngIf="session.price">
                      {{ session.price }}€
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Message si aucune séance -->
      <mat-card *ngIf="selectedTheaterId && moviesWithSessions.length === 0 && !loading" class="no-sessions">
        <mat-card-content>
          <p>Aucune séance disponible pour ce cinéma.</p>
        </mat-card-content>
      </mat-card>

      <!-- Loading -->
      <div class="loading" *ngIf="loading">
        <p>Chargement des séances...</p>
      </div>
    </div>
  `,
  styles: [`
    .booking-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .booking-header {
      margin-bottom: 20px;
      background: linear-gradient(135deg, #1a1a1a, #333);
      color: white;
    }

    .selection-card {
      margin-bottom: 20px;
    }

    .full-width {
      width: 100%;
    }

    .movies-sessions {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .movie-card {
      background: #f5f5f5;
    }

    .movie-poster {
      background-size: cover;
      background-position: center;
      background-color: #ccc;
      width: 40px;
      height: 60px;
    }

    .movie-description {
      margin-bottom: 15px;
      color: #666;
    }

    .theater-sessions {
      margin-bottom: 20px;
    }

    .theater-sessions h4 {
      color: #d32f2f;
      margin-bottom: 10px;
    }

    .sessions-by-date {
      margin-bottom: 15px;
    }

    .session-date {
      color: #333;
      margin-bottom: 10px;
      font-weight: 500;
    }

    .sessions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 10px;
    }

    .session-button {
      padding: 15px;
      text-align: left;
      background: white;
      border: 1px solid #ddd;
      transition: all 0.3s;
    }

    .session-button:hover:not(:disabled) {
      background: #f0f0f0;
      border-color: #d32f2f;
    }

    .session-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .session-full {
      background: #ffebee !important;
      border-color: #f44336 !important;
    }

    .session-time {
      font-size: 18px;
      font-weight: bold;
      color: #d32f2f;
      margin-bottom: 5px;
    }

    .session-info {
      margin: 5px 0;
    }

    .session-info mat-chip {
      font-size: 12px;
    }

    .session-availability {
      font-size: 14px;
      color: #666;
      margin: 5px 0;
    }

    .session-price {
      font-size: 16px;
      font-weight: bold;
      color: #d32f2f;
    }

    .movie-title-link {
      color: inherit;
      text-decoration: none;
      transition: color 0.3s;
    }

    .movie-title-link:hover {
      color: #d32f2f;
      text-decoration: underline;
    }

    .no-sessions {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    @media (max-width: 768px) {
      .sessions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BookingComponent implements OnInit {
  theaters: Theater[] = [];
  selectedTheaterId: number | null = null;
  moviesWithSessions: MovieWithSessions[] = [];
  loading = false;

  constructor(
    private sessionsService: SessionsService,
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTheaters();
  }

  loadTheaters() {
    this.adminService.getTheaters().subscribe({
      next: (theaters: Theater[]) => {
        this.theaters = theaters;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des cinémas:', error);
      }
    });
  }

  onTheaterChange() {
    if (this.selectedTheaterId) {
      this.loadSessionsForTheater();
    } else {
      this.moviesWithSessions = [];
    }
  }

  loadSessionsForTheater() {
    if (!this.selectedTheaterId) return;

    this.loading = true;
    
    // Pour l'instant, on charge toutes les sessions et on les regroupe par film
    this.sessionsService.getSessionsByWeek(this.selectedTheaterId).subscribe({
      next: (sessions) => {
        this.groupSessionsByMovie(sessions);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des séances:', error);
        this.loading = false;
      }
    });
  }

  groupSessionsByMovie(sessions: SessionCinema[]) {
    const movieMap = new Map<number, MovieWithSessions>();

    sessions.forEach(session => {
      if (!session.movie || !session.movieTheater?.theater) return;

      const movieId = session.movie.id;
      if (!movieMap.has(movieId)) {
        movieMap.set(movieId, {
          movie: session.movie,
          theaters: []
        });
      }

      const movieData = movieMap.get(movieId)!;
      let theaterData = movieData.theaters.find(t => t.theater.id === session.movieTheater!.theater!.id);
      
      if (!theaterData) {
        theaterData = {
          theater: session.movieTheater.theater,
          sessions: []
        };
        movieData.theaters.push(theaterData);
      }

      const sessionDate = new Date(session.startTime).toDateString();
      let dateGroup = theaterData.sessions.find(s => s.date === sessionDate);
      
      if (!dateGroup) {
        dateGroup = {
          date: sessionDate,
          sessions: []
        };
        theaterData.sessions.push(dateGroup);
      }

      dateGroup.sessions.push(session);
    });

    this.moviesWithSessions = Array.from(movieMap.values());
  }

  selectSession(session: SessionCinema) {
    console.log('Session sélectionnée:', session);
    this.router.navigate(['/booking/session', session.id]);
  }

  getMoviePosterUrl(poster?: string): string {
    if (!poster) return '/assets/images/no-poster.jpg';
    if (poster.startsWith('http')) return poster;
    return `https://image.tmdb.org/t/p/w500${poster}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  formatTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}