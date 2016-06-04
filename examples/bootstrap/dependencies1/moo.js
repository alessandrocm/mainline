import { injectable, injectTypes } from './../../../';

@injectable(injectTypes.SINGLETON)
export class Moo {
  constructor() {
    this.name = 'I am always the same Moo';
    this.random = Math.random();
  }
}
