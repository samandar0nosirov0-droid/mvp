import { Role } from '@aidvokat/contracts';

export interface RequestUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  locale: 'ru' | 'uz';
}

export interface RequestWithUser {
  user: RequestUser;
}
