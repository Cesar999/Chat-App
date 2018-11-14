import { Component, OnInit,  ElementRef, ViewChild } from '@angular/core';
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
  languages = [{o: 'English', v: 'en'}, {o: 'Française', v: 'fr'}, {o: 'Español', v: 'es'}];
  selectedOption = localStorage.getItem('locale');
  @ViewChild('alert1') private myAlert1: ElementRef;
  @ViewChild('alert2') private myAlert2: ElementRef;

  constructor(private appService: AppService, private router: Router) { }

  ngOnInit() {
    this.projectForm = new FormGroup({
      'username': new FormControl(null, [Validators.required]),
      'password': new FormControl(null, [Validators.required]),
      'password2': new FormControl(null, [Validators.required]),
      'customLanguage': new FormControl(this.selectedOption)
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
          alert(this.myAlert2.nativeElement.innerHTML);
          this.router.navigate(['/login']);
        } else {
          console.log(this.myAlert1);
          alert(this.myAlert1.nativeElement.innerHTML);
        }
      },
      (error) => console.log(error)
    );
  }

  onChangeLanguage(event) {
    const lang = event.target.value;
    if (lang === 'fr') {
      localStorage.setItem('locale', 'fr');
    }

    if (lang === 'en') {
      localStorage.setItem('locale', 'en');
    }

    if (lang === 'es') {
      localStorage.setItem('locale', 'es');
    }
    window.location.reload();
  }

}
