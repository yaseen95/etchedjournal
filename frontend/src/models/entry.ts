import { Etch } from './etch';

export class Entry {
  id: number;
  title: string;
  created: Date;
  finished: Date | null;
  etches: Etch[];
  state: string;
}
