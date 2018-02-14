
export class EtchedUser {
  id: number;
  username: string;
  password: string;
  email: string;
  admin: boolean = false;

  // these can be set after registration.
  // the fields below are all for deriving the Master Key.
  algo: string | null = null;
  salt: string | null = null;
  keySize: number | null = null;
  iterations: number | null = null;
}
