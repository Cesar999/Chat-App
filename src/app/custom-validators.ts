import { AbstractControl } from '@angular/forms';

export class CustomValidators {

  static  ValidatePasswords(control: AbstractControl) {
    const p1 = control.get('password').value;
    const p2 = control.get('password2').value;

      if (p1 !== p2) {
        return { invalidPass: true };
      }
      return null;
  }

}
