import { UserDto } from './user-dto.model';

export interface UserApi {
  results: UserDto[];
  info: UserApiInfo;
}

export interface UserApiInfo {
  seed: string;
  results: number;
  page: number;
}
