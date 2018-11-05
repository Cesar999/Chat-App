import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DashboardService } from '../dashboard.service';
import { WebsocketService } from 'src/app/websocket.service';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {
  messageForm: FormGroup;
  constructor(private dashboardService: DashboardService, private socket: WebsocketService, private appService: AppService,
    private router: Router, private cookieService: CookieService) { }
  test: any;

  mainUser: string;
  currentUser: any;
  currentConv: any;

  msg_arr: any;

  ngOnInit() {
    this.mainUser = localStorage.getItem('username');

    this.messageForm = new FormGroup({
      'message': new FormControl(null, [Validators.required])
    });

    this.dashboardService.getContactListener().subscribe(
      (res) => {
        this.test = `${res.username} : ${res.conv_id}`;
        this.currentUser = res.username;
        this.currentConv = res.conv_id;
        this.getConversation(res);
      }
    );
  }

  onSend() {
    // this.test = JSON.stringify(this.dashboardService.getList());
    this.appService.checkAuth().subscribe(
     (response) => {
        if (response['authorization'] === true ) {
          const data = {
            msg: this.messageForm.value.message,
            conv_id: this.currentConv,
            author: this.mainUser,
            to: this.currentUser
          };
          // console.log(data);
          this.socket.sendMsg(data);
          this.messageForm.reset();
          // this.getConversation(data);
        } else {
        }
      },
      (error) => {
        this.logOut();
      }
    );
  }


  logOut() {
    console.log('unauthorized');
    this.cookieService.deleteAll();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  getConversation(c) {
    // console.log(c);
    this.appService.getConversation({_id: c.conv_id}).subscribe(
      (response: any) => {
        console.log(response);
        this.msg_arr = response.messages;
      }
    );
  }

}
