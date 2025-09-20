import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MovieCardComponent, Movie } from '../movie-card/movie-card.component';
import { SessionsService } from '../../services/sessions.service';
import { AdminService } from '../../services/admin.service';
import { MoviesService } from '../../services/movies.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-movies-section',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MovieCardComponent
  ],
  templateUrl: './movies-section.component.html',
  styleUrls: ['./movies-section.component.scss']
})
export class MoviesSectionComponent implements OnInit {
  nowShowingMovies: Movie[] = [];
  comingSoonMovies: Movie[] = [];
  loading = false;
  loadingMoreMovies = false;
  upcomingMoviesPage = 1;

  constructor(
    private sessionsService: SessionsService,
    private adminService: AdminService,
    private moviesService: MoviesService
  ) {}

  ngOnInit() {
    this.loadMovies();
  }

  loadMovies() {
    this.loading = true;
    
    // Récupérer tous les cinémas et toutes les sessions pour déterminer quels films ont des séances
    forkJoin({
      theaters: this.adminService.getTheaters(),
      allSessions: this.adminService.getAllSessions()
    }).subscribe({
      next: ({ theaters, allSessions }) => {
        
        // Films avec séances actuelles (À l'affiche)
        const moviesWithSessions = this.getMoviesWithCurrentSessions(allSessions);
        this.nowShowingMovies = this.convertToMovieCardFormat(moviesWithSessions);
        
        // Films à venir (Prochainement) - charger depuis l'API externe
        this.loadUpcomingMovies();
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des films:', error);
        this.loading = false;
        // Fallback vers les données statiques en cas d'erreur
        this.loadFallbackData();
      }
    });
  }

  private getMoviesWithCurrentSessions(sessions: any[]): any[] {
    const now = new Date();
    const moviesMap = new Map();
    
    
    sessions.forEach((session, index) => {
      
      if (session.movie && session.startTime) {
        const sessionDate = new Date(session.startTime);
        const timeDiff = sessionDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        
        // Considérer les films "à l'affiche" s'ils ont des séances dans les 6 derniers mois ou futures
        const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
        const isRecentOrFuture = sessionDate > sixMonthsAgo;
        
        
        if (isRecentOrFuture) {
          const movieId = session.movie.id;
          if (!moviesMap.has(movieId)) {
            moviesMap.set(movieId, {
              ...session.movie,
              sessionCount: 0
            });
          }
          moviesMap.get(movieId).sessionCount++;
        } else {
        }
      } else {
      }
    });
    
    const result = Array.from(moviesMap.values());
    return result;
  }

  private convertToMovieCardFormat(movies: any[]): Movie[] {
    return movies.map(movie => {
      
      const result = {
        id: movie.id,
        title: movie.title || movie.originalTitle || 'Titre non disponible',
        poster: this.getMoviePosterUrl(movie.posterPath || movie.poster),
        genre: 'Genre non spécifié', // Pas d'info genre dans l'API actuelle
        duration: movie.runtime ? `${movie.runtime}min` : (movie.duration ? `${movie.duration}min` : 'Durée non spécifiée'),
        rating: movie.averageRating || movie.rating || 0,
        releaseDate: this.formatReleaseDate(movie.releaseDate)
      };
      
      return result;
    });
  }

  private loadUpcomingMovies() {
    // Charger les films à venir depuis notre base de données
    this.adminService.getAllMovies().subscribe({
      next: (allMovies) => {
        
        // Films qui n'ont pas de séances actuelles (films à venir)
        const upcomingMoviesFromDB = allMovies.filter(movie => 
          !movie.availableSessions || movie.availableSessions === 0
        );
        
        if (upcomingMoviesFromDB.length > 0) {
          // Charger les 6 premiers films (page 1)
          this.comingSoonMovies = this.convertToMovieCardFormat(upcomingMoviesFromDB.slice(0, 6));
        } else {
          this.comingSoonMovies = [];
        }
      },
      error: (error) => {
        this.comingSoonMovies = [];
      }
    });
  }
  


  private loadFallbackData() {
    this.nowShowingMovies = [
      {
        id: 1,
        title: 'Dune: Deuxième Partie',
        poster: 'assets/images/placeholder-movie.svg',
        genre: 'Science-Fiction, Action',
        duration: '2h46',
        rating: 4.7,
        releaseDate: '28 février 2024'
      }
    ];
    
    this.comingSoonMovies = [];
  }

  private getMoviePosterUrl(posterPath?: string): string {
    
    if (!posterPath) {
      const svgContent = `<svg width="300" height="450" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#333"/>
        <text x="150" y="225" text-anchor="middle" fill="#888" font-family="Arial, sans-serif" font-size="16">
          IMAGE NON TROUVÉE
        </text>
      </svg>`;
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
    }
    
    // Utiliser le service movies pour générer l'URL correcte
    const posterUrl = this.moviesService.getPosterUrl(posterPath);
    return posterUrl;
  }

  private formatReleaseDate(dateString?: string): string {
    if (!dateString) return 'Date non disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  loadMoreUpcomingMovies() {
    if (this.loadingMoreMovies) return;
    
    this.loadingMoreMovies = true;
    this.upcomingMoviesPage++;
    
    
    // Charger plus de films depuis la base de données
    this.adminService.getAllMovies().subscribe({
      next: (allMovies) => {
        
        // Filtrer les films qui n'ont pas de séances (films à venir)
        const upcomingMoviesFromDB = allMovies.filter(movie => 
          !movie.availableSessions || movie.availableSessions === 0
        );
        
        // Pagination des films de la DB
        const startIndex = (this.upcomingMoviesPage - 1) * 6;
        const newMovies = upcomingMoviesFromDB.slice(startIndex, startIndex + 6);
        
        if (newMovies.length > 0) {
          const convertedMovies = this.convertToMovieCardFormat(newMovies);
          // Ajouter les nouveaux films à la liste existante
          this.comingSoonMovies = [...this.comingSoonMovies, ...convertedMovies];
          
          // Auto-scroll vers les nouveaux films après un court délai
          setTimeout(() => {
            this.scrollToNewMovies('coming-soon');
          }, 100);
        } else {
        }
        
        this.loadingMoreMovies = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de plus de films DB:', error);
        this.loadingMoreMovies = false;
      }
    });
  }
  
  
  private scrollToNewMovies(containerId: string) {
    const container = document.getElementById(containerId);
    if (container) {
      // Calculer la position pour montrer les nouveaux films
      const scrollAmount = 300 * 2; // Scroll pour 2 films
      container.scrollTo({
        left: container.scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  scrollMovies(containerId: string, direction: 'left' | 'right') {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 300;
      const scrollPosition = direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }
}