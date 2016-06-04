import { injectable } from './../../../';

@injectable()
export class Foo {
  constructor() {
    this.name = 'This is foo';
    this.random = Math.random();
  }
}
