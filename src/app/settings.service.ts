import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  httpOptions;

  constructor(private http:  HttpClient, private cookieService: CookieService) { }

  changePassword(user: any) {
    return this.http.post('http://localhost:3000/change-password', user);
  }

  changeLanguage(user: any) {
    return this.http.post('http://localhost:3000/change-language', user);
  }
}
