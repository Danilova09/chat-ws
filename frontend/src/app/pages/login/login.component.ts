import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/types';
import { loginUserRequest } from '../../store/users.actions';
import { Observable } from 'rxjs';
import { LoginError } from '../../models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {
  @ViewChild('f') form!: NgForm;
  hide: boolean = true;
  loading!: Observable<boolean>;
  error!: Observable<null | LoginError>;

  constructor(
    private store: Store<AppState>
  ) {
    this.loading = store.select(state => state.users.loginLoading);
    this.error = store.select(state => state.users.loginError);
  }

  ngOnInit(): void {
  }

  onSubmit() {
    if (this.form.valid) {
      const userData = this.form.value;
      this.store.dispatch(loginUserRequest({userData}));
    }
  }
}
