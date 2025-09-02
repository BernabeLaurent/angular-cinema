import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';

import { User } from '../../auth/user.interface';
import { UserProfileService, UpdateUserProfileDto, ChangePasswordDto } from '../../services/user-profile.service';
import { AuthService } from '../../auth/auth.service';
import { RegionsIso } from '../../common/enums/regions-iso.enum';
import { RoleUser } from '../../users/enums/roles-users.enum';
import { Booking, BookingStatus } from '../../models/session.model';
import { BookingDetailsDialogComponent } from './booking-details-dialog.component';

@Component({
  selector: 'app-user-profile-new',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="profile-container" *ngIf="currentUser">
      <!-- Header du profil -->
      <mat-card class="profile-header">
        <mat-card-content>
          <div class="profile-info">
            <div class="avatar-section">
              <div class="user-avatar">
                {{ userProfileService.getInitials(currentUser) }}
              </div>
              <button mat-button class="change-avatar-btn">
                <mat-icon>photo_camera</mat-icon>
                Changer la photo
              </button>
            </div>
            <div class="user-details">
              <h1>{{ userProfileService.getFullName(currentUser) }}</h1>
              <p class="user-email">{{ currentUser.email }}</p>
              <mat-chip class="role-chip">{{ getRoleDisplayName(currentUser.role) }}</mat-chip>
              <p class="member-since" *ngIf="currentUser.createDate">
                Membre depuis {{ formatDate(currentUser.createDate) }}
              </p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Onglets du profil -->
      <mat-tab-group class="profile-tabs" [(selectedIndex)]="selectedTabIndex">
        <!-- Onglet Informations personnelles -->
        <mat-tab label="Informations personnelles">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Mes informations</mat-card-title>
                <mat-card-subtitle>Gérez vos informations personnelles et préférences</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Prénom</mat-label>
                      <input matInput formControlName="firstName" />
                      <mat-error *ngIf="profileForm.get('firstName')?.hasError('required')">
                        Le prénom est requis
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Nom</mat-label>
                      <input matInput formControlName="lastName" />
                      <mat-error *ngIf="profileForm.get('lastName')?.hasError('required')">
                        Le nom est requis
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Email</mat-label>
                      <input matInput formControlName="email" readonly />
                      <mat-hint>L'email ne peut pas être modifié</mat-hint>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Téléphone</mat-label>
                      <input matInput formControlName="phoneNumber" type="tel" />
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Adresse</mat-label>
                      <input matInput formControlName="address" />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Ville</mat-label>
                      <input matInput formControlName="city" />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Code postal</mat-label>
                      <input matInput formControlName="zipCode" type="number" />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Pays</mat-label>
                      <mat-select formControlName="codeCountry">
                        <mat-option [value]="RegionsIso.FRANCE">France</mat-option>
                        <mat-option [value]="RegionsIso.USA">États-Unis</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="accessibility-section">
                    <h3>Accessibilité</h3>
                    <mat-checkbox formControlName="hasDisability">
                      J'ai des besoins d'accessibilité spécifiques
                    </mat-checkbox>
                  </div>

                  <mat-card-actions>
                    <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.invalid || isUpdatingProfile">
                      <mat-icon *ngIf="!isUpdatingProfile">save</mat-icon>
                      <mat-icon *ngIf="isUpdatingProfile">hourglass_empty</mat-icon>
                      {{ isUpdatingProfile ? 'Mise à jour...' : 'Sauvegarder' }}
                    </button>
                    <button mat-button type="button" (click)="resetProfileForm()">
                      <mat-icon>refresh</mat-icon>
                      Annuler
                    </button>
                  </mat-card-actions>
                </form>
              </mat-card-content>
            </mat-card>

            <!-- Section changement de mot de passe -->
            <mat-card class="password-card">
              <mat-card-header>
                <mat-card-title>Sécurité</mat-card-title>
                <mat-card-subtitle>Changez votre mot de passe</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                  <div class="password-grid">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Mot de passe actuel</mat-label>
                      <input matInput type="password" formControlName="currentPassword" />
                      <mat-error *ngIf="passwordForm.get('currentPassword')?.hasError('required')">
                        Le mot de passe actuel est requis
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Nouveau mot de passe</mat-label>
                      <input matInput type="password" formControlName="newPassword" />
                      <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">
                        Le nouveau mot de passe est requis
                      </mat-error>
                      <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('pattern')">
                        Le mot de passe doit contenir au moins 8 caractères, une lettre, un chiffre et un caractère spécial
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Confirmer le nouveau mot de passe</mat-label>
                      <input matInput type="password" formControlName="confirmPassword" />
                      <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">
                        La confirmation est requise
                      </mat-error>
                      <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('mismatch')">
                        Les mots de passe ne correspondent pas
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <mat-card-actions>
                    <button mat-raised-button color="accent" type="submit" [disabled]="passwordForm.invalid || isChangingPassword">
                      <mat-icon *ngIf="!isChangingPassword">lock</mat-icon>
                      <mat-icon *ngIf="isChangingPassword">hourglass_empty</mat-icon>
                      {{ isChangingPassword ? 'Modification...' : 'Changer le mot de passe' }}
                    </button>
                  </mat-card-actions>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Onglet Mes réservations -->
        <mat-tab label="Mes réservations">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Historique de mes réservations</mat-card-title>
                <mat-card-subtitle>Consultez le détail de toutes vos réservations</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div *ngIf="loadingBookings" class="loading">
                  <mat-progress-bar mode="indeterminate"></mat-progress-bar>
                  <p>Chargement de vos réservations...</p>
                </div>

                <div *ngIf="!loadingBookings && userBookings.length === 0" class="no-bookings">
                  <mat-icon>event_seat</mat-icon>
                  <h3>Aucune réservation</h3>
                  <p>Vous n'avez pas encore effectué de réservation.</p>
                  <button mat-raised-button color="primary" routerLink="/booking">
                    <mat-icon>movie</mat-icon>
                    Réserver une séance
                  </button>
                </div>

                <div *ngIf="!loadingBookings && userBookings.length > 0" class="bookings-list">
                  <mat-card *ngFor="let booking of userBookings" class="booking-item">
                    <mat-card-header>
                      <div mat-card-avatar class="booking-avatar" [ngClass]="'status-' + booking.status.toLowerCase()">
                        <mat-icon>{{ getBookingStatusIcon(booking.status) }}</mat-icon>
                      </div>
                      <mat-card-title>
                        <a [routerLink]="['/movies', booking.sessionCinema?.movie?.id]" class="movie-link" *ngIf="booking.sessionCinema?.movie">
                          {{ booking.sessionCinema?.movie?.title }}
                        </a>
                        <span *ngIf="!booking.sessionCinema?.movie">Film non disponible</span>
                      </mat-card-title>
                      <mat-card-subtitle>
                        Réservation #{{ booking.id }} - {{ formatDate(booking.createDate) }}
                      </mat-card-subtitle>
                    </mat-card-header>

                    <mat-card-content>
                      <div class="booking-details">
                        <div class="session-info">
                          <div class="info-row">
                            <mat-icon>schedule</mat-icon>
                            <span>{{ formatDateTime(booking.sessionCinema?.startTime) }}</span>
                          </div>
                          <div class="info-row">
                            <mat-icon>location_on</mat-icon>
                            <span>{{ booking.sessionCinema?.movieTheater?.theater?.name }} - {{ booking.sessionCinema?.movieTheater?.theater?.city }}</span>
                          </div>
                          <div class="info-row">
                            <mat-icon>meeting_room</mat-icon>
                            <span>Salle {{ booking.sessionCinema?.movieTheater?.roomNumber }}</span>
                          </div>
                        </div>

                        <div class="booking-info">
                          <div class="info-row">
                            <mat-icon>event_seat</mat-icon>
                            <span>{{ booking.numberSeats }} place(s)</span>
                            <span *ngIf="booking.numberSeatsDisabled > 0"> ({{ booking.numberSeatsDisabled }} PMR)</span>
                          </div>
                          <div class="info-row" *ngIf="booking.reservedSeats && booking.reservedSeats.length > 0">
                            <mat-icon>chair</mat-icon>
                            <span>Places: {{ formatSeats(booking.reservedSeats) }}</span>
                          </div>
                          <div class="info-row price-row">
                            <mat-icon>euro</mat-icon>
                            <span class="price">{{ booking.totalPrice }}€</span>
                          </div>
                        </div>
                      </div>

                      <div class="booking-status">
                        <mat-chip [ngClass]="'chip-' + booking.status.toLowerCase()">
                          <mat-icon>{{ getBookingStatusIcon(booking.status) }}</mat-icon>
                          {{ getBookingStatusText(booking.status) }}
                        </mat-chip>
                      </div>
                    </mat-card-content>

                    <mat-card-actions>
                      <button mat-button [routerLink]="['/movies', booking.sessionCinema?.movie?.id]" *ngIf="booking.sessionCinema?.movie?.id">
                        <mat-icon>info</mat-icon>
                        Voir le film
                      </button>
                      <button mat-button (click)="showBookingDetails(booking)">
                        <mat-icon>receipt</mat-icon>
                        Détails
                      </button>
                    </mat-card-actions>
                  </mat-card>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Onglet Préférences -->
        <mat-tab label="Préférences">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Mes préférences</mat-card-title>
                <mat-card-subtitle>Personnalisez votre expérience cinéma</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="preferences-section">
                  <h3>Notifications</h3>
                  <mat-checkbox>Recevoir les notifications par email</mat-checkbox>
                  <mat-checkbox>Recevoir les offres promotionnelles</mat-checkbox>
                  <mat-checkbox>Recevoir les rappels de séances</mat-checkbox>
                </div>

                <mat-divider></mat-divider>

                <div class="preferences-section">
                  <h3>Cinéma favori</h3>
                  <mat-form-field appearance="outline">
                    <mat-label>Sélectionnez votre cinéma favori</mat-label>
                    <mat-select>
                      <mat-option value="none">Aucun cinéma favori</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <mat-card-actions>
                  <button mat-raised-button color="primary">
                    <mat-icon>save</mat-icon>
                    Sauvegarder les préférences
                  </button>
                </mat-card-actions>
              </mat-card-content>
            </mat-card>

            <!-- Section danger -->
            <mat-card class="danger-zone">
              <mat-card-header>
                <mat-card-title>Zone de danger</mat-card-title>
                <mat-card-subtitle>Actions irréversibles sur votre compte</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <button mat-stroked-button color="warn" (click)="confirmDeleteAccount()">
                  <mat-icon>delete_forever</mat-icon>
                  Supprimer mon compte
                </button>
                <p class="danger-text">
                  Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                </p>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>

    <div *ngIf="!currentUser" class="loading">
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      <p>Chargement de votre profil...</p>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .profile-header {
      margin-bottom: 20px;
      background: linear-gradient(135deg, #1a1a1a, #333);
      color: white;
    }

    .profile-info {
      display: flex;
      gap: 30px;
      align-items: center;
    }

    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }

    .user-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: #d32f2f;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      font-weight: bold;
      color: white;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    }

    .change-avatar-btn {
      color: rgba(255,255,255,0.8);
    }

    .user-details h1 {
      margin: 0 0 10px 0;
      font-size: 2rem;
    }

    .user-email {
      margin: 0 0 15px 0;
      opacity: 0.8;
      font-size: 1.1rem;
    }

    .role-chip {
      background: #d32f2f;
      color: white;
      margin-bottom: 10px;
    }

    .member-since {
      margin: 0;
      opacity: 0.7;
      font-size: 0.9rem;
    }

    .profile-tabs {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .tab-content {
      padding: 20px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .accessibility-section {
      margin: 20px 0;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .accessibility-section h3 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .password-card {
      margin-top: 20px;
    }

    .password-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }

    .bookings-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .booking-item {
      transition: all 0.3s;
    }

    .booking-item:hover {
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }

    .booking-avatar {
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .status-pending {
      background: #ff9800;
      color: white;
    }

    .status-validated {
      background: #4caf50;
      color: white;
    }

    .status-cancelled {
      background: #f44336;
      color: white;
    }

    .movie-link {
      color: inherit;
      text-decoration: none;
    }

    .movie-link:hover {
      color: #d32f2f;
      text-decoration: underline;
    }

    .booking-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 15px;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .info-row mat-icon {
      color: #666;
      font-size: 18px;
    }

    .price-row .price {
      font-weight: bold;
      color: #d32f2f;
      font-size: 16px;
    }

    .booking-status {
      margin-bottom: 10px;
    }

    .chip-pending {
      background: #fff3e0;
      color: #e65100;
    }

    .chip-validated {
      background: #e8f5e8;
      color: #2e7d2e;
    }

    .chip-cancelled {
      background: #ffebee;
      color: #c62828;
    }

    .preferences-section {
      margin: 20px 0;
    }

    .preferences-section h3 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .preferences-section mat-checkbox {
      display: block;
      margin-bottom: 10px;
    }

    .danger-zone {
      margin-top: 20px;
      border: 2px solid #f44336;
    }

    .danger-text {
      margin-top: 10px;
      color: #666;
      font-size: 14px;
    }

    .loading, .no-bookings {
      text-align: center;
      padding: 40px;
    }

    .no-bookings mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 20px;
    }

    .no-bookings h3 {
      color: #666;
      margin: 20px 0 10px 0;
    }

    .no-bookings p {
      color: #999;
      margin-bottom: 30px;
    }

    @media (max-width: 768px) {
      .profile-info {
        flex-direction: column;
        text-align: center;
      }

      .form-grid, .password-grid {
        grid-template-columns: 1fr;
      }

      .booking-details {
        grid-template-columns: 1fr;
        gap: 10px;
      }
    }
  `]
})
export class UserProfileNewComponent implements OnInit {
  currentUser: User | null = null;
  selectedTabIndex = 0;

  // Formulaires
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  // États de chargement
  isUpdatingProfile = false;
  isChangingPassword = false;
  loadingBookings = true;

  // Données
  userBookings: Booking[] = [];

  // Enums pour le template
  RegionsIso = RegionsIso;
  BookingStatus = BookingStatus;

  constructor(
    public userProfileService: UserProfileService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadUserProfile();
    this.loadUserBookings();
  }

  private initializeForms() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: [{value: '', disabled: true}],
      phoneNumber: [''],
      address: [''],
      city: [''],
      zipCode: [''],
      codeCountry: [''],
      hasDisability: [false]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    return null;
  }

  loadUserProfile() {
    this.userProfileService.getCurrentUserProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.populateProfileForm(user);
      },
      error: (error) => {
        console.error('Erreur lors du chargement du profil:', error);
        this.snackBar.open('Erreur lors du chargement du profil', 'Fermer', { duration: 3000 });
      }
    });
  }

  private populateProfileForm(user: User) {
    this.profileForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
      city: user.city || '',
      zipCode: user.zipCode || '',
      codeCountry: user.codeCountry || '',
      hasDisability: user.hasDisability || false
    });
  }

  updateProfile() {
    if (this.profileForm.invalid) return;

    this.isUpdatingProfile = true;
    const formData = this.profileForm.getRawValue();
    const updateData: UpdateUserProfileDto = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      city: formData.city,
      zipCode: formData.zipCode,
      codeCountry: formData.codeCountry,
      hasDisability: formData.hasDisability
    };

    this.userProfileService.updateProfile(updateData).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        this.isUpdatingProfile = false;
        this.snackBar.open('Profil mis à jour avec succès!', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        this.isUpdatingProfile = false;
        this.snackBar.open('Erreur lors de la mise à jour du profil', 'Fermer', { duration: 3000 });
      }
    });
  }

  resetProfileForm() {
    if (this.currentUser) {
      this.populateProfileForm(this.currentUser);
    }
  }

  changePassword() {
    if (this.passwordForm.invalid) return;

    this.isChangingPassword = true;
    const formData = this.passwordForm.value;
    const passwordData: ChangePasswordDto = {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword
    };

    this.userProfileService.changePassword(passwordData).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.passwordForm.reset();
        this.snackBar.open('Mot de passe modifié avec succès!', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Erreur lors du changement de mot de passe:', error);
        this.isChangingPassword = false;
        this.snackBar.open('Erreur lors du changement de mot de passe', 'Fermer', { duration: 3000 });
      }
    });
  }

  loadUserBookings() {
    this.loadingBookings = true;
    this.userProfileService.getUserBookingsHistory().subscribe({
      next: (bookings) => {
        this.userBookings = bookings.sort((a, b) =>
          new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
        );
        this.loadingBookings = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réservations:', error);
        this.loadingBookings = false;
        this.snackBar.open('Erreur lors du chargement des réservations', 'Fermer', { duration: 3000 });
      }
    });
  }

  getRoleDisplayName(role: RoleUser): string {
    const roles = {
      [RoleUser.CUSTOMER]: 'Client',
      [RoleUser.ADMIN]: 'Administrateur',
      [RoleUser.WORKER]: 'Employé'
    };
    return roles[role] || role;
  }

  getBookingStatusIcon(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.PENDING: return 'schedule';
      case BookingStatus.VALIDATED: return 'check_circle';
      case BookingStatus.CANCELLED: return 'cancel';
      default: return 'help';
    }
  }

  getBookingStatusText(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.PENDING: return 'En attente';
      case BookingStatus.VALIDATED: return 'Confirmée';
      case BookingStatus.CANCELLED: return 'Annulée';
      default: return 'Inconnu';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatDateTime(dateTime?: string): string {
    if (!dateTime) return 'Date non disponible';
    const date = new Date(dateTime);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatSeats(seats: any[]): string {
    return seats
      .map(seat => seat.seatNumber)
      .sort((a, b) => a - b)
      .join(', ');
  }

  showBookingDetails(booking: Booking) {
    const dialogRef = this.dialog.open(BookingDetailsDialogComponent, {
      width: '90vw',
      maxWidth: '800px',
      maxHeight: '90vh',
      data: booking,
      panelClass: 'booking-details-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      // Optionnel : traiter le résultat de la fermeture de la modale
    });
  }

  confirmDeleteAccount() {
    // TODO: Implémenter la confirmation de suppression de compte
    console.log('Confirmation de suppression de compte');
  }
}
