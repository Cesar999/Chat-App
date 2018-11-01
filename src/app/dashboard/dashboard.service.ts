import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  public contact = new Subject<any>();
  public contact$ = this.contact.asObservable();

  contacts_list: any;

  constructor() {}

  setList(list) {
    this.contacts_list = list;
  }

  getList() {
    return this.contacts_list;
  }
// ---------------------------
  listenContact(data) {
      this.contact.next(data);
  }

  getContactListener() {
    return this.contact$;
  }

}
