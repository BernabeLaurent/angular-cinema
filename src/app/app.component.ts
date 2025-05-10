import {Component, ViewChild, ElementRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconButton} from '@angular/material/button';
import {NavbarComponent} from './common/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDividerModule,
    NavbarComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-cinema';
  isLoggedIn = false; // À connecter avec votre service d'authentification
  isSearchModalOpen = false;
  isUserMenuOpen = false;

  @ViewChild('moviesContainer') moviesContainer!: ElementRef;
  @ViewChild('userMenuButton') userMenuButton!: ElementRef<MatIconButton>;

  // Liste des cinémas disponibles
  cinemas = [
    'Cinéma Pathé',
    'Cinéma UGC',
    'Cinéma MK2',
    'Cinéma Gaumont',
    'Cinéma CGR'
  ];

  // Propriétés pour le champ de recherche
  selectedCinema: string = '';
  filteredCinemas: string[] = [];
  searchQuery: string = '';

  // Données de démonstration pour les films
  featuredMovie = {
    title: 'Film à l\'affiche',
    image: 'assets/images/featured-movie.jpg'
  };

  currentMovies = [
    {title: 'Film 1', poster: 'assets/images/movie1.jpg'},
    {title: 'Film 2', poster: 'assets/images/movie2.jpg'},
    {title: 'Film 3', poster: 'assets/images/movie3.jpg'},
    {title: 'Film 4', poster: 'assets/images/movie4.jpg'},
    {title: 'Film 5', poster: 'assets/images/movie5.jpg'},
    {title: 'Film 6', poster: 'assets/images/movie6.jpg'}
  ];

  constructor(private dialog: MatDialog) {
  }

  openSearchModal() {
    this.isSearchModalOpen = true;
  }

  closeSearchModal() {
    this.isSearchModalOpen = false;
  }

  scrollMovies(direction: 'left' | 'right') {
    const container = this.moviesContainer.nativeElement;
    const scrollAmount = 220; // 200px card width + 20px gap
    const scrollPosition = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  }

  // Méthode pour filtrer les cinémas lors de la recherche
  filterCinemas(event: any) {
    const value = event.target.value.toLowerCase();
    this.filteredCinemas = this.cinemas.filter(cinema =>
      cinema.toLowerCase().includes(value)
    );
  }

  // Méthode pour sélectionner un cinéma
  selectCinema(cinema: string) {
    this.selectedCinema = cinema;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
  }
}
