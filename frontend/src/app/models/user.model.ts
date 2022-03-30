export interface RegisterUserData {
  displayName: string,
  email: string,
  password: string,
}

export interface FieldError {
  message: string;
}

export interface RegisterError {
  errors: {
    password: FieldError,
    email: FieldError,
  };
}

export interface LoginUserData {
  email: string,
  password: string,
}

export interface LoginError {
  error: string,
}

export interface User {
  _id: string,
  displayName: string,
  email: string,
  token: string,
  role: string,
}
