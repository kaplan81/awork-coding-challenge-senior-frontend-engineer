/// <reference lib="webworker" />

import { GroupingRequest } from '../../models/grouping-request.model';
import { GroupingResponse } from '../../models/grouping-response.model';
import { groupUsers } from '../../utils/group-users/group-users.util';

addEventListener('message', (event: MessageEvent<GroupingRequest>) => {
  const { requestId, users, criterion } = event.data;
  const response: GroupingResponse = {
    requestId,
    groups: groupUsers(users, criterion),
  };
  postMessage(response);
});
