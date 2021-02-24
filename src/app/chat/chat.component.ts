import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';
import {ChatService} from './shared/services/chat.service';
import {Observable, Subject, Subscription} from 'rxjs';
import {debounceTime, take, takeUntil} from 'rxjs/operators';
import {ChatClient} from './shared/models/chat-client.model';
import {ChatMessage} from './shared/models/chat-message.model';
import {Message} from '@angular/compiler/src/i18n/i18n_ast';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  messageFC = new FormControl('');
  nickNameFC = new FormControl('');
  messages: ChatMessage[] = [];
  clientsTyping: ChatClient[] = [];
  unsubscriber$ = new Subject();
  clients: string[] = [];
  chatClient: ChatClient | undefined;
  clients$: Observable<ChatClient[]> | undefined;
  error$: Observable<string> | undefined;
  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.clients$ = this.chatService.listenForClients();
    this.error$ = this.chatService.listenForErrors();
    this.messageFC.valueChanges
      .pipe(
        takeUntil(this.unsubscriber$),
        debounceTime(500)
      )
      .subscribe((value) => {
      this.chatService.sendTyping(value.length > 0);
    });
    this.chatService.listenForMessages()
      .pipe(
        takeUntil(this.unsubscriber$)
      )
      .subscribe(message => {
        console.log(message);
        this.messages.push(message);
    });
    this.chatService.listenForClientTyping()
      .pipe(
        takeUntil(this.unsubscriber$)
      )
      .subscribe((chatClient) => {
        if (chatClient.typing && !this.clientsTyping.find((c) => c.id === chatClient.id)) {
          this.clientsTyping.push(chatClient);
        } else {
          this.clientsTyping = this.clientsTyping.filter((c) => c.id !== chatClient.id)
        }
      });
    this.chatService.listenForWelcome()
      .pipe(
        takeUntil(this.unsubscriber$)
      )
      .subscribe(welcome => {
        this.messages = welcome.messages;
        this.chatClient = this.chatService.chatClient = welcome.client;
      });
    if (this.chatService.chatClient) {
      this.chatService.sendNickName(this.chatService.chatClient.nickName);
    }
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  sendMessage(): void {
    const messageData = this.messageFC.value;

    let date = new Date();
    date.setTime(date.getTime());

    const message: ChatMessage ={
      message: messageData,
      chatClient: this.chatService.chatClient,
      timestamp: new Date(date)
    }

    this.chatService.sendMessage(message);
    this.messageFC.patchValue('');
  }

  sendName(): void {
    // Remember to validate Name
    if (this.nickNameFC.value) {
      this.chatService.sendNickName(this.nickNameFC.value);
    }
  }
}
