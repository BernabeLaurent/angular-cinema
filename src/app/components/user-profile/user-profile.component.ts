import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Observable } from 'rxjs';

import { User } from '../../auth/user.interface';
import { UserRoleService } from '../../services/user-role.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  currentUser$: Observable<User | null>;
  userInitials$: Observable<string>;

  constructor(
    private userRoleService: UserRoleService,
    private authService: AuthService
  ) {
    this.currentUser$ = this.userRoleService.getCurrentUser();
    this.userInitials$ = this.userRoleService.getUserInitials();
  }

  ngOnInit(): void {}

  getRoleDisplayName(role: string): string {
    return this.userRoleService.getRoleDisplayName(role as any);
  }

  logout(): void {
    this.authService.logout();
  }
}