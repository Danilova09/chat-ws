import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/types';
import { logoutUserRequest } from '../../store/users.actions';
import { Observable, Subscription } from 'rxjs';
import { User } from '../../models/user.model';
import { NgForm } from '@angular/forms';
import { ActiveUser, Message } from '../../models/websocket.model';
import { WebSocketService } from '../../services/web-socket.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('f') form!: NgForm;
  token!: undefined | string;
  user!: Observable<null | User>;
  messages: Message[] = [];
  activeUsers: ActiveUser[] = [];
  messagesSub!: Subscription;
  activeUsersSub!: Subscription;

  constructor(
    private store: Store<AppState>,
    private webSocketService: WebSocketService,
  ) {
    this.user = store.select(state => state.users.user);
    this.user.subscribe(user => {
      this.token = user?.token;
    });
  }

  ngOnInit(): void {
    this.webSocketService.openWebSocket(this.token);
    this.webSocketService.messagesChange.subscribe((messages: Message[]) => {
      this.messages = messages;
    });
    this.webSocketService.activeUsersChange.subscribe((users: ActiveUser[]) => {
      this.activeUsers = users;
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const text = this.form.controls['message'].value;
      this.webSocketService.sendMessage(text);
    }
  }

  logout() {
    this.store.dispatch(logoutUserRequest());
  }

  ngOnDestroy(): void {
    this.webSocketService.closeWebSocket();
    this.messagesSub.unsubscribe();
    this.activeUsersSub.unsubscribe();
  }
}
