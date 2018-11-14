import { Pipe, PipeTransform } from '@angular/core';

import * as moment from 'moment';

moment.locale(localStorage.getItem('locale'));

@Pipe({
  name: 'datefrom',
  pure: false
})
export class DatePipe implements PipeTransform {
  transform(value: string): any {
      return  moment(value).fromNow();
  }
}
