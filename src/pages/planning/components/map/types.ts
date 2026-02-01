// Types specific to map feature properties

export interface AirportProps {
  id?: string;
  name1?: string;
  name2?: string;
  type?: string;
  'Elev(ft)'?: number | string;
  RWY1?: string;
  RWY2?: string;
  RWY3?: string;
  RWY4?: string;
  ILS?: string;
  TWR?: string;
  APP?: string;
  GND?: string;
  REMARKS?: string;
  [key: string]: unknown;
}

export interface NavaidProps {
  id?: string;
  name?: string;
  name1?: string;
  name2?: string;
  type?: string;
  ch?: string;
  freq?: string;
  [key: string]: unknown;
}

export interface WaypointProps {
  id?: string;
  name1?: string;
  type?: string;
  [key: string]: unknown;
}

export interface ACCSectorProps {
  ID?: string;
  Callsign?: string;
  Freq_VHF?: string;
  Freq_UHF?: string;
  Floor?: string;
  Ceiling?: string;
  [key: string]: unknown;
}

export interface RAPCONProps {
  Area_ID?: string;
  Callsign?: string;
  Freq_VHF?: string;
  Freq_UHF?: string;
  Floor?: string;
  Ceiling?: string;
  [key: string]: unknown;
}

