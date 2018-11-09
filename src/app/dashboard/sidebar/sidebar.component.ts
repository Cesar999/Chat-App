import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { WebsocketService } from 'src/app/websocket.service';
import { DashboardService } from '../dashboard.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  contactForm: FormGroup;
  roomForm: FormGroup;
  inviteForm: FormGroup;
  msg: string;
  show_msg: boolean;
  contactlist: any;
  status: false;

  roomFlag = true;
  tag_btn = 'Rooms';

  list_rooms: any;

  constructor(private appService: AppService, private router: Router, private cookieService: CookieService,
  private socket: WebsocketService, private dashboardService: DashboardService) { }

  ngOnInit() {
    this.contactForm = new FormGroup({
      'contact': new FormControl(null, [Validators.required])
    });

    this.roomForm = new FormGroup({
      'room': new FormControl(null, [Validators.required])
    });

    this.inviteForm = new FormGroup({
      'invite': new FormControl(null, [Validators.required]),
      'toRoom': new FormControl(null, [Validators.required])
    });

    this.socket.listenList().subscribe(data => {
    console.log(data);
      this.contactlist = data;
      this.dashboardService.setList(data);
    });

    this.socket.listenInvited().subscribe(data => {
        // console.log(data, 'SIDEBAR');
        this.appService.getRooms({username: localStorage.getItem('username')}).subscribe(
          (res) => {
          //  console.log(response);
            this.list_rooms = res;
          }
        );
    });

  }

  logOut() {
  //  console.log('unauthorized');
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
      // console.log(response);
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
          this.dashboardService.listenContact(c);
          console.log(c);
          if (c.last_msg.author.username !== localStorage.getItem('username')) {
            this.socket.emitSeenMsg(c.last_msg._id);
          }
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
       // console.log(response);
        this.dashboardService.listenContact(c);
      }
    );
  }

  onDelete(c) {
    this.appService.deleteContact({contact: c.username, mainUser: localStorage.getItem('username')}).subscribe(
      (response) => {
      //  console.log(response);
      }
    );
  }

  toggleRooms() {
    this.roomFlag = !this.roomFlag;
    this.tag_btn = this.roomFlag ? 'Rooms' : 'Contacts';
    localStorage.setItem('flag', this.tag_btn);
    if (!this.roomFlag) {
      this.appService.checkAuth().subscribe(
      (response) => {
        if (response['authorization'] === true ) {
          this.appService.getRooms({username: localStorage.getItem('username')}).subscribe(
            (res) => {
            //  console.log(response);
              this.list_rooms = res;
            }
          );
        } else {
        }
      },
      (error) => {
        this.logOut();
      }
    );
    }
  }

  onAddRoom() {
    this.appService.checkAuth().subscribe(
      (response) => {
        if (response['authorization'] === true ) {
          console.log(this.roomForm.value);
          this.appService.createRoom({username: localStorage.getItem('username'), room: this.roomForm.value.room}).subscribe(
            (response2) => {
             console.log(response2);
             this.appService.getRooms({username: localStorage.getItem('username')}).subscribe(
              (res) => {
              //  console.log(response);
                this.list_rooms = res;
                }
              );
              this.roomForm.reset();
            }
          );
        } else {
        }
      },
      (error) => {
        this.logOut();
      }
    );
  }

onRoom(r) {
 // console.log(r);
  this.dashboardService.listenContact(r);
}

onInviteRoom() {
 // console.log(this.inviteForm.value);
      this.appService.checkAuth().subscribe(
      (response) => {
        if (response['authorization'] === true ) {
          this.socket.onInvite(this.inviteForm.value);
          this.inviteForm.reset();
        } else {
        }
      },
      (error) => {
        this.logOut();
      }
    );
}

onLeaveRoom(r) {
  const obj = {conv_id: r._id, username: localStorage.getItem('username')};
      this.appService.checkAuth().subscribe(
      (response) => {
        if (response['authorization'] === true ) {
          this.appService.leaveRoom(obj)
          .subscribe(
            (res) => {
             if (res['msg'] === 'left room') {
                this.appService.getRooms({username: localStorage.getItem('username')}).subscribe(
                  (res1) => {
                  this.list_rooms = res1;
                  }
                );
             }
            }
          );
        } else {
        }
      },
      (error) => {
        this.logOut();
      }
    );
}

checkSeen(c) {
  if (c.last_msg) {
    if (c.last_msg.author.username !== localStorage.getItem('username')) {
      return c.last_msg.seen.length > 0;
    }
  } else {
      return false;
  }
}

}// END CLASS
