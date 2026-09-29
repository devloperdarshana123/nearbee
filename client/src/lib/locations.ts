import { Country, State } from "country-state-city";
import type { ICountry, IState } from "country-state-city";

export type { ICountry, IState };

export const DEFAULT_COUNTRY_CODE = "IN";

export function getAllCountries(): ICountry[] {
  return Country.getAllCountries();
}

export function getCountryByCode(isoCode: string): ICountry | undefined {
  return Country.getCountryByCode(isoCode);
}

export function getCountryByName(name: string): ICountry | undefined {
  return Country.getAllCountries().find((c) => c.name === name);
}

export function getStatesOfCountry(countryCode: string): IState[] {
  return State.getStatesOfCountry(countryCode);
}

export function getStateByCodeAndCountry(
  stateCode: string,
  countryCode: string,
): IState | undefined {
  return State.getStateByCodeAndCountry(stateCode, countryCode);
}

export function getStateByNameAndCountry(
  stateName: string,
  countryCode: string,
): IState | undefined {
  return State.getStatesOfCountry(countryCode).find((s) => s.name === stateName);
}

