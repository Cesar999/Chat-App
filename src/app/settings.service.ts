import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { url_auth } from '../../urls_const';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  httpOptions;

  constructor(private http:  HttpClient, private cookieService: CookieService) { }

  changePassword(user: any) {
    return this.http.post(url_auth + '/change-password', user);
  }

  changeLanguage(user: any) {
    return this.http.post(url_auth + '/change-language', user);
  }
}
