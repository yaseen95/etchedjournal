import { Entry } from '../models/entry';

export class EtchedApi {

  getEntries(): Promise<Entry[]> {
    return new Promise(
      (resolve => {
        return [
          new Entry(1, 'Entry 1', new Date(1), undefined, [], 'CREATED')
        ];
      })
    );
  }
}
