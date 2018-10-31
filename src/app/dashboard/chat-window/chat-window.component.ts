import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {
  messageForm: FormGroup;
  constructor() { }

  ngOnInit() {
    this.messageForm = new FormGroup({
      'message': new FormControl(null, [Validators.required])
    });
  }

  onSend() {}
}
