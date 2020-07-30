//=======================================
//import 'reflect-metadata';
import 'ts-westworld';
//=======================================
let t1 = process.hrtime();


//-------------------------------------------------------------------------------------------------------
enum AttackStyle {
    TwoHanded,
    OneHanded,
    Melee
}


interface IWarrior {
    Style: AttackStyle;
    attack(): void;
    Someprop: boolean;
} const IWarrior = Symbol.for('IWarrior');

interface IShogun_Static {
    TrainedUnder: string;
    MasterAttack(): void;
} const IShogun_Static = Symbol.for('IShogun_Static');

interface IShogun {
    specialAttack(someArgument: boolean): void;
} const IShogun = Symbol.for('IShogun');
//-------------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------------
const Interfaces = WestWorld.ImplementOfPatternFactory(
    WestWorld.autoImplement<IWarrior>([
        IWarrior, { Style: true, attack: true, Someprop: true }
    ]),
    WestWorld.autoImplement<IShogun>([
        IShogun, {specialAttack: true}
    ]),
    WestWorld.autoImplement<IShogun_Static>([
        IShogun_Static, { TrainedUnder: true, MasterAttack: true }
    ])
)

class Interfaces2 {
    public static IWarrior: WestWorld.toAutoImplementPartial<IWarrior> = [
        IWarrior, { Style: true, Someprop: true }];

    public static IShogun: WestWorld.toAutoImplement<IShogun> = [
        IShogun, { specialAttack: true }];

    public static NotAnInterface: string = '';
}

class Interfaces3 extends WestWorld.IndexableAutoImplementDefs {
    public IWarrior: WestWorld.toAutoImplement<IWarrior> = [
        IWarrior, { Style: true, attack: true, Someprop: true }];

    public IShogun: WestWorld.toAutoImplement<IShogun> = [
        IShogun, { specialAttack: true }];

    public IShogun_Static: WestWorld.toAutoImplement<IShogun_Static> = [
        IShogun, { TrainedUnder: true, MasterAttack: true }];
}

class Interfaces4 extends WestWorld.IndexableAutoImplementKeys {
    public IWarrior = {
        interface: IWarrior,
        keys: <(keyof IWarrior)[]>['Style', 'attack']
    };

    public IShogun: WestWorld.toAutoImplementKeys<IShogun> = {
        interface: IShogun,
        keys: ['specialAttack']
    }
}

class Interfaces5 {
    public static IWarrior = {
        interface: IWarrior,
        keys: <(keyof IWarrior)[]>['Style', 'attack']
    };

    public static IShogun: WestWorld.toAutoImplementKeys<IShogun> = {
        interface: IShogun,
        keys: ['specialAttack']
    }
}
//-------------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------------
@WestWorld.usesAbstractImplementsOf(Interfaces, IShogun_Static)
class AnyShogun {
    public SomeString: string;
}

@WestWorld.usesImplementsOf(Interfaces5, 'IShogun')
class Ninja extends AnyShogun {

    public Name: string = 'John Doe';

    public specialAttack(): void {
        return;
    }

}

//@WestWorld.usesAbstractImplementsOf(Interfaces, IShogun_Static)
class MiddleClassTest extends Ninja {

}


//@WestWorld.usesImplementsOf(Interfaces, IShogun_Static)
@WestWorld.staticImplements<IShogun_Static>(IShogun_Static)
class SpecificNinja extends MiddleClassTest {
    public static TrainedUnder: string = 'Master Eraqus';

    public static MasterAttack(): void {
        return;
    }

    constructor() {
        super();
        console.log(this['__staticImplementsKeys']);
    }
}


interface A {
    SomeProperty: string;
    Create(): B;
} const A = Symbol.for('A');

class InterfacesContainer {
    public static A: WestWorld.toAutoImplementKeys<A> = {
        interface: A,
        keys: ['Create', 'SomeProperty']
    }
}

@WestWorld.usesAbstractImplementsOf(InterfacesContainer, 'A')
class B {
    constructor() {}

    protected static CreateBase(a: A): B {
        return new B();
    }
}

@WestWorld.staticImplements<A>(A)
class C extends B {
    public static SomeProperty: string = 'Test';

    public static async Create(): Promise<C> {
        return new this(this.CreateBase(this));
    }

    public TestProperty: string = 'Test';

    constructor(b: B) {
        super();
    }
}
//-------------------------------------------------------------------------------------------------------


let t2 = process.hrtime(t1);
console.log('Build took ' + (((t2[0] * 1e3 )+ t2[1]) * 1e-6) + ' milliseconds');
console.log('Build Time Complete');

t1 = process.hrtime();

//let x = new SpecificNinja();
let x = C.Create().then( (v) => {
    console.log(v.TestProperty);
});

t2 = process.hrtime(t1);
console.log('Constructor took ' + (((t2[0] * 1e3 )+ t2[1]) * 1e-6) + ' milliseconds');


//let con = new Interfaces4();

//console.log(WestWorld.implementsOf(x, IShogun_Static));
//console.log(WestWorld.implementsOf(x, Symbol.for('IShogun')));

//console.log(WestWorld.implementsFrom(con, x, 'IShogun'));