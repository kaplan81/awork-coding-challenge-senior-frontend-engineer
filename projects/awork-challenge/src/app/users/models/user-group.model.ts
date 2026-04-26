import { User } from './user.model';

export interface UserGroup {
  key: string;
  label: string;
  count: number;
  users: User[];
}
