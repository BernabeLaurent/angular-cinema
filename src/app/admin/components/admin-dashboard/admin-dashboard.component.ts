import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AdminService } from '../../../services/admin.service';
import { UserRoleService } from '../../../services/user-role.service';

interface DashboardStats {
  totalUsers: number;
  totalTheaters: number;
  totalBookings: number;
  pendingBookings: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    RouterLink
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats$: Observable<DashboardStats> = of({
    totalUsers: 0,
    totalTheaters: 0,
    totalBookings: 0,
    pendingBookings: 0
  });
  
  currentUser$!: Observable<any>;
  loading = true;

  quickActions = [
    {
      title: 'Créer un utilisateur',
      description: 'Ajouter un nouvel utilisateur au système',
      icon: 'person_add',
      color: 'primary',
      route: '/admin/users',
      action: 'create-user'
    },
    {
      title: 'Ajouter un cinéma',
      description: 'Enregistrer un nouveau cinéma',
      icon: 'add_business',
      color: 'accent',
      route: '/admin/theaters',
      action: 'create-theater'
    },
    {
      title: 'Voir les réservations',
      description: 'Consulter les réservations récentes',
      icon: 'event_seat',
      color: 'primary',
      route: '/admin/bookings',
      action: 'view-bookings'
    },
    {
      title: 'Gérer les films',
      description: 'Administrer le catalogue de films',
      icon: 'movie',
      color: 'accent',
      route: '/admin/movies',
      action: 'manage-movies'
    }
  ];

  recentActivities = [
    {
      type: 'user',
      message: 'Nouvel utilisateur inscrit',
      detail: 'jean.dupont@example.com',
      time: '2 minutes',
      icon: 'person_add'
    },
    {
      type: 'booking',
      message: 'Nouvelle réservation',
      detail: 'Spider-Man - Pathé République',
      time: '5 minutes',
      icon: 'confirmation_number'
    },
    {
      type: 'theater',
      message: 'Cinéma mis à jour',
      detail: 'Pathé Beaugrenelle - Horaires modifiés',
      time: '12 minutes',
      icon: 'edit'
    },
    {
      type: 'system',
      message: 'Sauvegarde automatique',
      detail: 'Base de données sauvegardée',
      time: '30 minutes',
      icon: 'backup'
    }
  ];

  constructor(
    private adminService: AdminService,
    private userRoleService: UserRoleService
  ) {
    this.currentUser$ = this.userRoleService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  private loadDashboardStats(): void {
    this.loading = true;
    
    // Charger les statistiques depuis l'API
    this.stats$ = forkJoin({
      users: this.adminService.getAllUsers().pipe(catchError(() => of([]))),
      bookings: this.adminService.getAllBookings().pipe(catchError(() => of([])))
    }).pipe(
      map((data: { users: any[], bookings: any[] }) => ({
        totalUsers: data.users.length,
        totalTheaters: 2, // Hardcodé car pas d'endpoint GET /theaters
        totalBookings: data.bookings.length,
        pendingBookings: data.bookings.filter((b: any, _index: number, _array: any[]) => b.status === 'PENDING').length
      })),
      catchError(error => {
        console.error('Error loading dashboard stats:', error);
        return of({
          totalUsers: 0,
          totalTheaters: 0,
          totalBookings: 0,
          pendingBookings: 0
        });
      })
    );

    // Simuler un délai de chargement
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  getActivityIcon(activity: any): string {
    return activity.icon;
  }

  getActivityColor(type: string): string {
    const colors: { [key: string]: string } = {
      user: 'primary',
      booking: 'accent',
      theater: 'warn',
      system: 'default'
    };
    return colors[type] || 'default';
  }

  refreshStats(): void {
    this.loadDashboardStats();
  }

  trackActivity(index: number, activity: any): any {
    return activity.detail + activity.time;
  }
}