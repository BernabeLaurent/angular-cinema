import {RoleUser} from '../users/enums/roles-users.enum';

export interface User {
  id: number;
  email: string;
  role: RoleUser;
  token: string;
}
