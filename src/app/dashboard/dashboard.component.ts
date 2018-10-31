import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { WebsocketService } from '../websocket.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  mainUser: string;

  constructor(private router: Router, private cookieService: CookieService, private socket: WebsocketService) { }

  ngOnInit() {
    this.mainUser = localStorage.getItem('username');
    this.socket.emitOnline({username: this.mainUser});
    this.socket.listenList();
  }

onLogout() {
  this.cookieService.deleteAll();
  localStorage.clear();
  this.socket.disconnectSocket();
  this.router.navigate(['/login']);
}

}




