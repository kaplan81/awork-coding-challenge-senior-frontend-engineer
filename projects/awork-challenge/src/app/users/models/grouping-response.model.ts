import { UserGroup } from './user-group.model';

export interface GroupingResponse {
  requestId: number;
  groups: UserGroup[];
}
