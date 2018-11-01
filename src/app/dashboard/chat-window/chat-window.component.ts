import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DashboardService } from '../dashboard.service';
@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {
  messageForm: FormGroup;
  constructor(private dashboardService: DashboardService) { }
  test: any;

  ngOnInit() {
    this.messageForm = new FormGroup({
      'message': new FormControl(null, [Validators.required])
    });

    this.dashboardService.getContactListener().subscribe(
      (res) => {
        this.test = `${res.username} : ${res.conv_id}`;
      }
    );
  }

  onSend() {
    this.test = this.dashboardService.getList();
  }
}
