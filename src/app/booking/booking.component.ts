import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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
import { DateFormatService } from '../services/date-format.service';
import { MoviesService } from '../services/movies.service';
import { MovieWithSessions, Theater, SessionCinema } from '../models/session.model';

@Component({
  selector: 'app-booking',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
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
      <div class="booking-header">
        <div class="header-content">
          <h1 class="header-title">Réservation de séances</h1>
          <p class="header-subtitle">Choisissez votre cinéma, film et séance</p>
        </div>
      </div>

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
          <div class="movie-layout">
            <!-- Poster du film avec overlay comme la homepage -->
            <div class="movie-poster-container">
              <img
                class="movie-poster-image"
                [src]="getMoviePosterUrl(movieData.movie.posterPath || movieData.movie.poster)"
                [alt]="movieData.movie.title"
                (error)="onImageError($event)">
              <div class="poster-overlay">
                <div class="rating" *ngIf="movieData.movie.averageRating || movieData.movie.rating">
                  <mat-icon class="star">star</mat-icon>
                  <span>{{ (movieData.movie.averageRating || movieData.movie.rating) | number:'1.1-1' }}/10</span>
                </div>
              </div>
            </div>

            <!-- Contenu du film -->
            <div class="movie-info">
              <div class="movie-header">
                <h3 class="movie-title">
                  <a [routerLink]="['/movies', movieData.movie.id]" class="movie-title-link">
                    {{ movieData.movie.title }}
                  </a>
                </h3>
                <div class="movie-meta">
                  <span *ngIf="movieData.movie.runtime || movieData.movie.duration" class="duration">
                    {{ movieData.movie.runtime || movieData.movie.duration }}min
                  </span>
                  <span class="separator" *ngIf="(movieData.movie.runtime || movieData.movie.duration) && movieData.movie.releaseDate">•</span>
                  <span *ngIf="movieData.movie.releaseDate" class="release-date">
                    Sortie le {{ formatReleaseDate(movieData.movie.releaseDate) }}
                  </span>
                </div>
              </div>

              <div class="movie-content">
                <p class="movie-description">{{ movieData.movie.description }}</p>

                <!-- Sessions par théâtre -->
                <div *ngFor="let theaterData of movieData.theaters" class="theater-sessions">
                  <h4 class="theater-name">{{ theaterData.theater.name }}</h4>

                  <!-- Sessions par date -->
                  <div *ngFor="let sessionsByDate of theaterData.sessions" class="sessions-by-date">
                    <h5 class="session-date">{{ formatDate(sessionsByDate.date) }}</h5>
                    <div class="sessions-grid">
                      <div
                        *ngFor="let session of sessionsByDate.sessions"
                        class="session-card"
                        [class.session-full]="session.availableSeats !== undefined && session.availableSeats === 0">
                        <div class="session-time">{{ formatTime(session.startTime) }}</div>
                        <div class="session-quality" style="margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
                          <span class="quality-badge" style="background: linear-gradient(135deg, #1976d2, #42a5f5); color: white; padding: 8px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; display: inline-block; box-shadow: 0 3px 6px rgba(25, 118, 210, 0.3); border: none; letter-spacing: 0.5px;">{{ session.quality }}</span>
                          <span class="language-badge" style="background: linear-gradient(135deg, #7b1fa2, #ba68c8); color: white; padding: 8px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; display: inline-block; box-shadow: 0 3px 6px rgba(123, 31, 162, 0.3); border: none; letter-spacing: 0.5px;">{{ session.codeLanguage }}</span>
                        </div>
                        <div class="session-availability" *ngIf="session.availableSeats && session.availableSeats > 0">
                          {{ session.availableSeats }} places restantes
                        </div>
                        <div class="session-availability full" *ngIf="session.availableSeats !== undefined && session.availableSeats === 0">
                          Complet
                        </div>
                        <div class="session-price" *ngIf="session.price">
                          {{ session.price }}€
                        </div>
                        <button
                          mat-raised-button
                          class="book-session-btn"
                          [disabled]="session.availableSeats !== undefined && session.availableSeats === 0"
                          (click)="selectSession(session)">
                          {{ (session.availableSeats !== undefined && session.availableSeats === 0) ? 'COMPLET' : 'RÉSERVER' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Message si aucune séance -->
      <mat-card *ngIf="selectedTheaterId && moviesWithSessions.length === 0 && !loading" class="no-sessions">
        <mat-card-content>
          <p>Aucune séance disponible pour ce cinéma.</p>
          <p><small>Cinéma sélectionné: {{ selectedTheaterId }}</small></p>
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
      background: #f8f9fa;
      color: #333;
    }

    .booking-header {
      margin-bottom: 30px;
      background: linear-gradient(135deg, #1a1a1a, #333);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .header-content {
      padding: 40px 32px;
      text-align: center;
    }

    .header-title {
      margin: 0 0 12px 0;
      font-size: 36px;
      font-weight: 700;
      color: white;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .header-subtitle {
      margin: 0;
      font-size: 18px;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 400;
    }

    .selection-card {
      margin-bottom: 20px;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    /* Force text colors for Material Design components */
    .selection-card mat-card-content,
    .selection-card mat-form-field,
    .selection-card mat-label,
    .selection-card .mat-mdc-form-field-label,
    .selection-card .mat-mdc-select,
    .selection-card .mat-mdc-select-value,
    .selection-card .mat-mdc-option,
    .selection-card .mat-mdc-form-field-infix,
    .selection-card .mat-mdc-select-trigger,
    .selection-card .mat-mdc-select-value-text,
    .mat-mdc-option-text {
      color: #000 !important;
    }

    .full-width {
      width: 100%;
    }

    /* Ensure all text elements have proper colors */
    .booking-container,
    .booking-container * {
      color: inherit;
    }

    /* Specific overrides for problematic elements */
    .no-sessions,
    .loading {
      color: #666 !important;
    }

    /* Movie card text colors */
    .movie-card {
      color: #333;
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

    /* Nouveau layout avec poster */
    .movie-layout {
      display: flex;
      gap: 20px;
      padding: 16px;
    }

    .movie-poster-container {
      flex-shrink: 0;
    }

    .movie-poster-image {
      width: 150px;
      height: 225px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .movie-info {
      flex: 1;
    }

    .movie-header {
      padding: 0;
      margin-bottom: 16px;
    }

    .movie-header mat-card-title {
      margin-bottom: 8px;
    }

    @media (max-width: 768px) {
      .sessions-grid {
        grid-template-columns: 1fr;
      }

      .movie-layout {
        flex-direction: column;
        gap: 16px;
      }

      .movie-poster-image {
        width: 120px;
        height: 180px;
        align-self: center;
      }

      .movie-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        overflow: hidden;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }

      .movie-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      }

      .poster-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        padding: 16px;
      }

      .rating {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #ffc107;
        font-weight: 600;
        background: rgba(0,0,0,0.6);
        padding: 6px 12px;
        border-radius: 20px;
        align-self: flex-start;
      }

      .star {
        font-size: 16px !important;
        width: 16px !important;
        height: 16px !important;
      }

      .movie-title {
        margin: 0 0 12px 0;
        font-size: 28px;
        font-weight: 700;
        line-height: 1.2;
      }

      .movie-title-link {
        color: #1a1a1a;
        text-decoration: none;
        transition: color 0.2s ease;
      }

      .movie-title-link:hover {
        color: #d32f2f;
        text-decoration: underline;
      }

      .movie-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #666;
        font-size: 14px;
        margin-bottom: 8px;
      }

      .duration {
        font-weight: 500;
      }

      .separator {
        color: #ccc;
        margin: 0 4px;
      }

      .release-date {
        color: #888;
      }

      .movie-description {
        margin-bottom: 24px;
        color: #555;
        line-height: 1.6;
        font-size: 15px;
      }

      .theater-name {
        color: #d32f2f;
        margin: 0 0 16px 0;
        font-size: 20px;
        font-weight: 600;
        border-bottom: 2px solid #d32f2f;
        padding-bottom: 8px;
      }

      .session-date {
        color: #333;
        margin: 0 0 16px 0;
        font-weight: 600;
        font-size: 16px;
      }

      .sessions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 16px;
      }

      .session-card {
        background: #f8f9fa;
        border: 2px solid #e9ecef;
        border-radius: 12px;
        padding: 20px;
        transition: all 0.3s ease;
        position: relative;
      }

      .session-card:hover {
        border-color: #d32f2f;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(211, 47, 47, 0.15);
      }

      .session-card.session-full {
        background: #f5f5f5;
        border-color: #ddd;
        opacity: 0.7;
      }

      .session-time {
        font-size: 24px;
        font-weight: 700;
        color: #d32f2f;
        margin-bottom: 12px;
      }

      /* Global styles without encapsulation */
      .session-quality {
        margin-bottom: 12px !important;
      }

      .quality-badge {
        background: #e3f2fd !important;
        color: #1976d2 !important;
        padding: 6px 14px !important;
        border-radius: 16px !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        text-transform: uppercase !important;
        white-space: nowrap !important;
        display: inline-block !important;
        margin-right: 20px !important;
        border: 2px solid red !important;
      }

      .language-badge {
        background: #f3e5f5 !important;
        color: #7b1fa2 !important;
        padding: 6px 14px !important;
        border-radius: 16px !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        text-transform: uppercase !important;
        white-space: nowrap !important;
        display: inline-block !important;
        border: 2px solid blue !important;
      }

      .badge-separator {
        display: inline-block !important;
        width: 30px !important;
        height: 30px !important;
        background: red !important;
      }

      .language-badge {
        background: #f3e5f5;
        color: #7b1fa2;
      }

      .session-availability {
        font-size: 14px;
        color: #4caf50;
        margin-bottom: 12px;
        font-weight: 500;
      }

      .session-availability.full {
        color: #f44336;
      }

      .session-price {
        font-size: 20px;
        font-weight: 700;
        color: #d32f2f;
        margin-bottom: 16px;
      }

      .book-session-btn {
        background: #d32f2f !important;
        color: white !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 12px 24px !important;
        font-weight: 600 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
        transition: all 0.2s ease !important;
        width: 100% !important;
      }

      .book-session-btn:hover:not(:disabled) {
        background: #b71c1c !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3) !important;
      }

      .book-session-btn:disabled {
        background: #ccc !important;
        color: #888 !important;
        cursor: not-allowed !important;
      }

      .no-sessions {
        text-align: center;
        padding: 60px 40px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }

      .loading {
        text-align: center;
        padding: 60px 40px;
        color: #666;
      }

      .header-content {
        padding: 30px 20px;
      }

      .header-title {
        font-size: 28px;
      }

      .header-subtitle {
        font-size: 16px;
      }
    }

    /* FORCE DARK COLORS - Override all Material Design styles */
    .movie-card .movie-title,
    .movie-card .movie-title-link,
    .movie-card .movie-title a,
    .movie-card h3,
    .movie-card h3 a,
    .movie-card mat-card-title,
    .movie-card mat-card-title a {
      color: #1a1a1a !important;
    }

    .movie-card .movie-meta,
    .movie-card .movie-meta span,
    .movie-card .duration,
    .movie-card .release-date {
      color: #666 !important;
    }

    .movie-card .movie-description,
    .movie-card p {
      color: #555 !important;
    }

    .movie-card .theater-name,
    .movie-card h4 {
      color: #d32f2f !important;
    }

    .movie-card .session-date,
    .movie-card h5 {
      color: #333 !important;
    }

    /* Specific text color fixes - target only necessary elements */
    .booking-container .movie-title,
    .booking-container .movie-title-link,
    .booking-container .movie-title a,
    .booking-container h3,
    .booking-container h3 a,
    .booking-container .theater-name,
    .booking-container .session-date,
    .booking-container h4,
    .booking-container h5,
    .booking-container .selection-card *,
    .booking-container .loading,
    .booking-container .no-sessions {
      color: #333 !important;
    }

    /* Explicitly preserve booking header white text */
    .booking-header,
    .booking-header *,
    .booking-header .header-title,
    .booking-header .header-subtitle {
      color: white !important;
    }

    .booking-container .movie-description {
      color: #555 !important;
    }

    .booking-container .movie-meta {
      color: #666 !important;
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
    private router: Router,
    private dateFormatService: DateFormatService,
    private moviesService: MoviesService
  ) {}

  ngOnInit() {
    this.loadTheaters();
  }

  loadTheaters() {
    this.adminService.getTheaters().subscribe({
      next: (theaters: Theater[]) => {
        this.theaters = theaters;

        // Sélectionner automatiquement le premier cinéma
        if (theaters && theaters.length > 0) {
          this.selectedTheaterId = theaters[0].id;
          this.loadSessionsForTheater();
        }
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

    // Ensure sessions is an array
    if (!Array.isArray(sessions)) {
      console.warn('Sessions is not an array:', sessions);
      this.moviesWithSessions = [];
      return;
    }

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

    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      // Si pas connecté, rediriger vers la connexion avec returnUrl
      const returnUrl = `/booking/session/${session.id}`;
      this.router.navigate(['/login'], { queryParams: { returnUrl } });
      return;
    }

    // Si connecté, naviguer vers la sélection des sièges
    this.router.navigate(['/booking/session', session.id]);
  }

  getMoviePosterUrl(poster?: string): string {
    return this.moviesService.getPosterUrl(poster);
  }

  formatDate(dateString: string): string {
    return this.dateFormatService.formatDate(dateString);
  }

  formatTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatReleaseDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && !target.src.includes('no-poster')) {
      target.src = '/assets/images/no-poster.svg';
    }
  }
}
