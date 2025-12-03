import { countryCodes } from './countryCodes';

// Function to determine the country code object from the given number
export const getCountryCodeObject = (number: string) => {
  for (const country of countryCodes) {
    if (number.startsWith(country.prefix)) {
      return country;
    }
  }
  return null;
};
