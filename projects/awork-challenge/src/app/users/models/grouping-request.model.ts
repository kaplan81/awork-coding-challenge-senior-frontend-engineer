import { GroupingCriterionET } from '../enums/grouping-criterion.enum';
import { User } from './user.model';

export interface GroupingRequest {
  requestId: number;
  criterion: GroupingCriterionET;
  users: User[];
}
