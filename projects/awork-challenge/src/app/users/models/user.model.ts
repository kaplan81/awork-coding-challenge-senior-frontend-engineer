export interface User {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  image: string;
  nat: string;
  login: UserLogin;
}

export interface UserLogin {
  uuid: string;
  username: string;
  password: string;
  salt: string;
  md5: string;
  sha1: string;
  sha256: string;
}
