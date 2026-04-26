import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { UserApi } from '../../models/user-api.model';
import { UserDto } from '../../models/user-dto.model';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  static readonly apiUrl = 'https://randomuser.me/api';
  readonly #http = inject(HttpClient);

  /**
   * Fetches 5000 mock users from the api
   */
  getUsers(page = 1): Observable<User[]> {
    return this.#http
      .get<UserApi>(`${UserService.apiUrl}?results=5000&seed=awork&page=${page}`)
      .pipe(map((apiResult: UserApi) => this.#mapUserApiResults(apiResult.results)));
  }

  #mapUserApiResults(userApiResults: UserDto[]): User[] {
    return userApiResults.map((userDto: UserDto) => ({
      firstname: userDto.name.first,
      lastname: userDto.name.last,
      email: userDto.email,
      phone: userDto.phone,
      image: userDto.picture.medium,
      nat: userDto.nat,
      login: userDto.login,
    }));
  }
}
