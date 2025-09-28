import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { AdminGuard } from './auth/admin.guard';
import { AdminOnlyGuard } from './auth/admin-only.guard';

// Composants principaux
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  // Route par défaut - Page d'accueil
  {
    path: '',
    component: HomeComponent,
    title: 'Tchitcha - Cinéma'
  },
  
  // Routes utilisateur
  {
    path: 'profile',
    loadComponent: () => import('./components/user-profile/user-profile-new.component')
      .then(c => c.UserProfileNewComponent),
    canActivate: [AuthGuard],
    title: 'Mon Profil - Tchitcha'
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
        loadComponent: () => import('./admin/components/admin-dashboard/admin-dashboard.component')
          .then(c => c.AdminDashboardComponent),
        title: 'Tableau de bord - Administration Tchitcha'
      },
      {
        path: 'users',
        loadComponent: () => import('./admin/components/users-management/users-management.component')
          .then(c => c.UsersManagementComponent),
        canActivate: [AdminOnlyGuard],
        title: 'Gestion des utilisateurs - Administration Tchitcha'
      },
      {
        path: 'theaters',
        loadComponent: () => import('./admin/components/theaters-management/theaters-management.component')
          .then(c => c.TheatersManagementComponent),
        canActivate: [AdminOnlyGuard],
        title: 'Gestion des cinémas - Administration Tchitcha'
      },
      {
        path: 'movies',
        loadComponent: () => import('./admin/components/movies-management/movies-management.component')
          .then(c => c.MoviesManagementComponent),
        title: 'Gestion des films - Administration Tchitcha'
      },
      {
        path: 'bookings',
        loadComponent: () => import('./admin/components/bookings-management/bookings-management.component')
          .then(c => c.BookingsManagementComponent),
        title: 'Gestion des réservations - Administration Tchitcha'
      },
    ]
  },

  // Routes d'authentification
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component')
      .then(c => c.LoginComponent),
    title: 'Connexion - Tchitcha'
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./auth/forgot-password/forgot-password.component')
      .then(c => c.ForgotPasswordComponent),
    title: 'Mot de passe oublié - Tchitcha'
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./auth/reset-password/reset-password.component')
      .then(c => c.ResetPasswordComponent),
    title: 'Réinitialiser le mot de passe - Tchitcha'
  },
  {
    path: 'auth/reset-password',
    loadComponent: () => import('./auth/reset-password/reset-password.component')
      .then(c => c.ResetPasswordComponent),
    title: 'Réinitialiser le mot de passe - Tchitcha'
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./auth/forgot-password/forgot-password.component')
      .then(c => c.ForgotPasswordComponent),
    title: 'Mot de passe oublié - Tchitcha'
  },

  // Routes publiques
  {
    path: 'movies',
    loadComponent: () => import('./components/movies-section/movies-section.component')
      .then(c => c.MoviesSectionComponent),
    title: 'Films - Tchitcha'
  },
  
  {
    path: 'movies/:id',
    loadComponent: () => import('./movies/movie-details/movie-details.component')
      .then(c => c.MovieDetailsComponent),
    title: 'Détails du film - Tchitcha'
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
    title: 'Réserver une séance - Tchitcha'
  },
  
  {
    path: 'booking/session/:sessionId',
    canActivate: [AuthGuard],
    loadComponent: () => import('./booking/seat-selection/seat-selection.component')
      .then(c => c.SeatSelectionComponent),
    title: 'Sélection des places - Tchitcha'
  },
  
  {
    path: 'my-bookings',
    canActivate: [AuthGuard],
    loadComponent: () => import('./booking/my-bookings/my-bookings.component')
      .then(c => c.MyBookingsComponent),
    title: 'Mes Réservations - Tchitcha'
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