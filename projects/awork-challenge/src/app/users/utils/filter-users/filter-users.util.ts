import { User } from '../../models/user.model';

/**
 * Pure case-insensitive search across the most user-recognisable fields.
 *
 * The empty-term case returns the input array reference unchanged so signals
 * can shallow-equality-bail-out and the worker doesn't get re-triggered.
 */
export function filterUsers(users: User[], term: string): User[] {
  const trimmed: string = term.trim().toLowerCase();
  if (trimmed.length === 0) {
    return users;
  }
  return users.filter((user: User) => doesUserMatch(user, trimmed));
}

function doesUserMatch(user: User, term: string): boolean {
  return (
    user.firstname.toLowerCase().includes(term) ||
    user.lastname.toLowerCase().includes(term) ||
    user.email.toLowerCase().includes(term) ||
    user.username.toLowerCase().includes(term) ||
    user.nat.toLowerCase().includes(term) ||
    user.country.toLowerCase().includes(term)
  );
}
