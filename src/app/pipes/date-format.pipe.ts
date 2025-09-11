import { Pipe, PipeTransform } from '@angular/core';
import { DateFormatService } from '../services/date-format.service';

@Pipe({
  name: 'customDate',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {

  constructor(private dateFormatService: DateFormatService) {}

  transform(value: string | Date, format: 'date' | 'datetime' | 'fullDate' | 'time' = 'date'): string {
    if (!value) return 'N/A';
    
    const dateString = typeof value === 'string' ? value : value.toISOString();
    
    switch (format) {
      case 'date':
        return this.dateFormatService.formatDate(dateString);
      case 'datetime':
        return this.dateFormatService.formatDateTime(dateString);
      case 'fullDate':
        return this.dateFormatService.formatFullDate(dateString);
      case 'time':
        return this.dateFormatService.formatTime(dateString);
      default:
        return this.dateFormatService.formatDate(dateString);
    }
  }
}