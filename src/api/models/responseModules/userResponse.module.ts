export interface UserResponse {
  user: User;
}

export interface User {
  id: number;
  email: string;
  username: string;
  bio: string | null;
  image: string;
  token: string;
}