import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';

import { UserApi } from '../../models/user-api.model';
import { UserDto } from '../../models/user-dto.model';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  static readonly apiUrl = 'https://randomuser.me/api';
  static readonly defaultPageSize = 5000;
  static readonly seed = 'awork';
  #http = inject(HttpClient);
  #cache = new Map<number, Observable<User[]>>();

  /**
   * Fetches a page of mock users from the API.
   *
   * Each page request is multicast and replayed for late subscribers via
   * `shareReplay({ bufferSize: 1, refCount: true })`, so re-entry into the
   * route or duplicate consumers never re-issue the network call.
   */
  getUsers(page: number = 1): Observable<User[]> {
    const cached: Observable<User[]> | undefined = this.#cache.get(page);
    if (cached !== undefined) {
      return cached;
    }
    const url: string =
      `${UserService.apiUrl}` +
      `?results=${UserService.defaultPageSize}` +
      `&seed=${UserService.seed}` +
      `&page=${page}`;
    const request$: Observable<User[]> = this.#http.get<UserApi>(url).pipe(
      map((apiResult: UserApi) => this.#mapUserApiResults(apiResult.results)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
    this.#cache.set(page, request$);
    return request$;
  }

  #mapUserApiResults(userApiResults: UserDto[]): User[] {
    return userApiResults.map((userDto: UserDto) => ({
      id: userDto.login.uuid,
      firstname: userDto.name.first,
      lastname: userDto.name.last,
      email: userDto.email,
      phone: userDto.phone,
      cell: userDto.cell,
      username: userDto.login.username,
      image: `${userDto.picture.medium}?id=${userDto.login.uuid}`,
      imageLarge: `${userDto.picture.large}?id=${userDto.login.uuid}`,
      nat: userDto.nat,
      gender: userDto.gender,
      age: userDto.dob.age,
      dob: userDto.dob.date,
      country: userDto.location.country,
      city: userDto.location.city,
      state: userDto.location.state,
      login: userDto.login,
    }));
  }
}
