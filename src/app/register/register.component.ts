import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';

import {CustomValidators} from '../custom-validators';
import { AppService } from '../app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  projectForm: FormGroup;
  invalidPass = false;
  invalidUser = false;
  timer = null;
  languages = [{o: 'English', v: 'EN'}, {o: 'Française', v: 'FR'}, {o: 'Español', v: 'ES'}];
  selectedOption = {o: 'English', v: 'EN'};

  constructor(private appService: AppService, private router: Router) { }

  ngOnInit() {
    this.projectForm = new FormGroup({
      'username': new FormControl(null, [Validators.required]),
      'password': new FormControl(null, [Validators.required]),
      'password2': new FormControl(null, [Validators.required]),
      'customLanguage': new FormControl(null, [Validators.required])
    }, [CustomValidators.ValidatePasswords]);
  }

  onChange() {
    const p1 = this.projectForm.get('password').value;
    const p2 = this.projectForm.get('password2').value;

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
        if ((this.projectForm.errors) && p1 !== '' && p2 !== '') {
          this.invalidPass = true;
        } else {
          this.invalidPass = false;
        }
      }, 500);
    }

  onSubmit() {
    this.appService.postRegisterUser(this.projectForm.value)
    .subscribe(
      (response) => {
        console.log(response['flag']);
        if (response['flag']) {
          alert(response['msg']);
          this.router.navigate(['/login']);
        } else {
          alert(response['msg']);
        }
      },
      (error) => console.log(error)
    );
  }

}
