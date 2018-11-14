import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import {CustomValidators} from '../custom-validators';
import { Router } from '@angular/router';

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

  constructor(private router: Router) { }

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

  onSubmitPassword() {}

  onSubmitLanguage() {}

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

}
