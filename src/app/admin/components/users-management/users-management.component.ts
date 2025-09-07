import { Component, OnInit } from '@angular/core';
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
import { User } from '../../../auth/user.interface';
import { CreateUserDto } from '../../../users/dtos/create-user.dto';
import { RoleUser } from '../../../users/enums/roles-users.enum';
import { UserFormDialogComponent } from '../user-form-dialog/user-form-dialog.component';

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
  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'createDate', 'actions'];
  loading = false;
  searchTerm = '';
  selectedRole: RoleUser | '' = '';
  roles = Object.values(RoleUser) as RoleUser[];

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.users$ = this.adminService.getAllUsers().pipe(
      tap(() => this.loading = false),
      catchError(error => {
        this.loading = false;
        this.showError('Erreur lors du chargement des utilisateurs');
        console.error('Error loading users:', error);
        return of([]);
      })
    );
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
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  applyFilter(): void {
    // Cette logique sera implémentée côté serveur si nécessaire
    // Pour l'instant, nous rechargeons toutes les données
    this.loadUsers();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.loadUsers();
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