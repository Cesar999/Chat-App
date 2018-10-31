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

  constructor() {
    this.socket = io('http://localhost:3001');
  }

// ---------------------------------------
  sendMsg(msg) {
    this.socket.emit('test', msg);
  }

  listenMsg() {
    this.socket.on('test', (data) => {
      console.log(data);
    });
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


}
