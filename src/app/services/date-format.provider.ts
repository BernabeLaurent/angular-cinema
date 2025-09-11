import { MAT_DATE_FORMATS } from '@angular/material/core';

export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'input',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export const CustomDateFormatProvider = {
  provide: MAT_DATE_FORMATS,
  useValue: CUSTOM_DATE_FORMATS
};