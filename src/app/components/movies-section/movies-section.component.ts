import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MovieCardComponent, Movie } from '../movie-card/movie-card.component';

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
export class MoviesSectionComponent {
  nowShowingMovies: Movie[] = [
    {
      id: 1,
      title: 'Spider-Man: No Way Home',
      poster: 'assets/images/placeholder-movie.svg',
      genre: 'Action, Aventure',
      duration: '2h28',
      rating: 4.5,
      releaseDate: '15 décembre 2021'
    },
    {
      id: 2,
      title: 'The Batman',
      poster: 'assets/images/placeholder-movie.svg',
      genre: 'Action, Thriller',
      duration: '2h56',
      rating: 4.2,
      releaseDate: '2 mars 2022'
    },
    {
      id: 3,
      title: 'Dune',
      poster: 'assets/images/placeholder-movie.svg',
      genre: 'Science-Fiction',
      duration: '2h35',
      rating: 4.3,
      releaseDate: '15 septembre 2021'
    },
    {
      id: 4,
      title: 'Top Gun: Maverick',
      poster: 'assets/images/placeholder-movie.svg',
      genre: 'Action, Drame',
      duration: '2h11',
      rating: 4.6,
      releaseDate: '25 mai 2022'
    },
    {
      id: 5,
      title: 'Black Widow',
      poster: 'assets/images/placeholder-movie.svg',
      genre: 'Action, Aventure',
      duration: '2h14',
      rating: 4.0,
      releaseDate: '7 juillet 2021'
    },
    {
      id: 6,
      title: 'Doctor Strange 2',
      poster: 'assets/images/placeholder-movie.svg',
      genre: 'Action, Fantastique',
      duration: '2h06',
      rating: 4.1,
      releaseDate: '4 mai 2022'
    }
  ];

  comingSoonMovies: Movie[] = [
    {
      id: 7,
      title: 'Avatar: The Way of Water',
      poster: 'assets/images/placeholder-movie.svg',
      genre: 'Science-Fiction',
      duration: '3h12',
      rating: 4.4,
      releaseDate: '14 décembre 2022'
    },
    {
      id: 8,
      title: 'Black Panther: Wakanda Forever',
      poster: 'assets/images/placeholder-movie.svg',
      genre: 'Action, Aventure',
      duration: '2h41',
      rating: 4.2,
      releaseDate: '9 novembre 2022'
    },
    {
      id: 9,
      title: 'The Flash',
      poster: 'assets/images/placeholder-movie.svg',
      genre: 'Action, Aventure',
      duration: '2h24',
      rating: 4.0,
      releaseDate: '14 juin 2023'
    },
    {
      id: 10,
      title: 'Indiana Jones 5',
      poster: 'assets/images/placeholder-movie.svg',
      genre: 'Action, Aventure',
      duration: '2h34',
      rating: 4.3,
      releaseDate: '28 juin 2023'
    }
  ];

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