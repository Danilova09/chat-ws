import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UsersService } from '../services/users.service';
import {
  loginUserFailure,
  loginUserRequest,
  loginUserSuccess,
  registerUserFailure,
  registerUserRequest,
  registerUserSuccess
} from './users.actions';
import { catchError, map, mergeMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { HelpersService } from '../services/helpers.service';
import { Injectable } from '@angular/core';

@Injectable()
export class UsersEffects {
  constructor(
    private actions: Actions,
    private usersService: UsersService,
    private router: Router,
    private helpers: HelpersService,
  ) {
  }


  registerUser = createEffect(() => this.actions.pipe(
    ofType(registerUserRequest),
    mergeMap(({userData}) => this.usersService.registerUser(userData).pipe(
      map(user => registerUserSuccess({user})),
      tap(() => {
        void this.router.navigate(['/home']);
        this.helpers.openSnackbar('Register successful');
      }),
      this.helpers.catchServerError(registerUserFailure)
    ))
  ));

  loginUser = createEffect(() => this.actions.pipe(
    ofType(loginUserRequest),
    mergeMap(({userData}) => this.usersService.login(userData).pipe(
      map((user) => loginUserSuccess({user})),
      tap(() => {
        void this.router.navigate(['/home']);
        this.helpers.openSnackbar('Login successful');
      }),
      this.helpers.catchServerError(loginUserFailure)
    ))
  ));
}
