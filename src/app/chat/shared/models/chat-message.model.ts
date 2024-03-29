import { ChatClient } from './chat-client.model';

export interface ChatMessage {
  message: string;
  chatClient: ChatClient;
  timestamp: Date;
}
