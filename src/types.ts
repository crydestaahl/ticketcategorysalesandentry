export interface TicksterTicket {
  ticket: {
    authCode: string;
    goodsName: string;
    artNo: string;
    entryPermittedFrom: string;
    entryPermittedTo: string;
    ticketState: string; // "Unused", "Used", etc.
    validForEntry: boolean;
    refNo: string;
    email: string;
    firstName: string;
    lastName: string;
    mobilePhoneNo: string;
    created: string;
    eventName: string;
    eventRequestCode: string;
    lastUpdated: string;
    isNumbered: boolean;
    entryVia: string;
    section: string;
    row: string;
    seat: string;
    seatAttributes: string[];
  };
}

export interface TicksterResponse {
  tickets: TicksterTicket[];
}

export interface AppSettings {
  eogRequestCode: string;
  eventRequestCode: string;
  apikey: string;
  username: string;
  password: string;
}

export interface TicksterEventItem {
  id: string;
  name: string;
  startUtc?: string;
  endUtc?: string;
  venue?: {
    name: string;
    city: string | null;
  };
}

