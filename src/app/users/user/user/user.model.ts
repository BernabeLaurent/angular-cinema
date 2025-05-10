import {RoleUser} from '../../enums/roles-users.enum';
import {RegionsIso} from '../../../common/enums/regions-iso.enum';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  hasDisability: boolean;
  roleUser: RoleUser;
  address?: string;
  city?: string;
  zipCode?: number;
  codeCountry?: RegionsIso;
  phoneNumber?: string;
  googleId?: string;
  createDate: Date;
  updateDate: Date;
}
