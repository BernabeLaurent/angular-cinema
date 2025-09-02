import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { AdminGuard } from './auth/admin.guard';

// Composants d'administration
import { AdminDashboardComponent } from './admin/components/admin-dashboard/admin-dashboard.component';
import { UsersManagementComponent } from './admin/components/users-management/users-management.component';
import { TheatersManagementComponent } from './admin/components/theaters-management/theaters-management.component';

// Composants principaux
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';

export const routes: Routes = [
  // Route par défaut - Page d'accueil
  {
    path: '',
    component: HeroSectionComponent,
    title: 'Pathé - Cinéma'
  },
  
  // Routes utilisateur
  {
    path: 'profile',
    component: UserProfileComponent,
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
        loadComponent: () => import('./admin/components/movies-management/movies-management.component')
          .then(c => c.MoviesManagementComponent),
        title: 'Gestion des films - Administration Pathé'
      },
      {
        path: 'bookings',
        loadComponent: () => import('./admin/components/bookings-management/bookings-management.component')
          .then(c => c.BookingsManagementComponent),
        title: 'Gestion des réservations - Administration Pathé'
      }
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
    path: 'cinemas',
    loadComponent: () => import('./components/theaters-list/theaters-list.component')
      .then(c => c.TheatersListComponent),
    title: 'Nos Cinémas - Pathé'
  },
  
  {
    path: 'bookings',
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/user-bookings/user-bookings.component')
      .then(c => c.UserBookingsComponent),
    title: 'Mes Réservations - Pathé'
  },
  
  // Gestion d'erreurs
  {
    path: 'unauthorized',
    loadComponent: () => import('./components/unauthorized/unauthorized.component')
      .then(c => c.UnauthorizedComponent),
    title: 'Accès non autorisé - Pathé'
  },
  
  {
    path: '404',
    loadComponent: () => import('./components/not-found/not-found.component')
      .then(c => c.NotFoundComponent),
    title: 'Page non trouvée - Pathé'
  },
  
  // Redirection des routes inconnues
  {
    path: '**',
    redirectTo: '/404'
  }
];