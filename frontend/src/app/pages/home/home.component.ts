import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/types';
import { logoutUserRequest } from '../../store/users.actions';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {
  @ViewChild('f') form!: NgForm;
  user!: Observable<null | User>;

  constructor(
    private store: Store<AppState>
  ) {
    this.user = store.select(state => state.users.user);
  }

  ngOnInit(): void {
  }

  logout() {
    this.store.dispatch(logoutUserRequest());
  }

  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}
