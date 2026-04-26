export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  cell: string;
  username: string;
  image: string;
  imageLarge: string;
  nat: string;
  gender: string;
  age: number;
  dob: string;
  country: string;
  city: string;
  state: string;
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
