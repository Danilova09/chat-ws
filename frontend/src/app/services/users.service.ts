import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginUserData, RegisterUserData, User } from '../models/user.model';
import { environment as env } from '../../environments/environment';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(private http: HttpClient) {
  }

  registerUser(registerUserData: RegisterUserData) {
    return this.http.post<User>(env.apiUrl + '/users', registerUserData).pipe(tap(user => {
      console.log(user);
    }));
  }

  login(loginUserData: LoginUserData) {
    return this.http.post<User>(env.apiUrl + '/users/sessions', loginUserData).pipe(tap(user => {
      console.log(user);
    }))
  }
}
