import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class WebsocketService {
  socket;
  public list = new Subject<any>();
  public list$ = this.list.asObservable();

  public conv = new Subject<any>();
  public conv$ = this.conv.asObservable();

  public invited = new Subject<any>();
  public invited$ = this.invited.asObservable();

  constructor() {
    this.socket = io('http://localhost:3001');
  }

// ---------------------------------------
  sendMsg(data) {
    this.socket.emit('chat message', data);
  }

  listenConv() {
    this.socket.on('chat conversation', (data) => {
      this.conv.next(data);
    });
  }

  getConvListener() {
    return this.conv$;
  }

  // -----------------------

  listenList() {
    this.socket.on('list contacts', (data) => {
      this.list.next(data);
    });
  }

  getListListener() {
    return this.list$;
  }

  // ----------------------------
  emitOnline(data) {
    this.socket.emit('user online', data);
  }

  disconnectSocket() {
    this.socket.emit('force disconnect');
  }

// -------
  onInvite(data) {
  this.socket.emit('on-invite', data);
  }

  listenInvited() {
    this.socket.on('listen invited', (data) => {
      this.invited.next(data);
    });
  }

  getInvitedListener() {
    return this.invited$;
  }

}
