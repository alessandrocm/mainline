import inject, {injectable} from './../../';

@injectable()
class Dependency {
  constructor() {
    this.name = 'Dependency';
  }
}

@inject(['Dependency'])
class Dependent {
  constructor(p1) {
    this.dependency = p1;
  }
}

const target = new Dependent();

console.log(JSON.stringify(target));
