import {RoleUser} from '../users/enums/roles-users.enum';
import {RegionsIso} from '../common/enums/regions-iso.enum';

export interface User {
  id: number;
  email: string;
  role: RoleUser;
  token: string;
  // Propriétés étendues du profil utilisateur
  firstName?: string;
  lastName?: string;
  googleId?: string;
  hasDisability?: boolean;
  roleUser?: RoleUser; // Alias pour role
  address?: string;
  city?: string;
  zipCode?: number;
  codeCountry?: RegionsIso;
  phoneNumber?: string;
  createDate?: string;
  updateDate?: string;
}
