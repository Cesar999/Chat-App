import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { WebsocketService } from '../websocket.service';
import { AppService } from '../app.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  mainUser: string;

  constructor(private router: Router, private cookieService: CookieService, private socket: WebsocketService,
    private appService: AppService) { }

  ngOnInit() {
 this.appService.checkAuth().subscribe(
      (response) => {
        // console.log(response, 'dashboard');
        if (response['authorization'] === true ) {
          this.mainUser = localStorage.getItem('username');
          this.socket.emitOnline({username: this.mainUser});
          this.socket.listenList();
          localStorage.setItem('flag', 'Rooms');
          localStorage.setItem('currentUser', 'none');
        } else {
          this.onLogout();
        }
      },
      (error) => {
        this.onLogout();
      }
    );
  }

onSettings() {
  this.router.navigate(['/settings']);
}

onLogout() {
  this.cookieService.deleteAll();
  const temp = localStorage.getItem('locale');
  localStorage.clear();
  // localStorage.setItem('locale', temp);
  this.socket.disconnectSocket();
  // this.router.navigate(['/login']);
  window.location.reload();
}

}




