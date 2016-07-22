# mainline [![Build Status](https://travis-ci.org/alessandrocm/mainline.svg?branch=master)](https://travis-ci.org/alessandrocm/mainline)
Yet another javascript DI framework

## Install

```
$ npm install --save mainline
```
Compatible with Node v6.2 and up.

## Usage
```js
import Mainline, {inject, injectable} from 'mainline';

const SOME_VALUE = 'path/to/something';

Mainline.registerVariable(SOME_VALUE, 'SOME_VALUE');

@injectable()
class DataStore {
  constructor() {
    ...
  }
}

@inject(['DataStore', 'SOME_VALUE'])
class DataService {
  constructor(datastore, value) {
    this.datastore = datastore,
    this.value = value;
  }
}

const data = new DataService(); // Mainline automatically provides parameters
```

## Documentation

### Mainline

#### #register
Registers the target and makes it globally available.
```js
Mainline.register(someFunction, options);
```

_Arguments_
* ```target``` (Object|Class|Function|Primitive) target to make available throughout the app.
* ```options``` (Object)
  * ```alias``` *optional* (String) Name by which to resolve it by. If none is provided the function or class name is used.
  * ```type``` *optional* (injectTypes) You can specify if it is a CLASS (Default) | SINGLETON | FUNC | VALUE.

_Returns_
* ```target``` (Object|Class|Function|Primitive) The target.

#### #registerFunc
Registers a target function and makes it globally available.
```js
Mainline.registerFunc(target, alias);
```

_Arguments_
* ```target``` (Function) Function to make available throughout the app.
* ```alias``` *optional* (String) Alias for the function. If not provided the function name is used.

_Returns_
* ```target``` (Object|Class|Function|Primitive) The target.

#### #registerVariable
Registers a target variable and makes it globally available.
```js
Mainline.registerVariable(target, alias);
```

_Arguments_
* ```target``` (Object|Primitive) Instance to make available throughout the app.
* ```alias``` *required* (String) Alias for the variable.

_Returns_
* ```target``` (Object|Primitive) The target.

#### #registerSingleton
Registers a target class/constructor and makes it globally available.
```js
Mainline.registerSingleton(target, alias);
```

_Arguments_
* ```target``` (Class|constructor) class to make available throughout the app. After it is instantiated the first time the same instance is reused.
* ```alias``` *optional* (String) Alias for the class. If not provided the class/constructor name is used.

_Returns_
* ```target``` (Object) The target.

#### #resolve
Method returns a resolver with which to generate the required objects or values.
```js
Mainline.resolve(targetName1, targetName2, ...)
```

_Arguments_
* ```targetName``` (String) Names of objects to resolve.

_Returns_
* ```Mainline``` (Object) This is an object that can be used to retrieve or create dependencies by their name or alias.

#### #get
Instance method that will give access to those objects specified in ```resolve``` method.
```js
const resolver = Mainline.resolve('Item1', 'Item2');
const item1 = resolver.get('Item1').item;
```

_Arguments_
* ```name``` (String) Name or alias of dependency.

_Returns_
* ```Resolver``` (Object) An instance of a resolver which wraps the dependency.

### Resolver
The resolver is a wrapper for a dependency which will allow you to create instances of the dependency (if it is a class) and override any function/constructor parameters.

#### #withParams
Used to provide parameters to bind to a function or pass to a constructor. Parameters must be provided in the order the target expects them.
```js
const func = resolver.get('func1').withParams(param1, param2, ...).item;
```

_Arguments_
* ```param``` (Any) Any type needed by the target.

#### #item
Property used to get an instance of or reference to the desired target.
```js
const obj1 = resolver.get('Class1').item;
const obj2 = resolver.get('Class2').withParams(true, 42).item;
```

_Returns_
* A reference to the required dependency.

### @injectable
A decorator which can be used to register any class as an injectable dependency.
```js
@injectable()
class Thing1 {
  ...
}

@injectable('Thing2', injectTypes.SINGLETON)
class Thingy{
  ...
}
```
_Arguments_
* ```alias``` *optional* (String) An alias to the dependency used to ```inject``` it later.
If one is not provided the class name is used by default.
* ```injectType``` *optional* (Symbol) Used to specify what kind of dependency it is. CLASS (default) | SINGLETON.
SINGLETON will guarantee the same instance will be returned throughout the application.

### @inject
A decorator to specify that registered dependencies should be injected into the constructor.
Parameters will be automatically passed whenever the class is instantiated.
```js
@inject(['Thing1', 'Thing2'])
class Story {
  constructor(thing1, thing2) {
    ...
  }
}

const story1 = new Story(); // No need to provide parameters.
const story2 = new Story(undefined , 'OtherThing') // You can override injected parameters.
// Undefined params will be replaced with an injected instance.
```

### injectTypes
A collection of Symbols used specify different kinds of dependencies. CLASS | SINGLETON | FUNC | VALUE

## Examples

_Coming Soon_
