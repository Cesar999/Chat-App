import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class WebsocketService {
  socket;

  constructor() {
    this.socket = io('http://localhost:3001');
  }


// ---------------------------------------
  sendMsg(data) {
    this.socket.emit('chat message', data);
  }

  listenConv() {
    const observable = new Observable(observer => {
      this.socket.on('chat conversation', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }

  // -----------------------

  listenList() {
    const observable = new Observable(observer => {
     this.socket.on('list contacts', (data) => {
      observer.next(data);
      });
    });
    return observable;
  }

  // ----------------------------
  emitOnline(data) {
    this.socket.emit('user online', data);
  }

  disconnectSocket() {
    this.socket.emit('force disconnect');
  }

// ------------------------------
  onInvite(data) {
  this.socket.emit('on-invite', data);
  }

  listenInvited() {
    const observable = new Observable(observer => {
      this.socket.on('listen invited', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }
// ----------
  emitSeenMsg(data) {
    this.socket.emit('seen message', data);
  }

}
