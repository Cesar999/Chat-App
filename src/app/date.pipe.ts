import { Pipe, PipeTransform } from '@angular/core';

import * as moment from 'moment';

@Pipe({
  name: 'datefrom',
  pure: false
})

export class DatePipe implements PipeTransform {
  transform(value: string): any {
    return moment(value).fromNow();
  }
}
