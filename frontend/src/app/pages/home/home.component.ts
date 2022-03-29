import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/types';
import { logoutUserRequest } from '../../store/users.actions';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { NgForm } from '@angular/forms';


interface ActiveUser {
  token: string,
  user: User,
}

interface Message {
  username: string,
  text: string,
}

interface ServerMessage {
  type: string,
  messages: Message[];
  activeConnections: any,
  activeUsers: ActiveUser[],
  message: Message,
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('f') form!: NgForm;
  username!: undefined | string;
  token!: undefined | string;
  user!: Observable<null | User>;
  ws!: WebSocket;
  messages: Message[] = [];
  activeUsers: ActiveUser[] = [];

  constructor(
    private store: Store<AppState>
  ) {
    this.user = store.select(state => state.users.user);
    this.user.subscribe(user => {
      this.token = user?.token;
      this.username = user?.displayName;
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
    }

    this.ws.onmessage = (event) => {
      const decodedMessage: ServerMessage = JSON.parse(event.data);

      if (decodedMessage.type === 'NEW_USER') {
        this.activeUsers = decodedMessage.activeUsers;
      }

      if (decodedMessage.type === 'PREV_MESSAGES') {
        this.messages = decodedMessage.messages;
      }


      if (decodedMessage.type === 'NEW_MESSAGE') {
        this.messages.push(decodedMessage.message);
      }
    }
  }

  logout() {
    this.store.dispatch(logoutUserRequest());
  }

  onSubmit() {
    if (this.form.valid) {
      this.ws.send(JSON.stringify({
        type: 'SEND_MESSAGE',
        message: {
          username: this.username,
          text: this.form.controls['message'].value,
        }
      }));
    }
  }

  ngOnDestroy(): void {
    this.ws.close();
  }
}
