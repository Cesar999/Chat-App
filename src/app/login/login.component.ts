import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AppService } from '../app.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  projectForm: FormGroup;
  cookieValue = 'unknown';
  show_msg = false;
  msg: string;

  languages = [{o: 'English', v: 'en'}, {o: 'Française', v: 'fr'}, {o: 'Español', v: 'es'}];
  selectedOption = localStorage.getItem('locale');

  constructor(private appService: AppService, private cookieService: CookieService, private router: Router) { }

  ngOnInit() {
    this.projectForm = new FormGroup({
      'username': new FormControl(null, [Validators.required]),
      'password': new FormControl(null, [Validators.required])
    });

    if (localStorage.getItem('username') !== null) {
      this.router.navigate(['/dashboard']);
    }
  
  }

  onSubmit() {
    this.appService.postLoginUser(this.projectForm.value)
    .subscribe(
      (response) => {
        console.log(response);
        if (response['token']) {
          this.cookieService.set( 'TOKEN', response['token']);
          this.cookieValue = this.cookieService.get('TOKEN');
          console.log(this.cookieValue);
          localStorage.setItem('locale', response['language']);
          localStorage.setItem('username', response['username']);
          window.location.reload();
        } else {
          this.msg = response['msg'];
          this.show_msg = true;
          setTimeout(() => {
            this.show_msg = false;
          }, 2000);
          console.log(response);
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
