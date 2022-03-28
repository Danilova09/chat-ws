import { LoginError, RegisterError, User } from '../models/user.model';

export type UsersState = {
  user: null | User,
  registerLoading: boolean,
  registerError: null | RegisterError,
  loginLoading: boolean,
  loginError: null | LoginError,
}

export type AppState = {
  users: UsersState,
}
