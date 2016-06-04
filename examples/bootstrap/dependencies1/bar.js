import inject, { injectable } from './../../../';

// Injectable must be above inject
@injectable('Bar') // Alias required because of the multiple decorators
@inject(['Foo'])
export class Bar {
  constructor(foo) {
    this.name = 'And this is bar';
    this._foo = foo;
  }
}
