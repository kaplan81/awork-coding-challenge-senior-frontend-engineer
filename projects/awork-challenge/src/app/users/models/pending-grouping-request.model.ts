import { UserGroup } from './user-group.model';

export interface PendingGroupingRequest {
  resolve: (groups: UserGroup[]) => void;
  reject: (reason: unknown) => void;
}
