import { Injectable } from '@angular/core';
import { environment as env } from '../../environments/environment';
import { ActiveUser, Message } from '../models/websocket.model';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  messages: Message[] = [];
  activeUsers: ActiveUser[] = [];
  messagesChange = new Subject<Message[]>();
  activeUsersChange = new Subject<ActiveUser[]>();
  ws!: WebSocket;

  openWebSocket(usersToken: undefined | string) {
    this.ws = new WebSocket(env.webSocketApiUrl);
    this.ws.onopen = (event) => {
      this.ws.send(JSON.stringify({
        type: 'LOGIN',
        token: usersToken,
      }));
    };

    this.ws.onclose = (event) => {
      setTimeout(() => {
        this.ws.send(JSON.stringify({
          type: 'LOGIN',
          token: usersToken,
        }));
      }, 3000);
    };

    this.ws.onmessage = (event) => {
      const decodedMessage = JSON.parse(event.data);

      if (decodedMessage.type === 'PREV_CHAT_DATA') {
        this.messages = decodedMessage.messages;
        this.activeUsers = decodedMessage.activeUsers;
        this.messagesChange.next(this.messages);
      }

      if (decodedMessage.type === 'ACTIVE_USERS_CHANGED') {
        this.activeUsers = decodedMessage.activeUsers;
        this.activeUsersChange.next(this.activeUsers);
      }

      if (decodedMessage.type === 'NEW_MESSAGE') {
        this.messages.push(decodedMessage.message);
        this.messagesChange.next(this.messages);
      }
    };
  }

  sendMessage(text: string) {
    this.ws.send(JSON.stringify({
      type: 'SEND_MESSAGE',
      message: {
        text,
      }
    }));
  }

  closeWebSocket() {
    this.ws.close();
  }
}

