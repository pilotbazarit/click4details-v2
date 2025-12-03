import { getCountryCodeObject } from './getCountryCodeObject';
import { replaceSpacesAndHyphens } from './replaceSpacesAndHyphens';

export function getValidNumber(number: string) {
  const updatedWa_id = replaceSpacesAndHyphens(number);

  const isValidNumberFormat = /^\d+$/.test(updatedWa_id); // Checks if the number contains only digits
  if (!isValidNumberFormat) {
    return {
      number: '',
      isValid: false,
      message: 'Invalid number'
    };
  }

  const userCountryCodeObj = getCountryCodeObject(updatedWa_id);
  if (!userCountryCodeObj) {
    if (updatedWa_id.startsWith('01') && updatedWa_id.length === 11) {
      return {
        number: '88' + updatedWa_id,
        isValid: true,
        message: ''
      };
    } else {
      return {
        number: '',
        isValid: false,
        message: 'Invalid number'
      };
    }
  }

  return {
    number: updatedWa_id,
    isValid: true,
    message: ''
  };
}
