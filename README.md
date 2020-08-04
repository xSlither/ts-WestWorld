[![NPM version][npm-version-image]][npm-url] [![NPM downloads][npm-downloads-image]][downloads-url] [![Apache License][license-image]][license-url]

<img src="https://user-images.githubusercontent.com/53584008/88829291-6a7d8080-d19a-11ea-92fb-1c55b3e5fce5.png"/>

*An interface reflection library for native TypeScript Node.js builds*

## Installing

Installing `ts-westworld` is really simple. First install the npm package and `reflect-metadata` into your project:

```batchfile
npm i ts-westworld reflect-metadata 
```

Next, you will need to configure your `tsconfig.json` to enable experimental decorators and metadata. This project also has a dependency on ES6 classes, and thus, your project must also transpile into **ES6 or later**:

```json
"compilerOptions": {
    "target": "ES6",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
}
```

## What does this module do?

`ts-westworld` provides an easy way of performing both additional compilation and runtime checks for TypeScript interfaces. 

The reason we cannot do this natively today is because interfaces are not part of JavaScript, and are used in TypeScript strictly as a way of enforcing & constraining contracts we define at compile time, and are removed when we transpile our code into JavaScript. This means that we do not get access to any metadata related to interfaces at runtime like we can achieve with classes; leaving developers to use techniques such as custom typeguards, instead. 

In the world of other Object-Oriented Languages like C# and Java, being able to check contracts at rutime can help enforce SOLID principles during development.

This module is currently designed to provide similar funcitionality strictly for *native* TypeScript builds on the **Node.js** platform. 

It is actually possible to achieve this same functionality directly with TypeScript by using custom transformers to inject the interface metadata into the transpiled JavaScript. But, this may not be an option for many production applications. 

If using custom transformers in your project is not a problem for you, I highly reccomend checking out [ts-reflection](https://github.com/janjakubnanista/ts-reflection), as someone else has already put together a great module that accomplishes this goal seamlessly with a custom build of TypeScript.

### Background

I was working on a back-end abstraction that the front-end developers would use for dynamically serializing complex XML Tables received back from external microservices, and wanted a way of checking at runtime if a specific property defined by an inheritance of one of the abstracitons actually implemented a specific interface. A normal developer would have left it with a custom typeguard and moved on... But, obviously, I *needed* this evaluation to be abstract. My use cases grew, and, thus, this library was born.

### Why "*WestWorld*", though?

* I thought it was an interesting metaphor [about the hit TV series] in regards to collecting metadata on interfaces and implementing that into our ecosystem.
* "World" is common in namespace nomenclature
* The concept of this module is highly experimental; very "far left" from standard TypeScript development.
* No, this module has nothing to do with Artificial Intelligence

### Project Goals

* Provide functionality within native TypeScript for evaluating contracts implemented by classes at runtime.
* Flexibility- I want developers to have several options for implementing these evaluations into their projects, with whichever flavor they prefer. In other words, the module itself should take care of as much as possible. I also wanted just as much flexibility with the library components. Developers should be able to easily cherry pick which functionalities to implement at any level of their project.
* High Performance. The class constructor injections and evaluations performed by this module should have negligible impact on runtime metrics.
* Low-Risk. The module should be low-risk to implement and remove. It should be optional at any point in the project's scope.
* The IDE should be doing the grunt work for you by utilizing strong typing in the module.
* Seamlessly implemented into the TypeScript ecosystem. It was a design choice to export the module as a namespace injected into Node.js's Global space. I wanted all of the components of this module to be easy to import, remember, and access.

## How do I use this library?

There's MANY ways to utilize this library. Let's get started.

### Importing the namespace

To use the `WestWorld` namespace in a source file, at the top of your document, simply:
```typescript
import 'ts-westworld';
```

### A Basic Example

Because interfaces are not transpiled, we can take advantage of this by assigning and/or exporting the same symbol as both an interface and Symbol Constant. That way, later when we do our rutime checks, importing this symbol has no impact to your existing code.

Let's take a look at the following example. This is a basic implementation of an abstract typeguard, using just a Symbol:

*interfaces.ts*
```typescript
import 'ts-westworld';

export const Animal = Symbol.for('Animal');
export interface Animal {
    HasLegs: boolean;
    move(): void;
}
```

*test.ts*
```typescript
import 'ts-westworld';
import { Animal } from './interfaces';

@WestWorld.usesImplementsOf(Animal)
class Bovine implements Animal {
    public HasLegs: boolean = true;
    public move(): void { return; }
}

class Fowl implements Animal {
    public HasLegs: boolean = true;
    public move(): void { return; }
}

@WestWorld.usesImplementsOf(Animal)
class Fish {
    public move(): void { return; }
}

let x = new Bovine();
let y = new Fowl();
let z = new Fish();

console.log(WestWorld.implementsOf(x, Animal)); //TRUE
console.log(WestWorld.implementsOf(y, Animal)); //FALSE
console.log(WestWorld.implementsOf(z, Animal)); //TRUE
```

As you can see, we're able to import 'Animal' as both a Symbol & an interface, so that we have a single reference. Our class decorator, "*usesImplementsOf*", applies our symbol to the class' metadata, so that we can check the implementation of our symbol later, at runtime. Meanwhile, TypeScript's *impelments* keyword enforces our contract at compilation time, but is not required.

However, this simply implies the binding of our Symbol to the class, and does not actually check for the existance of properties & methods from our contract. To do that, we're going to need to talk about schemas.

### Defining Schema Containers

One of the main goals of this project was flexibility. As such, there are several (5, in fact) methods of defining your schema container. It is up to YOU how to export and reference your containers. Personally, I prefer not to use instanced containers, and to handle typeguards within my module, but we will get into that later.

Let's say we have a source file with several interfaces we wish to be able to perform runtime evaluations against. For sanity's sake, let's also assume the below examples are all within the same source file:

```typescript
enum AttackStyle {
    TwoHanded,
    OneHanded,
    Ranged
}

//Can optionally not define a descriptor for your symbol (not recommended). This however makes it impossible to obtain a reference to your symbol without importing it from the source file it was defined in. Otherwise, it can be "retrieved" with Symbol.for()
const IWarrior = Symbol();
interface IWarrior {
    Style: AttackStyle;
    attack(): void;
}

const IShogun = Symbol();
interface IShogun {
    ShogunName: string;
    specialAttack(someArgument: boolean): void;
}

//This module works with interfaces that extend other interfaces, too
const IRogue = Symbol();
interface IRogue extends IWarrior {
    sneak(): void;
}

const IShogunApprentice = Symbol();
interface IShogunApprentice {
    TrainedUnder: string;
}
```

Now that we've declared some interfaces we want to work with, let's take a look at the different types of schema containers that we can define:

#### Instanced Indexable Containers

The following conatiners are *indexable*, which helps the IDE tell you how to define the container. 

There are two types, each with a few options. 
* One type is definition of the full schema as boolean values (with true/false meaning whether to evaluate the key or not); in the future I would like to expand this to optionally type-check the keys, as well. 
* The other type is simply a definition of the keys to evaluate

The catch with instanced containers is that, to use them, a new instance of them must be defined by calling their constructor, first.

```typescript
class InterfaceContainer1 extends WestWorld.IndexableAutoImplementDefs {
    //The "toAutoImplement" type will require ALL keys from the contract to be defined in this schema property during development/compilation.
    public IWarrior: WestWorld.toAutoImplement<IWarrior> = [
        IWarrior, { Style: true, attack: false } //"Style" will be required, but attack will not
    ];

    //The "toAutoImplementPartial" type will not require any keys from the contract to be defined in this schema property, but the IDE will offer suggestions.
    public IShogun: WestWorld.toAutoImplementPartial<IShogun> = [
        IShogun, { specialAttack: true }
    ];
}

class InterfaceContainer2 extends WestWorld.IndexableAutoImplementKeys {
    //Likewise, toAutoImplementKeys and toAutoImplementKeysPartial behave the same way
    public IWarrior: WestWorld.toAutoImplementKeys<IWarrior> = {
        interface: IWarrior,
        keys: ['Style', 'attack']
    };
    
    //You can also declare your IndexableAutoImplementKeys container properties this way
    public IShogun = {
        interface: IShogun,
        keys: <(keyof IShogun)[]>['specialAttack', 'ShogunName']
    };
}
```

#### Static Containers

Static containers provide a much more flexible way of defining your schemas; they allow for other properties aside from your schema to be part of the class and don't need to be instantiated. Like the instanced containers, there are again two styles:

```typescript
class InterfaceContainer3 {
    public static IWarrior: WestWorld.toAutoImplement<IWarrior> = [
        IWarrior, { Style: true, attack: true }
    ];

    public static IShogun: WestWorld.toAutoImplementPartial<IShogun> = [
        IShogun, { specialAttack: true }
    ];

    //This property will be properly ignored by the IDE when giving you suggestions later
    public static NotAnInterface: string = 'SomeText';
}

class InterfaceContainer4 {
    public static IWarrior: WestWorld.toAutoImplementKeys<IWarrior> = {
        interface: IWarrior,
        keys: ['Style', 'attack']
    };

    public static IShogun = {
        interface: IShogun,
        keys: <(keyof IShogun)[]>['specialAttack', 'ShogunName']
    };

    public static NotAnInterface: string = 'SomeText';
}
```

#### Constant-like Container(s)

The last variation of containers is a constant you can define. The upside of using a constant is that it behaves like a static container, but is restricted to a particular pattern. The WestWorld namespace offers a few methods to create a constant container. The downside is that the IDE will not have any keys to suggest for you later. It also requires you to list all keys of a contract, instead of having the option to only list certain keys.

There are a couple of ways you could define this type of container:

```typescript
//Method 1 is to indivdually define your schemas
schemaIWarrior = WestWorld.autoImplement<IWarrior>([
    IWarrior, { Style: true, attack: true }
]);

schemaIShogun = WestWorld.autoImplement<IShogun>([
    IShogun, { specialAttack: true, ShogunName: true }
]);

const InterfaceContainer5 = WestWorld.ImplementOfPatternFactory(
    schemaIWarrior,
    schemaIShogun
);


//Method 2 is to do it all inline, within the Factory method
const InterfaceContainer6 = WestWorld.ImplementOfPatternFactory(
    WestWorld.autoImplement<IWarrior>([
        IWarrior, { Style: true, attack: true }
    ]),
    WestWorld.autoImplement<IShogun>([
        IShogun, { specialAttack: true, ShogunName: true }
    ])
);

```

#### implementsFrom() Evaluations

Now that we've talked about the different types of containers, I wanted to discuss the "`implementsFrom()`" evaluation, before we move on to talk more about class decorators.

Above I demonstrated how to use `implementsOf()` to check for the implementation of an Interface. You can also use `implementsFrom()` to perform the same type of check. This does not check the instance against the schema, but rather provides a way of leveraging the IDE to tell you what keys are available/applicable from the container, instead of needing the symbol for the interface imported.

*(Note: This method does not work for constant containers)*

```typescript
@WestWorld.usesImplementsOf(InterfaceContainer, 'IWarrior')
class Ninja implements IWarrior {
    public Style: AttackStyle = AttackStyle.OneHanded;
    public attack(): void { return; }
}

let x = new Ninja();
console.log(WestWorld.implementsFrom(InterfaceContainer, x, 'IWarrior')); //TRUE
```

### Class Decorators

There are 3 types of class decorators we can use to setup our rutime evaluations, each with several overloads to give you flexability with your design.

Class deocrators are where optional schema-checking and most of the runtime evaluations come in, which can have some powerful applications that I will cover.

#### usesImplementsOf() Decorator

In the examples above you can see the use of the "`usesImplementsOf()`" class decorator. This decorator has several overloads that change how/which metadata is binded to the class. For instance, one can provide just a *symbol* like so, to associate the symbol with the class:

```typescript
@WestWorld.usesImplementsOf(IWarrior)
```

Using this method provides no schema evaluation when a new instance of the class is instantiated.

Or, you can add a schema container (of any type, including constant types), followed by an optional parameter array of symbols/keys. This *will* perform a schema evaluation when an instance of the class is instantiated

```typescript
//The IDE will restrict the available keys based on the container (for any type except the constant type) This decorator indicates to implement/enforce only these 2 types from the container
@WestWorld.usesImplementsOf(InterfacesContainer1, 'IWarrior', 'IShogun')

//This applies all interfaces of the container to the class
@WestWorld.usesImplementsOf(InterfacesContainer1)

//You can also use an "autoImplement" schema constant(s)
@WestWorld.usesImplementsOf(schemaIWarrior)
@WestWorld.usesImplementsOf(schemaIWarrior, schemaIShogun)
@WestWorld.usesImplementsOf(InterfaceContainer5)
@WestWorld.usesImplementsOf(InterfaceContainer5, IWarrior)

//Again, alternatively you can use just symbols:
@WestWorld.usesImplementsOf(IWarrior, IShogun)
```

#### usesAbstractImplementsOf() Decorator

This decorator imposes a much more **powerful** use of the interface runtime evaluations.

Instead of enforcing the specified contract(s) to this particular class, it only evaluates the schemas for classes that _**inherit**_ this class. To satisfy this evaluation, a single child in the prototype chain must satisfy the contract. This could be at any point in the chain.

Let's take a look at the following examples:

```typescript
const A = Symbol();
interface A {
    someKey: string;
}

class Container {
    public A: WestWorld.toAutoImplementKeys<A> = {
        interface: A,
        keys: ['someKey']
    };
}

//Requires that a child class implements the schema of container key 'A'
@WestWorld.usesAbstractImplementsOf(Container, 'A')
class B {
    someMethod(): void { return; }
}

//Requires that a child class implements the corresponding symbol via "usesImplementsOf()"
@WestWorld.usesAbstractImplementsOf(A)
class BB {
    someMethod(): void { return; }
}


//A Child class of "B" that implements interface "A"
@WestWorld.usesImplementsOf(Container, 'A')
class C extends B implements A {
    someKey: string = ''; //Note that it is very important that either a default value is declared or the property is referenced in the class' constructor, for a property of an interface you are implementing
    someOtherKey: string = '';
}

//A Child class of "B" that does not implement interface "A"
class D extends B {
    someOtherMethod(): void { return this.someMethod(); }
}

//A Child class of "D" that implements interface "A"
@WestWorld.usesImplementsOf(Container, 'A')
class E extends D {
    someKey: string = '';
    someOtherKey: string = '';
}

//A Child class of "B" that implements interface "A"
class F extends B {
    someKey: string = '';
}

//A Child class of "B" that implements Symbol "A"
@WestWorld.usesImplementsOf(A)
class G extends B {
    someKey: string = '';
}

//A Child class of "B" that incorrectly implements interface "A"
@WestWorld.usesImplementsOf(Container, 'A')
class H extends B {
    someOtherKey: string = '';
}

//A Child class of "B" that incorrectly implements interface "A", but has the correctly associated symbol
@WestWorld.usesImplementsOf(A)
class I extends B {
    someOtherKey: string = '';
}


//A Child class of "BB" that does not implement interface "A", and does not also implement it's Symbol, either
class J extends BB {
    someOtherKey: string = '';
}

//A Child class of "BB" that does not impelment interface "A", but does implement it's symbol
@WestWorld.usesImplementsOf(A)
class K extends BB {
    someOtherKey: string = '';
}


let x = new B(); //Success
let y = new C(); //Success
let z = new D(); //Exception Thrown
let aa = new E(); //Success
let ab = new F(); //Success
let ac = new G(); //Success
let ad = new H(); //Exception Thrown
let ae = new I(); //Exception Thrown
let af = new J(); //Exception Thrown
let ag = new K(); //Success
```

As you can see in the above scenarios, the `usesAbstractImplementsOf()` decorator has several applications for checking an object's contract at declaration/instantiation time. Some of the schema-based methods do not even require the child object to use the `usesImplementsOf()` decorator.

#### staticImplements() Decorator

The `staticImplements()` decorator offers additional functionality for enforcing a class to implement a contract's keys as static, as well as provide runtime checks just like any other type of interface.

```typescript
//Using the decorator like so will enfore the static contract during development/compile time, as well as satisfy classes with "usesAbstractImplementsOf" requirements for this same schema. However, without the symbol parameter, implementsOf and implementsFrom cannot be used to check for this interface
@WestWorld.staticImplements<IShogunApprentice>()
class SpecificShogun {
    public static TrainedUnder: string = 'Master Eraqus'
}

//Adding the symbol to the decorator will all for usage of implementsOf and implementsFrom when checking if an instance of this class implements the IShogunApprentice symbol
@WestWorld.staticImplements<IShogunApprenice>(IShogunApprentice)
class SomeOtherSpecificShogun {
    public static TrainedUnder: string = 'Master Xehanort';
}
```

As mentioned in the example above, the other decorators (`usesImplementsOf` & `usesAbstractImplementsOf`) can check for interfaces that are implemented as static, so long as this decorator is used on the implementing class. However, these methods do not differentiate whether the interface being evaluated is implemented as static or not.

The `staticImplements` decorator can also be stacked along with the other decorators in this library, and other class decorators as well, but **must** be at the very bottom. In fact, the order of your class decorators should go like this:

```typescript
//All Other class decorators
@WestWorld.usesAbstractImplementsOf(SomeAbstractInterface)
@WestWorld.usesImplementsOf(SomeInterface)
@WestWorld.staticImplements<SomeStaticInterface>()
class SomeClass {}
```

The reason for this heirarchy is due to mutation of the prototypes / constructors. Although the goal of this library is to mitigate mutation as much as possible, some of the code relies on being able to inject into the original constructor and change the name of it.


### A More Advanced / Pratical Example

Now that we've covered all of the different runtime & compile-time evaluations this library has to offer, I wanted to provide a more advanced example of how this module can be used.

Let's say that you want to create an abstraction that you want many different objects to be able to inherit from. However, the catch is that your object must be constructed asynchronously. Perhaps you also want to use a Factory Method that can abstractly instantiate these classes just by passing the class type as a parameter, or something along these lines. 

```typescript
//Some Source File |
//                 v

export const A = Symbol.for('A');
export interface A {
    SomeProperty: string;
    Create(): B;
}

class InterfaceContainer {
    public static A: WestWorld.toAutoImplementKeys<A> = {
        interface: A,
        keys: ['Create', 'SomeProperty']
    }
}

//Oprtionally export a custom typeguard instead, too
export const isOfA = (instance: Object) => {
    return WestWorld.implementsOf(instance, A);
};


@WestWorld.usesAbstractImplementsOf(InterfaceContainer, 'A')
export class B {
    constructor() {}

    protected static async CreateBase(a: A): Promise<B> {
        //I make some async API call here
        return new B();
    }
}

//Some Other Source File |
//                      v

@WestWorld.staticImplements<A>(A)
class C extends B {
    public static SomeProperty: string = 'Test';

    public static async Create(): Promise<C> {
        return new this(await this.CreateBase(this));
    }

    public TestProperty: string = 'Test';

    constructor(b: B) {
        //I need some data from base class instance here
        super();
    }
}


let x = C.Create().then( (v) => {
    console.log(v.TestProperty); //Test
    conosole.log(isOfA(v)); //TRUE
});
```
The possibilities are endless, and users of your abstractions will be able to circumvent ruthless bugs by being forced to comply with the contracts you've defined.

I have quite a bit more planned for this project, such as type checking of schema keys, so be sure to check back in! If you experience any issues please leave details for me to review as an Issue in the Github repository; I am still trying to account and test for as many use cases as possible with the current design.


[license-image]: https://img.shields.io/npm/l/ts-westworld
[license-url]: LICENSE

[npm-url]: https://npmjs.org/package/ts-westworld
[npm-version-image]: https://img.shields.io/npm/v/ts-westworld
[npm-downloads-image]: https://img.shields.io/npm/dw/ts-westworld
[downloads-url]: https://npmcharts.com/compare/ts-westworld?minimal=true