import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DashboardService } from '../dashboard.service';
import { WebsocketService } from 'src/app/websocket.service';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { CookieService } from 'ngx-cookie-service';

import * as moment from 'moment';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit, AfterViewChecked {
  messageForm: FormGroup;
  constructor(private dashboardService: DashboardService, private socket: WebsocketService, private appService: AppService,
    private router: Router, private cookieService: CookieService) { }

  mainUser: string;
  currentUser: any = 'none';
  currentConv: any;

  msg_arr: any;

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  ngOnInit() {
    this.mainUser = localStorage.getItem('username');

    this.messageForm = new FormGroup({
      'message': new FormControl(null, [Validators.required])
    });

    this.dashboardService.getContactListener().subscribe(
      (res) => {
        // this.test = `${this.mainUser} to ${res.username}`;
        if(res.hasOwnProperty('room')) {
          this.currentUser = res.room;
          const obj = {...res, conv_id: res._id};
          this.currentConv = obj.conv_id;
          this.getConversation(obj);
        }
        else{
          this.currentUser = res.username;
          this.currentConv = res.conv_id;
          this.getConversation(res);
        }
      }
    );

    this.socket.getConvListener().subscribe(
      (res) => {
        this.getConversation(res);
      }
    );

    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
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
            to: null,
            date: moment().format()
          };
            if(localStorage.getItem('flag')==='Rooms' ){
              data.to = this.currentUser;
              this.socket.sendMsg(data);
              this.messageForm.reset();
              this.socket.listenConv();
            }
            else{
              this.socket.sendMsg(data);
              this.messageForm.reset();
              this.socket.listenConv();
            }
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
        if(response.room!==null){
          this.currentUser = response.room;
        } else {
          for(let p of response.participants){
            if(p.username !== this.mainUser){
               this.currentUser = p.username;
            }
          }
        }
        this.msg_arr = response.messages;
      }
    );
  }

  scrollToBottom(): void {
    try {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

}
