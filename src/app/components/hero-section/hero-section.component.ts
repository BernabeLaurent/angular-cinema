import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { MoviesService } from '../../services/movies.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent implements OnInit {
  featuredMovie: any = null;
  loading = true;

  constructor(
    private adminService: AdminService,
    private moviesService: MoviesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadFeaturedMovie();
  }

  loadFeaturedMovie() {
    this.loading = true;

    // Récupérer toutes les sessions pour identifier les films à l'affiche
    forkJoin({
      theaters: this.adminService.getTheaters(),
      allSessions: this.adminService.getAllSessions()
    }).subscribe({
      next: ({ theaters, allSessions }) => {
        console.log('🎬 Recherche film featured...', allSessions);

        const currentMovies = this.getMoviesWithCurrentSessions(allSessions);
        console.log('Films à l\'affiche:', currentMovies);

        if (currentMovies.length > 0) {
          // Prendre un film aléatoire parmi ceux à l'affiche
          const randomIndex = Math.floor(Math.random() * currentMovies.length);
          const selectedMovie = currentMovies[randomIndex];

          // Prioriser backdrop_path, puis poster_path, puis image par défaut
          const backdropUrl = this.getMovieBackdropUrl(selectedMovie);

          this.featuredMovie = {
            title: selectedMovie.title?.toUpperCase() || 'FILM À L\'AFFICHE',
            subtitle: this.generateSubtitle(selectedMovie),
            description: selectedMovie.description || selectedMovie.synopsis || 'Découvrez ce film actuellement à l\'affiche dans nos cinémas.',
            duration: this.formatDuration(selectedMovie.duration),
            genre: selectedMovie.genre || selectedMovie.genres?.join(', ') || 'Film',
            rating: selectedMovie.rating || selectedMovie.vote_average || '4.0',
            backgroundImage: backdropUrl,
            trailerUrl: '#',
            movieId: selectedMovie.id,
            hasBackdrop: !!selectedMovie.backdrop_path
          };

          console.log('🖼️ Image backdrop sélectionnée:', {
            backdrop_path: selectedMovie.backdrop_path,
            poster_path: selectedMovie.poster_path,
            finalUrl: backdropUrl,
            hasBackdrop: this.featuredMovie.hasBackdrop
          });

          console.log('🎯 Film sélectionné pour hero:', this.featuredMovie);
        } else {
          console.log('❌ Aucun film à l\'affiche trouvé');
          this.featuredMovie = null;
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du film featured:', error);
        this.featuredMovie = null;
        this.loading = false;
      }
    });
  }

  private getMoviesWithCurrentSessions(sessions: any[]): any[] {
    const now = new Date();
    const moviesMap = new Map();

    sessions.forEach(session => {
      if (session.movie && session.startTime) {
        const sessionDate = new Date(session.startTime);
        // Considérer les films "à l'affiche" s'ils ont des séances dans les 6 derniers mois ou futures
        const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
        const isRecentOrFuture = sessionDate > sixMonthsAgo;

        if (isRecentOrFuture) {
          const movieId = session.movie.id;
          if (!moviesMap.has(movieId)) {
            moviesMap.set(movieId, session.movie);
          }
        }
      }
    });

    return Array.from(moviesMap.values());
  }

  private generateSubtitle(movie: any): string {
    if (movie.tagline) return movie.tagline;
    if (movie.genre) return `Un film ${movie.genre.toLowerCase()}`;
    if (movie.genres && movie.genres.length > 0) return `Un film ${movie.genres[0].toLowerCase()}`;
    return 'Actuellement à l\'affiche';
  }

  private formatDuration(duration: any): string {
    if (!duration) return '';
    if (typeof duration === 'string' && duration.includes('h')) return duration;
    if (typeof duration === 'number') {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${hours}h${minutes.toString().padStart(2, '0')}`;
    }
    return duration.toString();
  }

  private getMovieBackdropUrl(movie: any): string {
    console.log('🔍 DEBUG getMovieBackdropUrl - Film:', movie.title);
    console.log('🔍 movie.backdrop_path:', movie.backdrop_path);
    console.log('🔍 movie.backdropPath:', movie.backdropPath);
    console.log('🔍 movie.poster_path:', movie.poster_path);
    console.log('🔍 movie.posterPath:', movie.posterPath);

    // Prioriser backdrop_path pour l'arrière-plan hero (avec les deux formats possibles)
    const backdropPath = movie.backdrop_path || movie.backdropPath;
    if (backdropPath) {
      const backdropUrl = this.moviesService.getBackdropUrl(backdropPath);
      console.log('✅ Utilisation backdrop_path:', backdropUrl);
      return backdropUrl;
    }

    // Fallback sur poster_path si pas de backdrop (avec les deux formats possibles)
    const posterPath = movie.poster_path || movie.posterPath;
    if (posterPath) {
      const posterUrl = this.moviesService.getPosterUrl(posterPath);
      console.log('⚠️ Fallback sur poster_path:', posterUrl);
      return posterUrl;
    }

    // Fallback final sur image placeholder
    console.log('❌ Aucune image disponible, utilisation placeholder');
    return 'assets/images/placeholder-movie.svg';
  }

  onBookTicket() {
    console.log('🎫 Réserver des places pour:', this.featuredMovie?.title);

    if (this.featuredMovie?.movieId) {
      console.log('Navigation vers réservation pour film ID:', this.featuredMovie.movieId);
      // Naviguer vers la page de réservation générale (où l'utilisateur peut choisir le film/séance)
      this.router.navigate(['/booking']);
    } else {
      console.warn('❌ Pas d\'ID de film disponible pour la réservation');
      // Fallback vers la page de réservation générale
      this.router.navigate(['/booking']);
    }
  }

  onViewDetails() {
    console.log('📄 Voir détails pour:', this.featuredMovie?.title);

    if (this.featuredMovie?.movieId) {
      console.log('Navigation vers détails pour film ID:', this.featuredMovie.movieId);
      // Naviguer vers les détails du film spécifique
      this.router.navigate(['/movies', this.featuredMovie.movieId]);
    } else {
      console.warn('❌ Pas d\'ID de film disponible pour les détails');
      // Fallback vers la liste des films
      this.router.navigate(['/movies']);
    }
  }
}