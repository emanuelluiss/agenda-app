import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function businessHoursValidator(startHour: number = 8, endHour: number = 18): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value || !(value instanceof Date)) {
      return null;
    }

    const hour = value.getHours();
    const isValid = hour >= startHour && hour < endHour;

    if (!isValid) {
      return {
        businessHours: {
          actualHour: hour,
          expectedRange: `${startHour}h - ${endHour}h`
        }
      };
    }

    return null;
  };
}
