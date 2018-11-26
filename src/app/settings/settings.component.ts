import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import {CustomValidators} from '../custom-validators';
import { Router } from '@angular/router';
import { AppService } from '../app.service';
import { CookieService } from 'ngx-cookie-service';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
changeLanguageForm: FormGroup;
changePassForm: FormGroup;
  languages = [{o: 'English', v: 'en'}, {o: 'Française', v: 'fr'}, {o: 'Español', v: 'es'}];
  selectedOption = localStorage.getItem('locale');
  invalidPass = false;
  timer = null;

  show_msg = false;
  msg = '';

  constructor(private appService: AppService, private settingsService: SettingsService,
  private router: Router, private cookieService: CookieService) { }

  showPass = false;
  showLanguage = false;

  ngOnInit() {

    this.changePassForm = new FormGroup({
      'old_password': new FormControl(null, [Validators.required]),
      'password': new FormControl(null, [Validators.required]),
      'password2': new FormControl(null, [Validators.required])
    }, [CustomValidators.ValidatePasswords]);

    this.changeLanguageForm = new FormGroup({
    'customLanguage': new FormControl(this.selectedOption)});

  }

  onChange() {
    const p1 = this.changePassForm.get('password').value;
    const p2 = this.changePassForm.get('password2').value;

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
        if ((this.changePassForm.errors) && p1 !== '' && p2 !== '') {
          this.invalidPass = true;
        } else {
          this.invalidPass = false;
        }
      }, 500);
    }

  onSubmitPassword() {
    this.appService.checkAuth().subscribe(
      (response) => {
         if (response['authorization'] === true ) {
          // console.log(this.changePassForm.value);
            this.settingsService.changePassword({...this.changePassForm.value, username: localStorage.getItem('username')})
            .subscribe(
              (res) => {
                // console.log(res);
                this.changePassForm.reset();
                this.msg = res['msg'];
                this.show_msg = true;
                setTimeout(() => {
                  this.show_msg = false;
                }, 2000);
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

  onSubmitLanguage() {
    // console.log(this.changeLanguageForm.value);
    this.appService.checkAuth().subscribe(
      (response) => {
         if (response['authorization'] === true ) {
          // console.log(this.changePassForm.value);
            this.settingsService.changeLanguage({...this.changeLanguageForm.value, username: localStorage.getItem('username')})
            .subscribe(
              (res) => {
                // console.log(res);
                this.changePassForm.reset();
                if (res['msg'] === 'Change Successfully') {
                  this.onChangeLanguage(res['lang']);
                }
                this.msg = res['msg'];
                this.show_msg = true;
                setTimeout(() => {
                  this.show_msg = false;
                }, 2000);
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

  onSelectionChange(event) {
    if (event.target.id === 'change_language') {
      this.showLanguage = true;
      this.showPass = false;
    }
    if (event.target.id === 'change_password') {
      this.showLanguage = false;
      this.showPass = true;
    }
  }

  onBack() {
    this.router.navigate(['/login']);
  }

  logOut() {
    // console.log('unauthorized');
    this.cookieService.deleteAll();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  onChangeLanguage(lang) {
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
