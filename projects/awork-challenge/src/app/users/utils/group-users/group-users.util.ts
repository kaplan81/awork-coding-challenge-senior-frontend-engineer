import { GroupingCriterionET } from '../../enums/grouping-criterion.enum';
import { AgeBucket } from '../../models/age-bucket.model';
import { UserGroup } from '../../models/user-group.model';
import { User } from '../../models/user.model';

const ageBuckets: AgeBucket[] = [
  { key: '00-under-18', label: 'Under 18', min: 0, max: 17 },
  { key: '01-18-24', label: '18 to 24', min: 18, max: 24 },
  { key: '02-25-34', label: '25 to 34', min: 25, max: 34 },
  { key: '03-35-44', label: '35 to 44', min: 35, max: 44 },
  { key: '04-45-54', label: '45 to 54', min: 45, max: 54 },
  { key: '05-55-64', label: '55 to 64', min: 55, max: 64 },
  { key: '06-65-plus', label: '65 and over', min: 65, max: Number.POSITIVE_INFINITY },
];

const genderLabels: Record<string, string> = {
  female: 'Female',
  male: 'Male',
  other: 'Other',
};

/**
 * Pure grouping function shared by the Web Worker and the synchronous fallback
 * used during tests / SSR. Sorts groups deterministically by `key` and users
 * within a group by `lastname`, then `firstname`.
 */
export function groupUsers(users: User[], criterion: GroupingCriterionET): UserGroup[] {
  const buckets: Map<string, { label: string; users: User[] }> = new Map();
  for (const user of users) {
    const { key, label } = resolveGroup(user, criterion);
    let bucket = buckets.get(key);
    if (bucket === undefined) {
      bucket = { label, users: [] };
      buckets.set(key, bucket);
    }
    bucket.users.push(user);
  }
  const groups: UserGroup[] = [];
  for (const [key, bucket] of buckets) {
    bucket.users.sort(compareUsersByName);
    groups.push({
      key,
      label: bucket.label,
      count: bucket.users.length,
      users: bucket.users,
    });
  }
  groups.sort((a: UserGroup, b: UserGroup) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return groups;
}

function resolveGroup(
  user: User,
  criterion: GroupingCriterionET,
): { key: string; label: string } {
  switch (criterion) {
    case 'alphabetical': {
      const initial: string =
        user.lastname.length > 0 ? user.lastname[0].toUpperCase() : '#';
      const isLetter: boolean = /^[A-Z]$/.test(initial);
      return isLetter ? { key: initial, label: initial } : { key: '#', label: '#' };
    }
    case 'age': {
      const bucket: AgeBucket | undefined = ageBuckets.find(
        (b: AgeBucket) => user.age >= b.min && user.age <= b.max,
      );
      return bucket !== undefined
        ? { key: bucket.key, label: bucket.label }
        : { key: '99-unknown', label: 'Unknown age' };
    }
    case 'nationality': {
      return { key: user.nat, label: user.nat };
    }
    case 'gender': {
      const normalised: string = user.gender.toLowerCase();
      const label: string = genderLabels[normalised] ?? 'Other';
      return { key: normalised, label };
    }
    default: {
      return { key: '#', label: '#' };
    }
  }
}

function compareUsersByName(a: User, b: User): number {
  const lastCmp: number = a.lastname.localeCompare(b.lastname);
  if (lastCmp !== 0) {
    return lastCmp;
  }
  return a.firstname.localeCompare(b.firstname);
}
