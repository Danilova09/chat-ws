import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { AppState } from '../store/types';
import { Store } from '@ngrx/store';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardService implements CanActivate {
  user!: Observable<null | User>;

  constructor(
    private store: Store<AppState>,
    private router: Router,
  ) {
    this.user = store.select(state => state.users.user);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const roles: string[] = route.data['roles'];

    return this.user.pipe(
      map(user => {
        if (user && roles.includes(user.role)) {
          return true;
        }

        void this.router.navigate(['/']);
        return false;
      })
    );
  }
}
