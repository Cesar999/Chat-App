import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class AuthService {

  constructor(private cookieService: CookieService) {}

  // ...
  public isAuthenticated(): boolean {
    const myRawToken = this.cookieService.get('TOKEN');
    const helper = new JwtHelperService();
    // Check whether the token is expired and return
    // true or false
    return !helper.isTokenExpired(myRawToken);
  }

}
