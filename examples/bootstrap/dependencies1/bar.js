import inject, { injectable } from './../../../';

// Injectable must be above inject
@injectable()
@inject(['Foo'])
export class Bar {
  constructor(foo) {
    this.name = 'And this is bar';
    this._foo = foo;
  }
}
