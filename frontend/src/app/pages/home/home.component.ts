import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/types';
import { logoutUserRequest } from '../../store/users.actions';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { NgForm } from '@angular/forms';
import { ActiveUser, Message, ServerMessage } from '../../models/websocket.model';


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
  ws!: WebSocket;

  constructor(
    private store: Store<AppState>
  ) {
    this.user = store.select(state => state.users.user);
    this.user.subscribe(user => {
      this.token = user?.token;
    });
  }

  ngOnInit(): void {
    this.ws = new WebSocket('ws://localhost:8000/messages');
    this.ws.onclose = () => console.log('ws closed');

    this.ws.onopen = event => {
      this.ws.send(JSON.stringify({
        type: 'LOGIN',
        token: this.token,
      }));
    };

    this.ws.onmessage = (event) => {
      const decodedMessage: ServerMessage = JSON.parse(event.data);

      if (decodedMessage.type === 'PREV_CHAT_DATA') {
        this.messages = decodedMessage.messages;
        this.activeUsers = decodedMessage.activeUsers;
      }

      if (decodedMessage.type === 'ACTIVE_USERS_CHANGED') {
        this.activeUsers = decodedMessage.activeUsers;
      }

      if (decodedMessage.type === 'NEW_MESSAGE') {
        this.messages.push(decodedMessage.message);
      }
    };
  }

  onSubmit() {
    if (this.form.valid) {
      this.ws.send(JSON.stringify({
        type: 'SEND_MESSAGE',
        message: {
          text: this.form.controls['message'].value,
        }
      }));
    }
  }

  logout() {
    this.store.dispatch(logoutUserRequest());
  }

  ngOnDestroy(): void {
    this.ws.close();
  }
}
