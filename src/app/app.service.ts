import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

const url_noty = 'http://localhost:3001';
const url_auth = 'http://localhost:3000';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  httpOptions;

  constructor(private http:  HttpClient, private cookieService: CookieService) {}

// -------------------AUTH SERVICE--------------------------------
  postLoginUser(user: any) {
     return this.http.post(url_auth + '/login', user);
  }

  postRegisterUser(user: any) {
    return this.http.post(url_auth + '/register', user);
 }

 checkAuth() {
  this.httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      'Authorization': 'jwt ' + this.cookieService.get('TOKEN')
    })
  };
  return this.http.get(url_noty + '/check-auth', this.httpOptions);
 }

 // --------------------------------------------------------------

 postAddContact(contact: any) {
  return this.http.post(url_noty + '/add-contact', contact);
  }

  getConversation(conv_id: any) {
    return this.http.post(url_noty + '/conversation-id', conv_id);
  }

 // ------------------------------------------------------------------

 deleteContact(data: any) {
  return this.http.post(url_noty + '/delete-contact', data);
}
// ----------------------------------------------------------
 createRoom(data: any) {
  return this.http.post(url_noty + '/create-room', data);
}

 getRooms(data: any) {
  return this.http.post(url_noty + '/get-rooms', data);
}

 leaveRoom(data: any) {
  return this.http.post(url_noty + '/leave-room', data);
}

}
