/*
___________________________________________________________________________________________________________________________
A Module for managing implementation evaluation of interfaces, at both compilation and runtime.

~ Chase M. Allen
Updated: 07-2020
___________________________________________________________________________________________________________________________
*/



//-----------------------------------------------------------------------------------------------
// ++ ANCHOR References
//-----------------------------------------------------------------------------------------------
import * as linq from 'linq';
import * as crypto from 'crypto';
import * as util from 'util';

import 'reflect-metadata';
//-----------------------------------------------------------------------------------------------



namespace WestWorld { //Begin Namespace

//---------------------------------------------------------------------------------------------------------------
// ++ ANCHOR Common Type Constraints
//---------------------------------------------------------------------------------------------------------------

type Constructor<T extends {} = {}> = new (...args: any[]) => T;

type KeysEnum<T> = { [P in keyof Required<T>]: boolean };
type KeysEnumPartial<T> = { [P in keyof Partial<T>]: boolean };
type KeysMatching<T, V> = {[K in keyof T]-?: T[K] extends V ? K : never}[keyof T];

type KnownKeysMatching<T, W> = {
    [K in keyof T]: string extends K ? never : number extends K ? never : K
} extends { [_ in keyof T]: infer U } ? U extends KeysMatching<T, W> ? U : never : never;

type KeysMatchingIndexSignature<T, W> = keyof Omit<Pick<T, KnownKeysMatching<T, W>>, 'prototype'>;

type FlattenIfArray<T> = T extends (infer R)[] ? R : T;

//---------------------------------------------------------------------------------------------------------------



//---------------------------------------------------------------------------------------------------------------
// ++ ANCHOR Internal interface and type Declarations
//---------------------------------------------------------------------------------------------------------------

type toAutoImplementGeneric<T extends {}> = [Symbol, T];
type toAutoImplementPattern<T> = KeysMatchingIndexSignature<T, toAutoImplementGeneric<{}>>;

type toAutoImplement<T> = toAutoImplementGeneric<KeysEnum<T>>;
type toAutoImplementPartial<T> = toAutoImplementGeneric<KeysEnumPartial<T>>;

type toAutoImplementKeys<T extends Object> = { interface: Symbol, keys: (keyof T)[]}
type toAutoImplementKeysPattern<T> = KeysMatchingIndexSignature<T, toAutoImplementKeys<any>>;


type IndexablePatternKey<T> =
    T extends IndexableAutoImplementDefs ? toAutoImplementPattern<T> :
    T extends IndexableAutoImplementKeys ? toAutoImplementKeysPattern<T> :
    toAutoImplementPattern<T> | toAutoImplementKeysPattern<T>;


type IndexableTypeKeyOverload<T> = 
    T extends IAutoImplementIndexable ? toAutoImplementGeneric<{}> : 
    T extends IAutoImplementIndexableKeys ? toAutoImplementKeys<any> : toAutoImplementGeneric<{}>;

type IndexableKeysForSchema<T, U> = toAutoImplementPattern<T> extends never ? toAutoImplementPattern<U> : toAutoImplementPattern<T>;
type IndexableKeys<T, U> = toAutoImplementKeysPattern<T> extends never ? toAutoImplementKeysPattern<U> : toAutoImplementKeysPattern<T>;

type IndexableTypeKeysArrayOverload<T, U> = 
    T extends IAutoImplementIndexable ? IndexableKeysForSchema<T, U>[] :
    T extends IAutoImplementIndexableKeys ? IndexableKeys<T, U>[] : 
    (toAutoImplementPattern<U> | toAutoImplementKeysPattern<U>)[];


const __autoImplement_name: string = '__autoImplement';
interface IAutoImplement {
    __autoImplement: Symbol;
}

interface IAutoImplementIndexable {
    [key: string]: toAutoImplementGeneric<{}>;
}

interface IAutoImplementIndexableKeys {
    [key: string]: toAutoImplementKeys<any>;
}


const __staticImplements: Symbol = Symbol.for('__staticImplements');
const __staticImplements_name: string = '__staticImplements';

const STATIC_IMPLEMENT_LINKS = new Map<any, string[]>();

interface IStaticImplementsSymbol {
    __staticImplements: Symbol;
    __staticImplementsKeys: string[];
    __staticImplementsHashes: string[];
    __staticImplementsSymbols: Symbol[];
}


interface IImplementsofSymbol {
    __implementsof_symbol: Symbol[];
}

//---------------------------------------------------------------------------------------------------------------



//---------------------------------------------------------------------------------------------------------------
// ++ ANCHOR Namespace Exports
//---------------------------------------------------------------------------------------------------------------

export declare class IndexableAutoImplementDefs implements IAutoImplementIndexable {
    [key: string]: toAutoImplementGeneric<{}>;
};

export declare class IndexableAutoImplementKeys implements IAutoImplementIndexableKeys {
    [key: string]: toAutoImplementKeys<any>;
};

export declare const GetSymbol: 
    <T extends IndexableAutoImplementDefs | IndexableAutoImplementKeys>(target: T, key: IndexablePatternKey<T>) => Symbol;
export declare const GetSchema: 
    <T extends IndexableAutoImplementDefs | IndexableAutoImplementKeys>(target: T, key: IndexablePatternKey<T>) => Object;

export declare function staticImplements<T>(): <U extends T>(constructor: U) => U;
export declare function staticImplements<T>(symbol: T): <U extends T>(constructor: U) => U;
export declare function staticImplements<T>(symbol: Symbol): <U extends T>(constructor: U) => U;

export declare const implementsOf: (instance: Object, implemented: Symbol) => boolean;
export declare const implementsFrom: 
    <T extends IndexableAutoImplementDefs | IndexableAutoImplementKeys>(type: T, instance: Object, implemented: IndexablePatternKey<T>) => boolean;

export declare function usesImplementsOf
    <T, U extends KnownKeysMatching<T, IndexableTypeKeyOverload<T>> | (new () => T)>(target: (new () => T) | U, 
    ...keys: IndexableTypeKeysArrayOverload<T, U>);
export declare function usesImplementsOf<T extends (new () => IAutoImplement)>(listType: T, ...interfaces: Symbol[]):
    <W extends new (...args: any[]) => {}>(constructor: W) => any;
export declare function usesImplementsOf(...interfaces: toAutoImplementGeneric<{}>[]):
    <W extends new (...args: any[]) => {}>(constructor: W) => any;
export declare function usesImplementsOf(...interfaces: Symbol[]):
    <W extends new (...args: any[]) => {}>(constructor: W) => any;

export declare function usesAbstractImplementsOf
    <T, U extends KnownKeysMatching<T, IndexableTypeKeyOverload<T>> | (new () => T)>(target: (new () => T) | U, 
    ...keys: IndexableTypeKeysArrayOverload<T, U>);
export declare function usesAbstractImplementsOf<T extends (new () => IAutoImplement)>(listType: T, ...interfaces: Symbol[]):
    <W extends new (...args: any[]) => {}>(constructor: W) => any;
export declare function usesAbstractImplementsOf(...interfaces: toAutoImplementGeneric<{}>[]):
    <W extends new (...args: any[]) => {}>(constructor: W) => any;
export declare function usesAbstractImplementsOf(...interfaces: Symbol[]):
    <W extends new (...args: any[]) => {}>(constructor: W) => any

export declare function autoImplement<T>(toImplement: toAutoImplement<T>): new () => IAutoImplement;
export declare function autoImplement<T>(toImplement: toAutoImplementPartial<T>): new () => IAutoImplement;

export declare const ImplementOfPatternFactory: (...interfaces: (new () => IAutoImplement)[]) => new () => IAutoImplement;

//---------------------------------------------------------------------------------------------------------------



//---------------------------------------------------------------------------------------------------------------
// ++ ANCHOR Namespace Exporter Factory
//---------------------------------------------------------------------------------------------------------------

(function (this: any, factory: (exporter: <K extends keyof typeof WestWorld>(key: K, value: typeof WestWorld[K]) => void) => void) {
    const root = typeof global === 'object' ? global :
        typeof self === 'object' ? self :
        typeof this === 'object' ? this :
        Function('return this;')();

    let exporter = makeExporter(WestWorld);
    if (typeof root.WestWorld === 'undefined') {
        root.WestWorld = WestWorld;
    } else {
        exporter = makeExporter(root.WestWorld, exporter);
    }

    factory(exporter);

    function makeExporter(target: typeof WestWorld, previous?: <K extends keyof typeof WestWorld>(key: K, value: typeof WestWorld[K]) => void) {
        return <K extends keyof typeof WestWorld>(key: K, value: typeof WestWorld[K]) => {
            if (typeof target[key] !== "function") {
                Object.defineProperty(target, key, { configurable: true, writable: true, value });
            }
            if (previous) previous(key, value);
        };
    }
})//Do NOT put a semicolon here

//---------------------------------------------------------------------------------------------------------------



(function (exporter) { //Begin Exporter Factory

//---------------------------------------------------------------------------------------------------------------
// ++ ANCHOR General Methods
//---------------------------------------------------------------------------------------------------------------

function safeAppend(prop: any[], item: any): any[] {
    if (!prop || !(prop instanceof Array)) {
        if (item instanceof Array) {
            prop = item;
        } else { prop = [item]; }
    } else {
        if (item instanceof Array) {
            prop.push(...item);
        } else { prop.push(item); }
    } return prop;
}

function GetHashFromString(text: string): string {
    const msgUint8 = new util.TextEncoder().encode(text);
    return crypto.createHash('sha256').update(msgUint8).digest('hex');
}

//---------------------------------------------------------------------------------------------------------------



//---------------------------------------------------------------------------------------------------------------
// ++ ANCHOR Constructor Metadata Methods
//---------------------------------------------------------------------------------------------------------------

function GetConstructorHash<T>(ctor: Constructor<T>): string {
    return GetHashFromString(ctor.toString());
}

const GetConstructorClassName = <T>(ctor: Constructor<T>): string => {
    try {
        return ctor.toString().match(/(?<=class ).*.(?= [a-z])|(?<=class ).*.(?= {)/gm)[0];
    } catch { 
        try {
            return ctor.toString().match(/(?<=function ).*.(?= [a-z])|(?<=function ).*.(?=\()/m)[0];
        } catch {
            return ctor.name;
        }
    }
}

const GetStaticMethods = <T>(ctor: Constructor<T>): string[] => {
    try {
        return Array.from(ctor.toString().match(/(?<=static ).*.(?=\()|(?<=static async ).*.(?=\()/gm));
    } catch { return null; }
}

//---------------------------------------------------------------------------------------------------------------



//---------------------------------------------------------------------------------------------------------------
// ++ ANCHOR Static Implementation Decorator
//---------------------------------------------------------------------------------------------------------------

function InitStaticImplement(hash: string, keys: string[]) {
    if (!STATIC_IMPLEMENT_LINKS.has(hash)) {
		STATIC_IMPLEMENT_LINKS.set(hash, []);
	}
	STATIC_IMPLEMENT_LINKS.get(hash)!.push(...keys);
}

function CheckStaticImplement(hash: string): string[] {
    if (STATIC_IMPLEMENT_LINKS.has(hash)) {
        return STATIC_IMPLEMENT_LINKS.get(hash);
    } return null;
}


function staticImplements<T>(symbol: Symbol = undefined) {
    return (<U extends T>(constructor: U) => {

        const original = <Constructor><unknown>constructor;
        const ctor_types = Reflect.getMetadata('design:paramtypes', constructor);

        const static_symbol = symbol;
        const static_keys = Object.keys(constructor);
        const static_hash = GetHashFromString(static_keys.toString());

        const static_methods = GetStaticMethods(original);
        if (static_methods) { static_keys.push(...static_methods); }

        const hash = GetConstructorHash(original) + '*' + GetConstructorClassName(original);
        InitStaticImplement(hash, static_keys);

        let anon = class extends original implements IStaticImplementsSymbol {
            public __staticImplements: Symbol;
            public __staticImplementsKeys: string[];
            public __staticImplementsHashes: string[];
            public __staticImplementsSymbols: Symbol[];

            constructor(...args) {
                if (ctor_types === undefined) {
                    super();
                } else { 
                    super(...args);
                }

                this.__staticImplements = __staticImplements;
                this.__staticImplementsKeys = static_keys;

                this.__staticImplementsHashes = safeAppend(this.__staticImplementsHashes, static_hash);
                if (static_symbol !== undefined) {
                    this.__staticImplementsSymbols = safeAppend(this.__staticImplementsSymbols, static_symbol);
                }
            }
        } as unknown;

        Object.defineProperty(anon, 'name', {value: hash, configurable: true});
        return <U>anon;
    });
}
exporter('staticImplements', staticImplements);

//---------------------------------------------------------------------------------------------------------------



//---------------------------------------------------------------------------------------------------------------
// ++ ANCHOR ImplementsOf Const & Object Keys Evaluations
//---------------------------------------------------------------------------------------------------------------

const implementsOf = (instance: Object, implemented: Symbol): boolean => {
    if (!instance) { return false; }
    return CheckImplementsOf(instance, implemented) || CheckStaticImplementsOf(instance, implemented);
};
exporter('implementsOf', implementsOf);


const implementsFrom = 
<T extends IndexableAutoImplementDefs | IndexableAutoImplementKeys>(type: T, 
instance: Object, implemented: IndexablePatternKey<T>): boolean => {
    if (!instance) { return false; }
    let symbol = GetSymbol(type, implemented);
    return implementsOf(instance, symbol);
};
exporter('implementsFrom', implementsFrom);


function CheckImplementsOf(instance: Object, implemented: Symbol): boolean {
    if ((<IImplementsofSymbol>instance).__implementsof_symbol) {
        return linq.from((<IImplementsofSymbol>instance).__implementsof_symbol).count( (i) => {
            return i === implemented;
        }) > 0;
    }
}

function CheckStaticImplementsOf(instance: Object, implemented: Symbol): boolean {
    if ((<IStaticImplementsSymbol>instance).__staticImplements) {
        return linq.from((<IStaticImplementsSymbol>instance).__staticImplementsSymbols).count( (i) => {
            return i === implemented;
        }) > 0;
    }
}


function CheckForStaticKeys(target: Object, prototypeName: string, key: string): boolean {
    try {
        const static_keys = (CheckStaticImplement(prototypeName)) ||
        ((<IStaticImplementsSymbol>(target)).__staticImplements ? 
            (<IStaticImplementsSymbol>(target)).__staticImplementsKeys : null);

        if (static_keys) {
            let matches = linq.from(static_keys).count( (s) => {
                return s == key;
            });
            if (matches > 0) { return true; }
        } return false;
    } catch { return false; } 
}

function CheckPrototypeForStaticKey(target: Object, key: string): boolean {
    try {
        let prototypeKeys = Object.keys((<Object>Reflect.getPrototypeOf(target)).constructor);
        if (prototypeKeys) {
            let matches = linq.from(prototypeKeys).count( (s) => {
                return s == key;
            });
            if (matches > 0) { return true; }
        } return false;
    } catch { return false; }
}


class IndexableAutoImplementDefs implements IAutoImplementIndexable {
    [key: string]: toAutoImplementGeneric<{}>;
}
exporter('IndexableAutoImplementDefs', IndexableAutoImplementDefs);

class IndexableAutoImplementKeys implements IAutoImplementIndexableKeys {
    [key: string]: toAutoImplementKeys<any>;
} exporter('IndexableAutoImplementKeys', IndexableAutoImplementKeys);



const GetSymbol = <T extends IndexableAutoImplementDefs | IndexableAutoImplementKeys>(target: T, key: IndexablePatternKey<T>): Symbol => {
    let item = target[key][0];
    if (item === undefined) {
        return (<IndexableAutoImplementKeys>target)[key as string].interface;
    } return target[key][0];
}
exporter('GetSymbol', GetSymbol);

const GetSchema = <T extends IndexableAutoImplementDefs | IndexableAutoImplementKeys>(target: T, key: IndexablePatternKey<T>): Object => {
    let item = target[key][1];
    if (item === undefined) {
        let _item = KeysToSchemaFactory(target[key]);
        return _item[1];
    } return target[key][1];
}
exporter('GetSchema', GetSchema);

//---------------------------------------------------------------------------------------------------------------



//---------------------------------------------------------------------------------------------------------------
// ++ ANCHOR ImplementsOf Pattern Decorators
//---------------------------------------------------------------------------------------------------------------

type _usesImplementsOf_overload_genericType<T> = (T extends (new () => infer R) ? R : T);
type GenericIndexableAutoImplementDefs<T> = T extends IndexableAutoImplementDefs ? T : never;
type GenericIndexableAutoImplementKeys<T> = T extends IndexableAutoImplementKeys ? T : never;


//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
function usesImplementsOf<T extends (new () => IAutoImplement)>(listType: T, ...interfaces: Symbol[]): <W extends new (...args: any[]) => {}>(constructor: W) => any;
function usesImplementsOf(...interfaces: toAutoImplementGeneric<{}>[]): <W extends new (...args: any[]) => {}>(constructor: W) => any;
function usesImplementsOf(...interfaces: Symbol[]): <W extends new (...args: any[]) => {}>(constructor: W) => any;
function usesImplementsOf<T>(a: _usesImplementsOf_overload_genericType<T> | (Symbol[] | Symbol) | FlattenIfArray<T>[], b: any | any[]) {
    let overloaded = _usesImplementsOf_resolveOverload<T>(a, b);

    var listType: T = overloaded[0] as T;
    var interfaces: Symbol[] = overloaded[1];

    return function _usesImplementsOf<W extends { new (...args: any[]): {} }>(constructor: W) {
        const original = constructor;
        const ctor_types = Reflect.getMetadata('design:paramtypes', constructor);

        const prototypeName = GetConstructorClassName(original);

        if (listType !== undefined) {
            let list = new ((<unknown>listType) as (new () => T))();

            if (interfaces === undefined) {
                interfaces = [];
                for (let key in list) {
                    interfaces.push((list[key])[__autoImplement_name] as Symbol);
                }
            }

            let thisItem = new original();
            for (let key in list) {
                let xx: unknown = <unknown>(list[key]);
                if (interfaces.includes((<IAutoImplement>xx).__autoImplement)) {
                    for (let subKey in <any>xx) {
                        if (thisItem[subKey] == undefined && subKey != __autoImplement_name) {

                            const _prototypeName = (<Object>Reflect.getPrototypeOf(thisItem)).constructor.name;

                            if (CheckForStaticKeys(thisItem, prototypeName, subKey)) { continue; }

                            if (original.toString().includes('extends ' + GetConstructorClassName(original))) {
                                continue;
                            }

                            //if (original.name == prototypeName && _prototypeName == prototypeName && (<Object>thisItem).constructor.name == prototypeName) {
                                //continue;
                            //}

                            //logConstructorMeta(original, thisItem, prototypeName, subKey);

                            throw new Error('Interface ' + key + ' is not implemented in class ' + 
                                prototypeName + ' because key ' + subKey + ' was not found');

                        }
                    }
                }
            }
        }

        let anon = class extends constructor implements IImplementsofSymbol {
            public __implementsof_symbol: Symbol[];
            constructor(...args: any[]) {
                if (ctor_types === undefined) {
                    super();
                } else { super(...args); }

                this.__implementsof_symbol = safeAppend(this.__implementsof_symbol, interfaces);
            }
        }

        Object.defineProperty(anon, 'name', {value: prototypeName, configurable: true});
        return anon;
    }
}
exporter('usesImplementsOf', usesImplementsOf);
//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&


//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
function usesAbstractImplementsOf<T extends (new () => IAutoImplement)>(listType: T, ...interfaces: Symbol[]): <W extends new (...args: any[]) => {}>(constructor: W) => any;
function usesAbstractImplementsOf(...interfaces: toAutoImplementGeneric<{}>[]): <W extends new (...args: any[]) => {}>(constructor: W) => any;
function usesAbstractImplementsOf(...interfaces: Symbol[]): <W extends new (...args: any[]) => {}>(constructor: W) => any;
function usesAbstractImplementsOf<T>(a: _usesImplementsOf_overload_genericType<T> | (Symbol[] | Symbol) | FlattenIfArray<T>[], b: any) {
    let overloaded = _usesImplementsOf_resolveOverload<T>(a, b);

    var listType: T = overloaded[0] as T;
    var interfaces: Symbol[] = overloaded[1];

    return function _usesAbstractImplementsOf<W extends { new (...args: any[]): {} }>(constructor: W) {
        const original = constructor;
        const ctor_types = Reflect.getMetadata('design:paramtypes', constructor);

        const originalPrototypeName = GetConstructorClassName(original);

        let anon = class extends constructor implements IImplementsofSymbol {
            public __implementsof_symbol: Symbol[];

            constructor(...args: any[]) {

                if (ctor_types === undefined) {
                    super();
                } else { super(...args); }

                this.__implementsof_symbol = safeAppend(this.__implementsof_symbol, interfaces);

                const prototypeName: string = (<Object>Reflect.getPrototypeOf(this)).constructor.name;
                if (prototypeName && prototypeName != originalPrototypeName) {
                    let list = new ((<unknown>listType) as (new () => T))();

                    if (interfaces === undefined) {
                        interfaces = [];
                        for (let key in list) {
                            interfaces.push((list[key])[__autoImplement_name] as Symbol);
                        }
                    }

                    let thisItem = new original();
                    for (let key in list) {

                        let xx: unknown = <unknown>(list[key]);
                        if (interfaces.includes((<IAutoImplement>xx).__autoImplement)) {

                            for (let subKey in <any>xx) {
                                if (xx[subKey]) {
                                    if (thisItem[subKey] == undefined && subKey != __autoImplement_name) {

                                        if (CheckForStaticKeys(this, prototypeName, subKey)) { continue; }
                                        if (CheckPrototypeForStaticKey(this, subKey)) { continue; }

                                        if (this.__implementsof_symbol.includes((<IAutoImplement>xx).__autoImplement)) {
                                            if ((<Object>Reflect.getPrototypeOf(this)).constructor.toString().includes('extends ' + GetConstructorClassName(original))) {
                                                //console.log('TEST1' + ' : ' + subKey);
                                                continue;
                                            }

                                            //if ((<Object>Reflect.getPrototypeOf(this)).constructor.toString().includes('this.__implementsof_symbol =')) {
                                                //console.log('TEST2' + ' : ' + subKey);
                                                //continue;
                                            //}

                                            if (CheckAllPrototypesForKey(this, subKey)) {
                                                //console.log('TEST3' + ' : ' + subKey);
                                                continue;
                                            }

                                            if (CheckStackForStaticKey(this, subKey)) {
                                                //console.log('TEST4' + ' : ' + subKey);
                                                continue;
                                            }

                                        } //logConstructorMeta(original, this, prototypeName, subKey);

                                        throw new Error('Interface ' + key + ' is not implemented in class ' + 
                                            prototypeName + ' because key ' + subKey + ' was not found');
                                    } else { 
                                        //logConstructorMeta(original, this, prototypeName, subKey, 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'); 
                                    }
                                }
                            }

                        }
                    }
                }

            }
        }

        Object.defineProperty(anon, 'name', {value: originalPrototypeName, configurable: true});
        return anon;
    } as <W extends new (...args: any[]) => {}>(constructor: W) => any;
}
exporter('usesAbstractImplementsOf', usesAbstractImplementsOf);
//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&


function getProtoTypeChain(obj: Object): Object[] {
    var cs: Object[] = [], pt: Object = obj;
    do {
        if (pt = (<Object>Reflect.getPrototypeOf(pt))) { 
            if (pt.constructor.name != 'Object') {
                cs.push(pt || null); 
            }
        }
    } while (pt != null);
    return cs;
}

function CheckAllPrototypesForKey(me: Object, key: string): boolean {
    let protos = getProtoTypeChain(me);
    for (let proto of protos) {
        let ctor = proto.constructor.toString();
        if (!ctor.includes('__implementsof_symbol =')) {
            let hasKey = linq.from(Object.getOwnPropertyNames(proto)).count( (_key: string) => {
                return _key == key;
            }) > 0;
            if (hasKey) { return true; }
        }
    } return false
}

function CheckStackForStaticKey(me: Object, key: string): boolean {
    let stack = (new Error()).stack;
    if (stack) {
        let meIndex = stack.indexOf('at new ' + me.constructor.name);
        stack = stack.substring(meIndex);

        let r = new RegExp(/(?<constructor>.*?(?<=(at new \b(?<hash>[A-Fa-f0-9]{64})\b)))(?<className>.*?((?<=(at new \b[A-Fa-f0-9]{64}\b)\*).*.(?=\s\()))/gm)
        let matches = stack.match(r);
        if (matches && matches.length > 0) {
            for (let match of matches) {
                if (CheckForStaticKeys(me, match.trim().replace('at new ', ''), key)) {
                    return true;
                }
            }
        }
    } return false;
}


function logConstructorMeta(original: Constructor, me: Object, prototypeName: string, subKey: string, custom: string = undefined) {
    console.log();
    if (custom) { console.log(custom); }

    console.log(subKey);
    console.log(GetConstructorClassName(original));
    console.log(prototypeName);
    console.log((<Object>me).constructor.name);

    console.log();
    if (custom) { console.log(custom); }

    console.log(original.toString());
    console.log((<Object>Reflect.getPrototypeOf(me)).constructor.toString());
    console.log((<Object>me).constructor.toString());

    console.log();
    if (custom) { console.log(custom); }
}


function _usesImplementsOf_resolveOverload<T>(a: any, b: any): [_usesImplementsOf_overload_genericType<T>, Symbol[]] {
    var listType: _usesImplementsOf_overload_genericType<T>;
    var interfaces: Symbol[];

    const IsAToAutoImplements = () => {
        let _a: toAutoImplementGeneric<KeysEnumPartial<T>>[] = a;
        let __a: (new () => IAutoImplement)[] = [];
        let _interfaces: Symbol[] = [];

        if (typeof _a[0] !== 'symbol') {
            _a.forEach( (tuple) => {
                let _listType = autoImplement<T>(tuple);
                __a.push(_listType);
                _interfaces.push(tuple[0]);
            });
        } else {
            __a.push(autoImplement<T>(a));
            _interfaces.push(a[0]);
        }

        listType = ImplementOfPatternFactory(...__a) as _usesImplementsOf_overload_genericType<T>;
        interfaces = _interfaces;
    }

    const GetSymbolsFromIndex = (index: GenericIndexableAutoImplementDefs<T> | GenericIndexableAutoImplementKeys<T>, ...filter: string[]) => {
        let symbols: Symbol[] = [];
        for (let key in index) {
            if (filter.includes(key)) {
                symbols.push(GetSymbol(index, key as any));
            }
        } return symbols;
    };

    if (a instanceof Array || typeof a === 'symbol') {

        if (typeof a === 'symbol' || (a instanceof Array && !(a.length > 1 && a[1] instanceof Array))) {

            listType = undefined;
            if (a instanceof Array) {
                if (typeof a[0] !== 'symbol') {
                    interfaces = a as Symbol[];
                } else {
                    IsAToAutoImplements();
                }
            } else {
                interfaces = [a as Symbol];
            }

        } else if ((a instanceof Array && (a.length > 1 && a[1] instanceof Array))) {
            IsAToAutoImplements();
        }

    } else {

        listType = a;
        if (b === undefined) {
            interfaces = undefined;
            if (typeof a == 'function') {
                let _a = Object.keys(a).length < 1 ? new a() : a;
                if (_a[Object.keys(_a)[0]].__autoImplement === undefined) {
                    listType = ImplementOfPatternFactory_FromIndex<GenericIndexableAutoImplementDefs<T>>(_a, undefined) as _usesImplementsOf_overload_genericType<T>;
                }
            }
        } else {
            if (b instanceof Array) {
                if (typeof b[0] == 'symbol') {
                    interfaces = b as Symbol[];
                } else {
                    let _a = Object.keys(a).length < 1 ? new a() : a;
                    let needsSchema = typeof b[0] == 'string';

                    listType = !needsSchema ?
                        ImplementOfPatternFactory_FromIndex<GenericIndexableAutoImplementDefs<T>>(_a, ...(b as any[])) as _usesImplementsOf_overload_genericType<T> :
                        ImplementOfPatternFactory_FromIndexKeys<GenericIndexableAutoImplementKeys<T>>(_a, ...(b as any[])) as _usesImplementsOf_overload_genericType<T>;
                    interfaces = GetSymbolsFromIndex(_a, ...(b as string[]));
                }
            } else {
                if (typeof b == 'symbol') {
                    interfaces = [b as Symbol];
                } else {
                    let _a = Object.keys(a).length < 1 ? new a() : a;
                    let needsSchema = typeof b == 'string';

                    listType = !needsSchema ?
                        ImplementOfPatternFactory_FromIndex<GenericIndexableAutoImplementDefs<T>>(_a, b as any) as _usesImplementsOf_overload_genericType<T> :
                        ImplementOfPatternFactory_FromIndexKeys<GenericIndexableAutoImplementKeys<T>>(_a, b as any) as _usesImplementsOf_overload_genericType<T>;
                    interfaces = GetSymbolsFromIndex(_a, ...[b as string]);
                }
            }
        }

    }

    return [listType, interfaces];
}

//---------------------------------------------------------------------------------------------------------------



//---------------------------------------------------------------------------------------------------------------
// ++ ANCHOR AutoImplement Pattern Methods
//---------------------------------------------------------------------------------------------------------------

function autoImplement<T>(toImplement: toAutoImplement<T>): new () => IAutoImplement;
function autoImplement<T>(toImplement: toAutoImplementPartial<T>): new () => IAutoImplement;
function autoImplement<T>(toImplement: toAutoImplement<T> | toAutoImplementPartial<T>) {
    return class implements IAutoImplement {
        __autoImplement: Symbol;
        constructor() {
            this.__autoImplement = toImplement[0];

            for(let key in toImplement[1]) {
                this[key as string] = toImplement[1][key];
            }
        }
    } as new () => IAutoImplement;
}
exporter('autoImplement', autoImplement);


const ImplementOfPatternFactory = (...interfaces: (new () => IAutoImplement)[]) => {
    return class {
        constructor() {
            for(let _interface of interfaces) {
                let instance = new class extends _interface {
                    constructor() {
                        super();
                    }
                }();

                if (instance.__autoImplement === undefined) {
                    continue;
                }

                let anon = new class {
                    constructor(keys: string[], sym: Symbol) {
                        for (let key of keys) {
                            if (key != __autoImplement_name) {
                                this[key] = instance[key];
                            } else {
                                this[key] = sym;
                            }
                        }
                    }
                }(Object.keys(instance), instance.__autoImplement)

                this[instance.__autoImplement.toString()] = anon;
            }
        }
    } as new () => IAutoImplement;
}
exporter('ImplementOfPatternFactory', ImplementOfPatternFactory);


const ImplementOfPatternFactory_FromIndex = 
<T extends IndexableAutoImplementDefs>(target: T, ...keys: toAutoImplementPattern<T>[]): new () => IAutoImplement => {
    if (keys === undefined || !(keys instanceof Array) || (keys instanceof Array && (keys.length == 0 || keys[0] === undefined))) {
        let keys = Object.keys(target);
        if (keys == []) { return null; }
        return ImplementOfPatternFactory_FromIndex(target, ...keys as toAutoImplementPattern<T>[]);
    }

    if (keys instanceof Array && keys.length > 1) {
        let list: (new () => IAutoImplement)[] = [];
        for (let key of keys) {
            let item = target[key];
            list.push(autoImplement(item as toAutoImplementGeneric<unknown>));
        } return ImplementOfPatternFactory(...list);

    } else {
        return ImplementOfPatternFactory(
            autoImplement(target[keys[0]] as toAutoImplementGeneric<unknown>)
        );
    }
}

const KeysToSchemaFactory = (item: toAutoImplementKeys<any>) => {
    let schema = new class {
        constructor() {
            for(let key of item.keys) {
                this[key] = true;
            }
        }
    }();

    return [item.interface, schema] as toAutoImplementGeneric<{}>;
}

const ImplementOfPatternFactory_FromIndexKeys = 
<T extends IndexableAutoImplementKeys>(target: T, ...keys: toAutoImplementKeysPattern<T>[]): new () => IAutoImplement => {
    if (keys === undefined || !(keys instanceof Array) || (keys instanceof Array && (keys.length == 0 || keys[0] === undefined))) {
        let keys = Object.keys(target);
        if (keys == []) { return null; }
        return ImplementOfPatternFactory_FromIndexKeys(target, ...keys as toAutoImplementKeysPattern<T>[]);
    }

    if (keys instanceof Array && keys.length > 1) {
        let list: (new () => IAutoImplement)[] = [];
        for (let key of keys) {
            let item = KeysToSchemaFactory(target[key]);
            list.push(autoImplement(item as toAutoImplementGeneric<unknown>));
        } return ImplementOfPatternFactory(...list);

    } else {
        let item = KeysToSchemaFactory(target[keys[0]]);
        return ImplementOfPatternFactory(
            autoImplement(item as toAutoImplementGeneric<unknown>)
        );
    }
}

//---------------------------------------------------------------------------------------------------------------

}); //End of Exporter Factory

} // End of Namespace