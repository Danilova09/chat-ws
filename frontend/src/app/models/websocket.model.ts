import { User } from './user.model';

export interface ActiveUser {
  user: User,
}

export interface Message {
  text: string,
  author: User,
}

export interface ServerMessage {
  type: string,
  messages: Message[];
  activeUsers: ActiveUser[],
  message: Message,
}
