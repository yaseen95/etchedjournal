import { Etch } from './etch';

export class Entry {
  id: number;
  title: string;
  created: Date;
  finished?: Date;
  etches: Etch[];
  state: string;

  constructor(id: number, title: string, created: Date, finished: Date | undefined, etches: Etch[], state: string) {
    this.id = id;
    this.title = title;
    this.created = created;
    this.finished = finished;
    this.etches = etches;
    this.state = state;
  }
}
