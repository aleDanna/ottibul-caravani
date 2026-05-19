export const SUPPORTED_COUNTRIES = [
  "ES", "AD", "AT", "BE", "CH", "DE", "DK", "FI", "FR", "GB",
  "IE", "IT", "LU", "MA", "NL", "NO", "PL", "PT", "SE", "US",
] as const;

export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];

export type CountryOption = {
  code: SupportedCountry;
  nativeName: string;
  dialCode: string;
  flag: string;
};

export const COUNTRY_OPTIONS: readonly CountryOption[] = [
  { code: "ES", nativeName: "España",         dialCode: "+34",  flag: "🇪🇸" },
  { code: "AD", nativeName: "Andorra",        dialCode: "+376", flag: "🇦🇩" },
  { code: "AT", nativeName: "Österreich",     dialCode: "+43",  flag: "🇦🇹" },
  { code: "BE", nativeName: "België",         dialCode: "+32",  flag: "🇧🇪" },
  { code: "CH", nativeName: "Schweiz",        dialCode: "+41",  flag: "🇨🇭" },
  { code: "DE", nativeName: "Deutschland",    dialCode: "+49",  flag: "🇩🇪" },
  { code: "DK", nativeName: "Danmark",        dialCode: "+45",  flag: "🇩🇰" },
  { code: "FI", nativeName: "Suomi",          dialCode: "+358", flag: "🇫🇮" },
  { code: "FR", nativeName: "France",         dialCode: "+33",  flag: "🇫🇷" },
  { code: "GB", nativeName: "United Kingdom", dialCode: "+44",  flag: "🇬🇧" },
  { code: "IE", nativeName: "Ireland",        dialCode: "+353", flag: "🇮🇪" },
  { code: "IT", nativeName: "Italia",         dialCode: "+39",  flag: "🇮🇹" },
  { code: "LU", nativeName: "Luxembourg",     dialCode: "+352", flag: "🇱🇺" },
  { code: "MA", nativeName: "المغرب",          dialCode: "+212", flag: "🇲🇦" },
  { code: "NL", nativeName: "Nederland",      dialCode: "+31",  flag: "🇳🇱" },
  { code: "NO", nativeName: "Norge",          dialCode: "+47",  flag: "🇳🇴" },
  { code: "PL", nativeName: "Polska",         dialCode: "+48",  flag: "🇵🇱" },
  { code: "PT", nativeName: "Portugal",       dialCode: "+351", flag: "🇵🇹" },
  { code: "SE", nativeName: "Sverige",        dialCode: "+46",  flag: "🇸🇪" },
  { code: "US", nativeName: "United States",  dialCode: "+1",   flag: "🇺🇸" },
];
