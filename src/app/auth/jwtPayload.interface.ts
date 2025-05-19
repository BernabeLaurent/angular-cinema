import {RoleUser} from '../users/enums/roles-users.enum';

export interface JwtPayload {
  sub: number;
  roleUser: RoleUser;
  email: string;
  exp: number;
  iat: number;
}
