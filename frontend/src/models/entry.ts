import { Etch } from './etch';

export class Entry {

  constructor(
    readonly id: number,
    readonly title: string,
    readonly created: Date,
    readonly finished: Date | undefined,
    readonly etches: Etch[],
    readonly state: string
  ) {
  }
}
