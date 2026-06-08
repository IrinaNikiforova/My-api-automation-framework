export interface User {
  email: string;
  password: string;
  username: string;
}

export interface CreateUserRequest {
  user: User;
}