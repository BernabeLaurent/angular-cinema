import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../auth/auth.service';
import { User } from '../../../auth/user.interface';
import { CreateUserDto } from '../../../users/dtos/create-user.dto';
import { RoleUser } from '../../../users/enums/roles-users.enum';
import { UserFormDialogComponent } from '../user-form-dialog/user-form-dialog.component';
import { DateFormatService } from '../../../services/date-format.service';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.scss']
})
export class UsersManagementComponent implements OnInit {
  users$: Observable<User[]> = of([]);
  allUsers: User[] = [];
  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'createDate', 'actions'];
  loading = false;
  searchTerm = '';
  selectedRole: RoleUser | '' = '';
  roles = Object.values(RoleUser) as RoleUser[];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private dateFormatService: DateFormatService
  ) {}

  ngOnInit(): void {
    // Force l'initialisation de l'utilisateur depuis le token si nécessaire
    this.authService.forceInitFromToken();
    
    // Petit délai pour laisser le temps au service de s'initialiser
    setTimeout(() => {
      this.loadUsers();
    }, 100);
  }

  loadUsers(): void {
    console.log('Starting to load users...');
    this.loading = true;
    this.users$ = of([]);
    this.cdr.detectChanges();
    
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Users loaded successfully:', users.length, users);
        this.allUsers = users;
        this.applyFilter(); // Apply current filters after loading
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
        this.showError('Erreur lors du chargement des utilisateurs');
        this.users$ = of([]);
        this.cdr.detectChanges();
      }
    });
  }

  openCreateUserDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createUser(result);
      }
    });
  }

  openEditUserDialog(user: User): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', user: user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateUser(user.id, result);
      }
    });
  }

  createUser(userData: CreateUserDto): void {
    this.adminService.createUser(userData).subscribe({
      next: () => {
        this.showSuccess('Utilisateur créé avec succès');
        this.loadUsers();
      },
      error: (error) => {
        this.showError('Erreur lors de la création de l\'utilisateur');
        console.error('Error creating user:', error);
      }
    });
  }

  updateUser(id: number, userData: Partial<CreateUserDto>): void {
    this.adminService.updateUser(id, userData).subscribe({
      next: () => {
        this.showSuccess('Utilisateur modifié avec succès');
        this.loadUsers();
      },
      error: (error) => {
        this.showError('Erreur lors de la modification de l\'utilisateur');
        console.error('Error updating user:', error);
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.email} ?`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          this.showSuccess('Utilisateur supprimé avec succès');
          this.loadUsers();
        },
        error: (error) => {
          this.showError('Erreur lors de la suppression de l\'utilisateur');
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  getRoleDisplayName(role: RoleUser): string {
    switch (role) {
      case RoleUser.ADMIN:
        return 'Administrateur';
      case RoleUser.WORKER:
        return 'Employé';
      case RoleUser.CUSTOMER:
        return 'Client';
      default:
        return role;
    }
  }

  getRoleColor(role: RoleUser): string {
    switch (role) {
      case RoleUser.ADMIN:
        return 'warn';
      case RoleUser.WORKER:
        return 'accent';
      case RoleUser.CUSTOMER:
        return 'primary';
      default:
        return '';
    }
  }

  formatDate(date: string): string {
    return this.dateFormatService.formatDate(date);
  }

  applyFilter(): void {
    let filteredUsers = [...this.allUsers];
    
    // Filtrer par terme de recherche (email)
    if (this.searchTerm.trim()) {
      const searchTerm = this.searchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.email?.toLowerCase().includes(searchTerm) ||
        user.firstName?.toLowerCase().includes(searchTerm) ||
        user.lastName?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filtrer par rôle
    if (this.selectedRole) {
      filteredUsers = filteredUsers.filter(user => 
        user.roleUser === this.selectedRole
      );
    }
    
    console.log('Applied filters:', { 
      searchTerm: this.searchTerm, 
      selectedRole: this.selectedRole, 
      totalUsers: this.allUsers.length, 
      filteredCount: filteredUsers.length 
    });
    
    this.users$ = of(filteredUsers);
    this.cdr.detectChanges();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.applyFilter();
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}