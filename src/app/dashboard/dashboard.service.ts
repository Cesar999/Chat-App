import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private contact_list$: BehaviorSubject<any>;
  private room_msg$: BehaviorSubject<any>;

  contacts_list: any;
  room: any;

  constructor() {
    this.contact_list$ = new BehaviorSubject<any>([]);
    this.room_msg$ = new BehaviorSubject<any>({});
  }

  setList(list) {
    this.contacts_list = list;
  }

  getList() {
    return this.contacts_list;
  }

 getContactList(): Observable<any> {
    return this.contact_list$.asObservable();
}

getRoomMsg(): Observable<any> {
  return this.room_msg$.asObservable();
}

  listenContact(data) {
    this.contact_list$.next(data);
  }

  listenRoomMsg(data) {
    this.room_msg$.next(data);
}



}
