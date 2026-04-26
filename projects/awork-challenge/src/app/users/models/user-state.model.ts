export interface UserState {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  image: string;
  nat: string;
  login: UserStateLogin;
}

export interface UserStateLogin {
  uuid: string;
  username: string;
  password: string;
  salt: string;
  md5: string;
  sha1: string;
  sha256: string;
}
