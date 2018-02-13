import { Entry } from './models/entry';
import { Etch } from './models/etch';
import { Jwt } from './models/jwt';

module ApiModels {

  export interface EntryApiModel {
    id: number;
    etches: Etch[];
    title: string;
    state: string;
    created: string;
    finished: string | null;
  }
}

export class EtchedApi {

  BASE_URL = 'http://localhost:8080/api/v1';

  private static parseEntry(o: ApiModels.EntryApiModel): Entry {
    let e = new Entry();
    e.id = o.id;
    e.etches = o.etches;
    e.title = o.title;
    e.state = o.state;
    e.created = new Date(o.created);
    let finished = null;
    if (o.finished !== null) {
      finished = new Date(o.finished);
    }
    e.finished = finished;
    return e;
  }

  private static parseEntries(entryApiModels: ApiModels.EntryApiModel[]): Entry[] {
    let entries: Entry[] = [];
    for (let i = 0; i < entryApiModels.length; i++) {
      entries.push(EtchedApi.parseEntry(entryApiModels[i]));
    }
    return entries;
  }

  private static jsonPostInit(body: object): RequestInit {
    return {
      method: 'POST',
      headers: new Headers({'Content-Type': 'application/json'}),
      body: JSON.stringify(body)
    };
  }

  getEntries(): Promise<Entry[]> {
    let headers = new Headers();
    headers.append('Access-Control-Allow-Origin', '*');
    return fetch(`${this.BASE_URL}/entries`, {headers: headers})
      .then(r => {
        // TODO: Figure out why this extra .then() is needed
        // Can't just return r.json() as Entry[] for some reason...
        return r.json();
      })
      .then(entries => {
        return EtchedApi.parseEntries(entries);
      });
  }

  getEntry(entryId: number): Promise<Entry> {
    return fetch(`${this.BASE_URL}/entries/entry/${entryId}`)
      .then(r => {
        return r.json();
      })
      .then(entry => {
        return entry as Entry;
      });
  }

  getEtches(entryId: number): Promise<Etch[]> {
    return fetch(`${this.BASE_URL}/entries/entry/${entryId}/etches`)
      .then(r => {
        return r.json();
      })
      .then(etches => {
        return etches as Etch[];
      });
  }

  getEtch(entryId: number, etchId: number): Promise<Etch> {
    return fetch(`${this.BASE_URL}/entries/entry/${entryId}/etches/etch/${etchId}`)
      .then(r => {
        return r.json();
      })
      .then(etch => {
        return etch as Etch;
      });
  }

  postEtch(entryId: number, etch: Etch): Promise<Etch> {
    let requestInit = EtchedApi.jsonPostInit(etch);

    return fetch(`${this.BASE_URL}/entries/entry/${entryId}/etches/etch/`, requestInit)
      .then(r => {
        return r.json();
      })
      .then(savedEtch => {
        return savedEtch as Etch;
      });
  }

  register(username: string, email: string, password: string): Promise<Jwt> {
    let requestInit = EtchedApi.jsonPostInit({
                                               'username': username,
                                               'email': email,
                                               'password': password
                                             });
    return fetch(`${this.BASE_URL}/auth/register`, requestInit)
      .then(r => {
        return r.json();
      })
      .then(user => {
        console.log(JSON.stringify(user));
        return user as Jwt;
      });
  }
}
