import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChangeDetectorRef } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { UsersManagementComponent } from './users-management.component';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../auth/auth.service';
import { DateFormatService } from '../../../services/date-format.service';
import { User } from '../../../auth/user.interface';
import { CreateUserDto } from '../../../users/dtos/create-user.dto';
import { RoleUser } from '../../../users/enums/roles-users.enum';
import { UserFormDialogComponent } from '../user-form-dialog/user-form-dialog.component';

describe('UsersManagementComponent', () => {
  let component: UsersManagementComponent;
  let fixture: ComponentFixture<UsersManagementComponent>;
  let mockAdminService: jasmine.SpyObj<AdminService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockDateFormatService: jasmine.SpyObj<DateFormatService>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;

  const mockUsers: User[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      roleUser: RoleUser.ADMIN,
      createDate: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      roleUser: RoleUser.CUSTOMER,
      createDate: '2024-01-02T00:00:00Z'
    },
    {
      id: 3,
      firstName: 'Bob',
      lastName: 'Worker',
      email: 'bob.worker@example.com',
      roleUser: RoleUser.WORKER,
      createDate: '2024-01-03T00:00:00Z'
    }
  ];

  const mockCreateUserDto: CreateUserDto = {
    firstName: 'New',
    lastName: 'User',
    email: 'new.user@example.com',
    password: 'password123',
    roleUser: RoleUser.CUSTOMER
  };

  beforeEach(async () => {
    const adminServiceSpy = jasmine.createSpyObj('AdminService', [
      'getAllUsers', 'createUser', 'updateUser', 'deleteUser'
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['forceInitFromToken']);

    // Mock par défaut pour DialogRef
    const defaultDialogRef = {
      afterClosed: () => of(null),
      close: jasmine.createSpy('close')
    };

    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'getDialogById', 'closeAll'], {
      openDialogs: []
    });

    // Mock par défaut qui peut être remplacé dans les tests individuels
    dialogSpy.open.and.returnValue(defaultDialogRef);

    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const dateFormatServiceSpy = jasmine.createSpyObj('DateFormatService', ['formatDate']);
    const cdrSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    await TestBed.configureTestingModule({
      imports: [UsersManagementComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: DateFormatService, useValue: dateFormatServiceSpy },
        { provide: ChangeDetectorRef, useValue: cdrSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersManagementComponent);
    component = fixture.componentInstance;
    mockAdminService = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    mockDateFormatService = TestBed.inject(DateFormatService) as jasmine.SpyObj<DateFormatService>;
    mockChangeDetectorRef = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;

    // Reset des spies avant chaque test
    mockSnackBar.open.calls.reset();

    mockAdminService.getAllUsers.and.returnValue(of(mockUsers));
    mockDateFormatService.formatDate.and.returnValue('01/01/2024');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.allUsers).toEqual([]);
    expect(component.displayedColumns).toEqual(['id', 'name', 'email', 'role', 'createDate', 'actions']);
    expect(component.loading).toBeFalse();
    expect(component.searchTerm).toBe('');
    expect(component.selectedRole).toBe('');
    expect(component.roles).toEqual(Object.values(RoleUser));
  });

  it('should initialize auth service and load users on init', fakeAsync(() => {
    spyOn(component, 'loadUsers');

    component.ngOnInit();

    expect(mockAuthService.forceInitFromToken).toHaveBeenCalled();

    tick(100);

    expect(component.loadUsers).toHaveBeenCalled();
  }));

  it('should load users successfully', () => {
    component.loadUsers();

    expect(mockAdminService.getAllUsers).toHaveBeenCalled();
    expect(component.allUsers).toEqual(mockUsers);
    expect(component.loading).toBeFalse();
  });

  it('should handle error when loading users', () => {
    mockAdminService.getAllUsers.and.returnValue(throwError('Load error'));
    spyOn(component as any, 'showError');

    component.loadUsers();

    expect(component.loading).toBeFalse();
    expect((component as any).showError).toHaveBeenCalledWith('Erreur lors du chargement des utilisateurs');
  });

  it('should open create user dialog', () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(of(mockCreateUserDto));
    mockDialog.open.and.returnValue(dialogRefSpy);
    spyOn(component, 'createUser');

    component.openCreateUserDialog();

    expect(mockDialog.open).toHaveBeenCalledWith(UserFormDialogComponent, {
      width: '600px',
      data: { mode: 'create' }
    });
    expect(component.createUser).toHaveBeenCalledWith(mockCreateUserDto);
  });

  it('should not create user if dialog is cancelled', () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(of(null));
    mockDialog.open.and.returnValue(dialogRefSpy);
    spyOn(component, 'createUser');

    component.openCreateUserDialog();

    expect(component.createUser).not.toHaveBeenCalled();
  });

  it('should open edit user dialog', () => {
    const userToEdit = mockUsers[0];
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(of(mockCreateUserDto));
    mockDialog.open.and.returnValue(dialogRefSpy);
    spyOn(component, 'updateUser');

    component.openEditUserDialog(userToEdit);

    expect(mockDialog.open).toHaveBeenCalledWith(UserFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', user: userToEdit }
    });
  });

  it('should create user successfully', () => {
    const mockNewUser: User = {
      id: 4,
      firstName: mockCreateUserDto.firstName,
      lastName: mockCreateUserDto.lastName,
      email: mockCreateUserDto.email,
      roleUser: mockCreateUserDto.roleUser
    };
    mockAdminService.createUser.and.returnValue(of(mockNewUser));
    spyOn(component as any, 'showSuccess');
    spyOn(component, 'loadUsers');

    component.createUser(mockCreateUserDto);

    expect(mockAdminService.createUser).toHaveBeenCalledWith(mockCreateUserDto);
    expect((component as any).showSuccess).toHaveBeenCalledWith('Utilisateur créé avec succès');
    expect(component.loadUsers).toHaveBeenCalled();
  });

  it('should handle error when creating user', () => {
    mockAdminService.createUser.and.returnValue(throwError('Create error'));
    spyOn(component as any, 'showError');

    component.createUser(mockCreateUserDto);

    expect((component as any).showError).toHaveBeenCalledWith('Erreur lors de la création de l\'utilisateur');
  });

  it('should update user successfully', () => {
    const userId = 1;
    const updateData = { firstName: 'Updated' };
    const mockUpdatedUser: User = { id: userId, firstName: 'Updated', email: 'test@test.com' };
    mockAdminService.updateUser.and.returnValue(of(mockUpdatedUser));
    spyOn(component as any, 'showSuccess');
    spyOn(component, 'loadUsers');

    component.updateUser(userId, updateData);

    expect(mockAdminService.updateUser).toHaveBeenCalledWith(userId, updateData);
    expect((component as any).showSuccess).toHaveBeenCalledWith('Utilisateur modifié avec succès');
    expect(component.loadUsers).toHaveBeenCalled();
  });

  it('should handle error when updating user', () => {
    const userId = 1;
    const updateData = { firstName: 'Updated' };
    mockAdminService.updateUser.and.returnValue(throwError('Update error'));
    spyOn(component as any, 'showError');

    component.updateUser(userId, updateData);

    expect((component as any).showError).toHaveBeenCalledWith('Erreur lors de la modification de l\'utilisateur');
  });

  it('should delete user when confirmed', () => {
    const userToDelete = mockUsers[0];
    spyOn(window, 'confirm').and.returnValue(true);
    mockAdminService.deleteUser.and.returnValue(of({}));
    spyOn(component as any, 'showSuccess');
    spyOn(component, 'loadUsers');

    component.deleteUser(userToDelete);

    expect(window.confirm).toHaveBeenCalledWith(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userToDelete.email} ?`);
    expect(mockAdminService.deleteUser).toHaveBeenCalledWith(userToDelete.id);
    expect((component as any).showSuccess).toHaveBeenCalledWith('Utilisateur supprimé avec succès');
    expect(component.loadUsers).toHaveBeenCalled();
  });

  it('should not delete user when not confirmed', () => {
    const userToDelete = mockUsers[0];
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteUser(userToDelete);

    expect(mockAdminService.deleteUser).not.toHaveBeenCalled();
  });

  it('should handle error when deleting user', () => {
    const userToDelete = mockUsers[0];
    spyOn(window, 'confirm').and.returnValue(true);
    mockAdminService.deleteUser.and.returnValue(throwError('Delete error'));
    spyOn(component as any, 'showError');

    component.deleteUser(userToDelete);

    expect((component as any).showError).toHaveBeenCalledWith('Erreur lors de la suppression de l\'utilisateur');
  });

  it('should get correct role display names', () => {
    expect(component.getRoleDisplayName(RoleUser.ADMIN)).toBe('Administrateur');
    expect(component.getRoleDisplayName(RoleUser.WORKER)).toBe('Employé');
    expect(component.getRoleDisplayName(RoleUser.CUSTOMER)).toBe('Client');
  });

  it('should get correct role colors', () => {
    expect(component.getRoleColor(RoleUser.ADMIN)).toBe('warn');
    expect(component.getRoleColor(RoleUser.WORKER)).toBe('accent');
    expect(component.getRoleColor(RoleUser.CUSTOMER)).toBe('primary');
  });

  it('should format date using date format service', () => {
    const testDate = '2024-01-01T00:00:00Z';

    component.formatDate(testDate);

    expect(mockDateFormatService.formatDate).toHaveBeenCalledWith(testDate);
  });

  it('should apply search filter correctly', () => {
    component.allUsers = mockUsers;
    component.searchTerm = 'john';

    component.applyFilter();

    component.users$.subscribe(users => {
      expect(users.length).toBe(1);
      expect(users[0].firstName).toBe('John');
    });
  });

  it('should apply role filter correctly', () => {
    component.allUsers = mockUsers;
    component.selectedRole = RoleUser.ADMIN;

    component.applyFilter();

    component.users$.subscribe(users => {
      expect(users.length).toBe(1);
      expect(users[0].roleUser).toBe(RoleUser.ADMIN);
    });
  });

  it('should apply both search and role filters', () => {
    component.allUsers = mockUsers;
    component.searchTerm = 'jane';
    component.selectedRole = RoleUser.CUSTOMER;

    component.applyFilter();

    component.users$.subscribe(users => {
      expect(users.length).toBe(1);
      expect(users[0].firstName).toBe('Jane');
      expect(users[0].roleUser).toBe(RoleUser.CUSTOMER);
    });
  });

  it('should return all users when no filters applied', () => {
    component.allUsers = mockUsers;
    component.searchTerm = '';
    component.selectedRole = '';

    component.applyFilter();

    component.users$.subscribe(users => {
      expect(users.length).toBe(mockUsers.length);
    });
  });

  it('should search in firstName, lastName, and email', () => {
    component.allUsers = mockUsers;
    component.searchTerm = 'doe';

    component.applyFilter();

    component.users$.subscribe(users => {
      expect(users.length).toBe(1);
      expect(users[0].lastName).toBe('Doe');
    });
  });

  it('should clear filters', () => {
    component.searchTerm = 'test';
    component.selectedRole = RoleUser.ADMIN;
    spyOn(component, 'applyFilter');

    component.clearFilters();

    expect(component.searchTerm).toBe('');
    expect(component.selectedRole).toBe('');
    expect(component.applyFilter).toHaveBeenCalled();
  });

  it('should show success message', () => {
    const message = 'Test success';

    component['showSuccess'](message);

    expect(mockSnackBar.open).toHaveBeenCalledWith(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  });

  it('should show error message', () => {
    const message = 'Test error';

    component['showError'](message);

    expect(mockSnackBar.open).toHaveBeenCalledWith(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  });
});