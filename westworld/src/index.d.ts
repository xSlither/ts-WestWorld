export { };

declare global {

    //=========================================================================================================
    type KeysEnum<T> = { [P in keyof Required<T>]: boolean };
    type KeysEnumPartial<T> = { [P in keyof Partial<T>]: boolean };
    type KeysMatching<T, V> = {[K in keyof T]-?: T[K] extends V ? K : never}[keyof T];

    type KnownKeysMatching<T, W> = {
        [K in keyof T]: string extends K ? never : number extends K ? never : K
    } extends { [_ in keyof T]: infer U } ? U extends KeysMatching<T, W> ? U : never : never;
    
    type KeysMatchingIndexSignature<T, W> = keyof Omit<Pick<T, KnownKeysMatching<T, W>>, 'prototype'>;
    //=========================================================================================================

    namespace WestWorld {

        interface IAutoImplement {
            __autoImplement: Symbol;
        }

        interface IAutoImplementIndexable {
            [key: string]: toAutoImplementGeneric<{}>;
        }

        interface IAutoImplementIndexableKeys {
            [key: string]: toAutoImplementKeys<any>;
        }

        type toAutoImplementGeneric<T extends {}> = [Symbol, T];

        type toAutoImplement<T> = toAutoImplementGeneric<KeysEnum<T>>;
        type toAutoImplementPartial<T> = toAutoImplementGeneric<KeysEnumPartial<T>>;

        type toAutoImplementPattern<T> = KeysMatchingIndexSignature<T, toAutoImplementGeneric<{}>>;

        type toAutoImplementKeys<T extends Object> = { interface: Symbol, keys: (keyof T)[]}
        type toAutoImplementKeysPattern<T> = KeysMatchingIndexSignature<T, toAutoImplementKeys<any>>;

        class IndexableAutoImplementDefs implements IAutoImplementIndexable {
            [key: string]: toAutoImplementGeneric<{}>;
        }

        class IndexableAutoImplementKeys implements IAutoImplementIndexableKeys {
            [key: string]: toAutoImplementKeys<any>;
        }

        type IndexablePatternKey<T> =
            T extends IndexableAutoImplementDefs ? toAutoImplementPattern<T> :
            T extends IndexableAutoImplementKeys ? toAutoImplementKeysPattern<T> :
            toAutoImplementPattern<T> | toAutoImplementKeysPattern<T>;


        const GetSymbol: 
            <T extends IndexableAutoImplementDefs | IndexableAutoImplementKeys>(target: T, key: IndexablePatternKey<T>) => Symbol;
        const GetSchema: 
            <T extends IndexableAutoImplementDefs | IndexableAutoImplementKeys>(target: T, key: IndexablePatternKey<T>) => Object;


        function staticImplements<T>(): <U extends T>(constructor: U) => U;
        function staticImplements<T>(symbol: Symbol | T): <U extends T>(constructor: U) => U;


        const implementsOf: (instance: Object, implemented: Symbol) => boolean;
        const implementsFrom: 
            <T extends IndexableAutoImplementDefs | IndexableAutoImplementKeys>(type: T, instance: Object, implemented: IndexablePatternKey<T>) => boolean;


        type IndexableTypeKeyOverload<T> = 
            T extends IAutoImplementIndexable ? toAutoImplementGeneric<{}> : 
            T extends IAutoImplementIndexableKeys ? toAutoImplementKeys<any> : toAutoImplementGeneric<{}>;

        type IndexableKeysForSchema<T, U> = toAutoImplementPattern<T> extends never ? toAutoImplementPattern<U> : toAutoImplementPattern<T>;
        type IndexableKeys<T, U> = toAutoImplementKeysPattern<T> extends never ? toAutoImplementKeysPattern<U> : toAutoImplementKeysPattern<T>;

        type IndexableTypeKeysArrayOverload<T, U> = 
            T extends IAutoImplementIndexable ? IndexableKeysForSchema<T, U>[] :
            T extends IAutoImplementIndexableKeys ? IndexableKeys<T, U>[] : 
            (toAutoImplementPattern<U> | toAutoImplementKeysPattern<U>)[];


        function usesImplementsOf
            <T, U extends KnownKeysMatching<T, IndexableTypeKeyOverload<T>> | (new () => T)>(target: (new () => T) | U, 
            ...keys: IndexableTypeKeysArrayOverload<T, U>): <W extends new (...args: any[]) => {}>(constructor: W) => any;
        function usesImplementsOf<T extends (new () => IAutoImplement)>(listType: T, ...interfaces: Symbol[]):
            <W extends new (...args: any[]) => {}>(constructor: W) => any;
        function usesImplementsOf(...interfaces: toAutoImplementGeneric<{}>[]):
            <W extends new (...args: any[]) => {}>(constructor: W) => any;
        function usesImplementsOf(...interfaces: Symbol[]):
            <W extends new (...args: any[]) => {}>(constructor: W) => any;


        function usesAbstractImplementsOf
            <T, U extends KnownKeysMatching<T, IndexableTypeKeyOverload<T>> | (new () => T)>(target: (new () => T) | U, 
            ...keys: IndexableTypeKeysArrayOverload<T, U>): <W extends new (...args: any[]) => {}>(constructor: W) => any;
        function usesAbstractImplementsOf<T extends (new () => IAutoImplement)>(listType: T, ...interfaces: Symbol[]):
            <W extends new (...args: any[]) => {}>(constructor: W) => any;
        function usesAbstractImplementsOf(...interfaces: toAutoImplementGeneric<{}>[]):
            <W extends new (...args: any[]) => {}>(constructor: W) => any;
        function usesAbstractImplementsOf(...interfaces: Symbol[]):
            <W extends new (...args: any[]) => {}>(constructor: W) => any;

            
        function autoImplement<T>(toImplement: toAutoImplement<T>): new () => IAutoImplement;
        //function autoImplement<T>(toImplement: toAutoImplementPartial<T>): new () => IAutoImplement;

        const ImplementOfPatternFactory: (...interfaces: (new () => IAutoImplement)[]) => new () => IAutoImplement;

    }

}