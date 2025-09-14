import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { AdminGuard } from './auth/admin.guard';

// Composants d'administration
import { AdminDashboardComponent } from './admin/components/admin-dashboard/admin-dashboard.component';
import { UsersManagementComponent } from './admin/components/users-management/users-management.component';
import { TheatersManagementComponent } from './admin/components/theaters-management/theaters-management.component';
import { MoviesManagementComponent } from './admin/components/movies-management/movies-management.component';
import { BookingsManagementComponent } from './admin/components/bookings-management/bookings-management.component';

// Composants principaux
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  // Route par défaut - Page d'accueil
  {
    path: '',
    component: HomeComponent,
    title: 'Pathé - Cinéma'
  },
  
  // Routes utilisateur
  {
    path: 'profile',
    loadComponent: () => import('./components/user-profile/user-profile-new.component')
      .then(c => c.UserProfileNewComponent),
    canActivate: [AuthGuard],
    title: 'Mon Profil - Pathé'
  },
  
  // Routes d'administration - Protégées par AdminGuard
  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        title: 'Tableau de bord - Administration Pathé'
      },
      {
        path: 'users',
        component: UsersManagementComponent,
        title: 'Gestion des utilisateurs - Administration Pathé'
      },
      {
        path: 'theaters',
        component: TheatersManagementComponent,
        title: 'Gestion des cinémas - Administration Pathé'
      },
      {
        path: 'movies',
        component: MoviesManagementComponent,
        title: 'Gestion des films - Administration Pathé'
      },
      {
        path: 'bookings',
        component: BookingsManagementComponent,
        title: 'Gestion des réservations - Administration Pathé'
      },
    ]
  },

  // Routes publiques
  {
    path: 'movies',
    loadComponent: () => import('./components/movies-section/movies-section.component')
      .then(c => c.MoviesSectionComponent),
    title: 'Films - Pathé'
  },
  
  {
    path: 'movies/:id',
    loadComponent: () => {
      console.log('🔄 Loading MovieDetailsComponent...');
      return import('./movies/movie-details/movie-details.component')
        .then(c => {
          console.log('✅ MovieDetailsComponent loaded:', c);
          return c.MovieDetailsComponent;
        })
        .catch(err => {
          console.error('❌ Failed to load MovieDetailsComponent:', err);
          throw err;
        });
    },
    title: 'Détails du film - Pathé'
  },
  
  {
    path: 'cinemas',
    redirectTo: '/booking',
    pathMatch: 'full'
  },
  
  // Routes de réservation
  {
    path: 'booking',
    loadComponent: () => import('./booking/booking.component')
      .then(c => c.BookingComponent),
    title: 'Réserver une séance - Pathé'
  },
  
  {
    path: 'booking/session/:sessionId',
    canActivate: [AuthGuard],
    loadComponent: () => import('./booking/seat-selection/seat-selection.component')
      .then(c => c.SeatSelectionComponent),
    title: 'Sélection des places - Pathé'
  },
  
  {
    path: 'my-bookings',
    canActivate: [AuthGuard],
    loadComponent: () => import('./booking/my-bookings/my-bookings.component')
      .then(c => c.MyBookingsComponent),
    title: 'Mes Réservations - Pathé'
  },
  
  // Gestion d'erreurs
  {
    path: 'unauthorized',
    redirectTo: '/',
    pathMatch: 'full'
  },
  
  {
    path: '404',
    redirectTo: '/',
    pathMatch: 'full'
  },
  
  // Redirection des routes inconnues
  {
    path: '**',
    redirectTo: '/404'
  }
];