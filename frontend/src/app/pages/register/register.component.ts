import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppState } from '../../store/types';
import { Store } from '@ngrx/store';
import { RegisterError } from '../../models/user.model';
import { Observable, Subscription } from 'rxjs';
import { registerUserRequest } from '../../store/users.actions';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.sass']
})
export class RegisterComponent implements AfterViewInit, OnDestroy {
  @ViewChild('f') form!: NgForm;
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  error: Observable<null | RegisterError>;
  errorSub!: Subscription;
  loading: Observable<boolean>;

  constructor(private store: Store<AppState>) {
    this.error = store.select(state => state.users.registerError);
    this.loading = store.select(state => state.users.registerLoading);
  }

  ngAfterViewInit(): void {
    this.errorSub = this.error.subscribe(error => {
      if (error) {
        const msg = error.errors.email.message;
        this.form.form.get('email')?.setErrors({serverError: msg});
      } else {
        this.form.form.get('email')?.setErrors({});
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.store.dispatch(registerUserRequest({userData: this.form.value}));
    }
  }

  ngOnDestroy() {
    this.errorSub.unsubscribe();
  }
}
