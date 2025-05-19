import { RoleUser} from '../enums/roles-users.enum';
import { RegionsIso} from '../../common/enums/regions-iso.enum';

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  hasDisability?: boolean;
  roleUser: RoleUser;
  address?: string;
  city?: string;
  zipCode?: string;
  codeCountry?: RegionsIso;
  phoneNumber?: string;
  googleId?: string;
}
