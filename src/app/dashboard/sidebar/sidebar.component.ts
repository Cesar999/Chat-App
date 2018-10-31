import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { WebsocketService } from 'src/app/websocket.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  contactForm: FormGroup;
  msg: string;
  show_msg: boolean;
  contactlist: any;
  status: false;

  constructor(private appService: AppService, private router: Router, private cookieService: CookieService,
  private socket: WebsocketService) { }

  ngOnInit() {
    this.contactForm = new FormGroup({
      'contact': new FormControl(null, [Validators.required])
    });

    this.socket.getListListener().subscribe(data => {
      console.log(data);
      this.contactlist = data;
    });
  }

  logOut() {
    console.log('unauthorized');
    this.cookieService.deleteAll();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  onAdd() {
    const contact = this.contactForm.value;

    this.appService.checkAuth().subscribe(
      (response) => {
        if (response['authorization'] === true ) {
            this.addContact(contact);
        } else {
        }
      },
      (error) => {
        // console.log(error);
        this.logOut();
      }
    );
    this.contactForm.reset();
  }

  addContact(contact) {
    const mainUser = localStorage.getItem('username');
    const obj = {contact: contact.contact, mainUser: mainUser};
    this.appService.postAddContact(obj).subscribe(
      (response) => {
        console.log(response);
        this.msg = response['msg'];
        this.show_msg = true;
        setTimeout(() => {
          this.show_msg = false;
        }, 2000);
      },
      (error) => {

      }
    );
  }

  onClick(c) {
    this.appService.checkAuth().subscribe(
      (response) => {
        if (response['authorization'] === true ) {
          this.getConversation(c);
        } else {
        }
      },
      (error) => {
        this.logOut();
      }
    );

  }

  getConversation(c) {
    this.appService.getConversation({_id: c.conv_id}).subscribe(
      (response) => {
        console.log(response);
      }
    );
  }


}// END CLASS
