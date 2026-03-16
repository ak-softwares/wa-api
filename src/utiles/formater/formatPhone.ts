import parsePhoneNumberFromString from "libphonenumber-js";

export function formatInternationalPhoneNumber(input: string) {
  if (!input) {
    return {
      country: null,
      countryCallingCode: null,
      international: input,
      e164: input,
      national: input,
      isValid: false,
    };
  }

  try {
    const normalized = input.startsWith("+") ? input : `+${input}`;

    const phoneNumber = parsePhoneNumberFromString(normalized);

    if (!phoneNumber) {
      return {
        country: null,
        countryCallingCode: null,
        international: input,
        e164: input,
        national: input,
        isValid: false,
      };
    }

    return {
      country: phoneNumber.country,
      countryCallingCode: phoneNumber.countryCallingCode,
      international: phoneNumber.formatInternational(),
      e164: phoneNumber.format("E.164"),
      national: phoneNumber.formatNational(),
      isValid: phoneNumber.isValid(),
    };
  } catch {
    return {
      country: null,
      countryCallingCode: null,
      international: input,
      e164: input,
      national: input,
      isValid: false,
    };
  }
}

export function formatAndJoinPhones(phones: string[]) {
  return phones
    .map((number) => {
      const formatted = formatInternationalPhoneNumber(number);

      if (formatted.isValid) {
        return formatted.international;
      }

      // fallback if invalid
      return number.startsWith("+") ? number : `+${number}`;
    })
    .join(", ");
}

// {
//   "country": "RW",
//   "countryCallingCode": "250",
//   "international": "+250 795 821 614",
//   "e164": "+250795821614",
//   "national": "0795 821 614",
//   "isValid": true
// }