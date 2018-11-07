import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  httpOptions;

  constructor(private http:  HttpClient, private cookieService: CookieService) {}

// -------------------AUTH SERVICE--------------------------------
  postLoginUser(user: any) {
     return this.http.post('http://localhost:3000/login', user);
  }

  postRegisterUser(user: any) {
    return this.http.post('http://localhost:3000/register', user);
 }


 checkAuth() {
  this.httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      'Authorization': 'jwt ' + this.cookieService.get('TOKEN')
    })
  };
  return this.http.get('http://localhost:3001/check-auth', this.httpOptions);
 }

 // --------------------------------------------------------------

 postAddContact(contact: any) {
  return this.http.post('http://localhost:3001/add-contact', contact);
  }

  getConversation(conv_id: any) {
    return this.http.post('http://localhost:3001/conversation-id', conv_id);
  }

 // ------------------------------------------------------------------

 deleteContact(data: any) {
  return this.http.post('http://localhost:3001/delete-contact', data);
}
// ----------------------------------------------------------
 createRoom(data: any) {
  return this.http.post('http://localhost:3001/create-room', data);
}

 getRooms(data: any) {
  return this.http.post('http://localhost:3001/get-rooms', data);
}

 leaveRoom(data: any) {
  return this.http.post('http://localhost:3001/leave-room', data);
}

}
