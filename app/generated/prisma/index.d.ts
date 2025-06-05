
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Formation
 * 
 */
export type Formation = $Result.DefaultSelection<Prisma.$FormationPayload>
/**
 * Model Demande
 * 
 */
export type Demande = $Result.DefaultSelection<Prisma.$DemandePayload>
/**
 * Model Devis
 * 
 */
export type Devis = $Result.DefaultSelection<Prisma.$DevisPayload>
/**
 * Model Contrat
 * 
 */
export type Contrat = $Result.DefaultSelection<Prisma.$ContratPayload>
/**
 * Model Settings
 * 
 */
export type Settings = $Result.DefaultSelection<Prisma.$SettingsPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
  USER: 'USER',
  ADMIN: 'ADMIN',
  GESTIONNAIRE: 'GESTIONNAIRE'
};

export type Role = (typeof Role)[keyof typeof Role]


export const Statut: {
  EN_ATTENTE: 'EN_ATTENTE',
  VALIDE: 'VALIDE',
  REFUSE: 'REFUSE',
  ANNULE: 'ANNULE'
};

export type Statut = (typeof Statut)[keyof typeof Statut]

}

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

export type Statut = $Enums.Statut

export const Statut: typeof $Enums.Statut

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.formation`: Exposes CRUD operations for the **Formation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Formations
    * const formations = await prisma.formation.findMany()
    * ```
    */
  get formation(): Prisma.FormationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.demande`: Exposes CRUD operations for the **Demande** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Demandes
    * const demandes = await prisma.demande.findMany()
    * ```
    */
  get demande(): Prisma.DemandeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.devis`: Exposes CRUD operations for the **Devis** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Devis
    * const devis = await prisma.devis.findMany()
    * ```
    */
  get devis(): Prisma.DevisDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.contrat`: Exposes CRUD operations for the **Contrat** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Contrats
    * const contrats = await prisma.contrat.findMany()
    * ```
    */
  get contrat(): Prisma.ContratDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.settings`: Exposes CRUD operations for the **Settings** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Settings
    * const settings = await prisma.settings.findMany()
    * ```
    */
  get settings(): Prisma.SettingsDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.7.0
   * Query Engine version: 3cff47a7f5d65c3ea74883f1d736e41d68ce91ed
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Formation: 'Formation',
    Demande: 'Demande',
    Devis: 'Devis',
    Contrat: 'Contrat',
    Settings: 'Settings'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "formation" | "demande" | "devis" | "contrat" | "settings"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Formation: {
        payload: Prisma.$FormationPayload<ExtArgs>
        fields: Prisma.FormationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FormationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FormationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormationPayload>
          }
          findFirst: {
            args: Prisma.FormationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FormationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormationPayload>
          }
          findMany: {
            args: Prisma.FormationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormationPayload>[]
          }
          create: {
            args: Prisma.FormationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormationPayload>
          }
          createMany: {
            args: Prisma.FormationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FormationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormationPayload>[]
          }
          delete: {
            args: Prisma.FormationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormationPayload>
          }
          update: {
            args: Prisma.FormationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormationPayload>
          }
          deleteMany: {
            args: Prisma.FormationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FormationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FormationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormationPayload>[]
          }
          upsert: {
            args: Prisma.FormationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormationPayload>
          }
          aggregate: {
            args: Prisma.FormationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFormation>
          }
          groupBy: {
            args: Prisma.FormationGroupByArgs<ExtArgs>
            result: $Utils.Optional<FormationGroupByOutputType>[]
          }
          count: {
            args: Prisma.FormationCountArgs<ExtArgs>
            result: $Utils.Optional<FormationCountAggregateOutputType> | number
          }
        }
      }
      Demande: {
        payload: Prisma.$DemandePayload<ExtArgs>
        fields: Prisma.DemandeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DemandeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DemandePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DemandeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DemandePayload>
          }
          findFirst: {
            args: Prisma.DemandeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DemandePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DemandeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DemandePayload>
          }
          findMany: {
            args: Prisma.DemandeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DemandePayload>[]
          }
          create: {
            args: Prisma.DemandeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DemandePayload>
          }
          createMany: {
            args: Prisma.DemandeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DemandeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DemandePayload>[]
          }
          delete: {
            args: Prisma.DemandeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DemandePayload>
          }
          update: {
            args: Prisma.DemandeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DemandePayload>
          }
          deleteMany: {
            args: Prisma.DemandeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DemandeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DemandeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DemandePayload>[]
          }
          upsert: {
            args: Prisma.DemandeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DemandePayload>
          }
          aggregate: {
            args: Prisma.DemandeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDemande>
          }
          groupBy: {
            args: Prisma.DemandeGroupByArgs<ExtArgs>
            result: $Utils.Optional<DemandeGroupByOutputType>[]
          }
          count: {
            args: Prisma.DemandeCountArgs<ExtArgs>
            result: $Utils.Optional<DemandeCountAggregateOutputType> | number
          }
        }
      }
      Devis: {
        payload: Prisma.$DevisPayload<ExtArgs>
        fields: Prisma.DevisFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DevisFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevisPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DevisFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevisPayload>
          }
          findFirst: {
            args: Prisma.DevisFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevisPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DevisFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevisPayload>
          }
          findMany: {
            args: Prisma.DevisFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevisPayload>[]
          }
          create: {
            args: Prisma.DevisCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevisPayload>
          }
          createMany: {
            args: Prisma.DevisCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DevisCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevisPayload>[]
          }
          delete: {
            args: Prisma.DevisDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevisPayload>
          }
          update: {
            args: Prisma.DevisUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevisPayload>
          }
          deleteMany: {
            args: Prisma.DevisDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DevisUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DevisUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevisPayload>[]
          }
          upsert: {
            args: Prisma.DevisUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevisPayload>
          }
          aggregate: {
            args: Prisma.DevisAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDevis>
          }
          groupBy: {
            args: Prisma.DevisGroupByArgs<ExtArgs>
            result: $Utils.Optional<DevisGroupByOutputType>[]
          }
          count: {
            args: Prisma.DevisCountArgs<ExtArgs>
            result: $Utils.Optional<DevisCountAggregateOutputType> | number
          }
        }
      }
      Contrat: {
        payload: Prisma.$ContratPayload<ExtArgs>
        fields: Prisma.ContratFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ContratFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContratPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ContratFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContratPayload>
          }
          findFirst: {
            args: Prisma.ContratFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContratPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ContratFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContratPayload>
          }
          findMany: {
            args: Prisma.ContratFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContratPayload>[]
          }
          create: {
            args: Prisma.ContratCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContratPayload>
          }
          createMany: {
            args: Prisma.ContratCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ContratCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContratPayload>[]
          }
          delete: {
            args: Prisma.ContratDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContratPayload>
          }
          update: {
            args: Prisma.ContratUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContratPayload>
          }
          deleteMany: {
            args: Prisma.ContratDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ContratUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ContratUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContratPayload>[]
          }
          upsert: {
            args: Prisma.ContratUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContratPayload>
          }
          aggregate: {
            args: Prisma.ContratAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateContrat>
          }
          groupBy: {
            args: Prisma.ContratGroupByArgs<ExtArgs>
            result: $Utils.Optional<ContratGroupByOutputType>[]
          }
          count: {
            args: Prisma.ContratCountArgs<ExtArgs>
            result: $Utils.Optional<ContratCountAggregateOutputType> | number
          }
        }
      }
      Settings: {
        payload: Prisma.$SettingsPayload<ExtArgs>
        fields: Prisma.SettingsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SettingsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SettingsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          findFirst: {
            args: Prisma.SettingsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SettingsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          findMany: {
            args: Prisma.SettingsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>[]
          }
          create: {
            args: Prisma.SettingsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          createMany: {
            args: Prisma.SettingsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SettingsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>[]
          }
          delete: {
            args: Prisma.SettingsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          update: {
            args: Prisma.SettingsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          deleteMany: {
            args: Prisma.SettingsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SettingsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SettingsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>[]
          }
          upsert: {
            args: Prisma.SettingsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          aggregate: {
            args: Prisma.SettingsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSettings>
          }
          groupBy: {
            args: Prisma.SettingsGroupByArgs<ExtArgs>
            result: $Utils.Optional<SettingsGroupByOutputType>[]
          }
          count: {
            args: Prisma.SettingsCountArgs<ExtArgs>
            result: $Utils.Optional<SettingsCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    formation?: FormationOmit
    demande?: DemandeOmit
    devis?: DevisOmit
    contrat?: ContratOmit
    settings?: SettingsOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    demandes: number
    devis: number
    contrats: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    demandes?: boolean | UserCountOutputTypeCountDemandesArgs
    devis?: boolean | UserCountOutputTypeCountDevisArgs
    contrats?: boolean | UserCountOutputTypeCountContratsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountDemandesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DemandeWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountDevisArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DevisWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountContratsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ContratWhereInput
  }


  /**
   * Count Type FormationCountOutputType
   */

  export type FormationCountOutputType = {
    demandes: number
  }

  export type FormationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    demandes?: boolean | FormationCountOutputTypeCountDemandesArgs
  }

  // Custom InputTypes
  /**
   * FormationCountOutputType without action
   */
  export type FormationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormationCountOutputType
     */
    select?: FormationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * FormationCountOutputType without action
   */
  export type FormationCountOutputTypeCountDemandesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DemandeWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    nom: string | null
    prenom: string | null
    role: $Enums.Role | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    nom: string | null
    prenom: string | null
    role: $Enums.Role | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    password: number
    nom: number
    prenom: number
    role: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    password?: true
    nom?: true
    prenom?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    password?: true
    nom?: true
    prenom?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    password?: true
    nom?: true
    prenom?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    password: string
    nom: string
    prenom: string
    role: $Enums.Role
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    nom?: boolean
    prenom?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    demandes?: boolean | User$demandesArgs<ExtArgs>
    devis?: boolean | User$devisArgs<ExtArgs>
    contrats?: boolean | User$contratsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    nom?: boolean
    prenom?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    nom?: boolean
    prenom?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    password?: boolean
    nom?: boolean
    prenom?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "password" | "nom" | "prenom" | "role" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    demandes?: boolean | User$demandesArgs<ExtArgs>
    devis?: boolean | User$devisArgs<ExtArgs>
    contrats?: boolean | User$contratsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      demandes: Prisma.$DemandePayload<ExtArgs>[]
      devis: Prisma.$DevisPayload<ExtArgs>[]
      contrats: Prisma.$ContratPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      password: string
      nom: string
      prenom: string
      role: $Enums.Role
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    demandes<T extends User$demandesArgs<ExtArgs> = {}>(args?: Subset<T, User$demandesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DemandePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    devis<T extends User$devisArgs<ExtArgs> = {}>(args?: Subset<T, User$devisArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DevisPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    contrats<T extends User$contratsArgs<ExtArgs> = {}>(args?: Subset<T, User$contratsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContratPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly nom: FieldRef<"User", 'String'>
    readonly prenom: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'Role'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.demandes
   */
  export type User$demandesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Demande
     */
    select?: DemandeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Demande
     */
    omit?: DemandeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DemandeInclude<ExtArgs> | null
    where?: DemandeWhereInput
    orderBy?: DemandeOrderByWithRelationInput | DemandeOrderByWithRelationInput[]
    cursor?: DemandeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DemandeScalarFieldEnum | DemandeScalarFieldEnum[]
  }

  /**
   * User.devis
   */
  export type User$devisArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devis
     */
    select?: DevisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devis
     */
    omit?: DevisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevisInclude<ExtArgs> | null
    where?: DevisWhereInput
    orderBy?: DevisOrderByWithRelationInput | DevisOrderByWithRelationInput[]
    cursor?: DevisWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DevisScalarFieldEnum | DevisScalarFieldEnum[]
  }

  /**
   * User.contrats
   */
  export type User$contratsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contrat
     */
    select?: ContratSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contrat
     */
    omit?: ContratOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContratInclude<ExtArgs> | null
    where?: ContratWhereInput
    orderBy?: ContratOrderByWithRelationInput | ContratOrderByWithRelationInput[]
    cursor?: ContratWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ContratScalarFieldEnum | ContratScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Formation
   */

  export type AggregateFormation = {
    _count: FormationCountAggregateOutputType | null
    _avg: FormationAvgAggregateOutputType | null
    _sum: FormationSumAggregateOutputType | null
    _min: FormationMinAggregateOutputType | null
    _max: FormationMaxAggregateOutputType | null
  }

  export type FormationAvgAggregateOutputType = {
    prix: number | null
  }

  export type FormationSumAggregateOutputType = {
    prix: number | null
  }

  export type FormationMinAggregateOutputType = {
    id: string | null
    titre: string | null
    description: string | null
    duree: string | null
    prix: number | null
    niveau: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FormationMaxAggregateOutputType = {
    id: string | null
    titre: string | null
    description: string | null
    duree: string | null
    prix: number | null
    niveau: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FormationCountAggregateOutputType = {
    id: number
    titre: number
    description: number
    duree: number
    prix: number
    niveau: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FormationAvgAggregateInputType = {
    prix?: true
  }

  export type FormationSumAggregateInputType = {
    prix?: true
  }

  export type FormationMinAggregateInputType = {
    id?: true
    titre?: true
    description?: true
    duree?: true
    prix?: true
    niveau?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FormationMaxAggregateInputType = {
    id?: true
    titre?: true
    description?: true
    duree?: true
    prix?: true
    niveau?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FormationCountAggregateInputType = {
    id?: true
    titre?: true
    description?: true
    duree?: true
    prix?: true
    niveau?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FormationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Formation to aggregate.
     */
    where?: FormationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Formations to fetch.
     */
    orderBy?: FormationOrderByWithRelationInput | FormationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FormationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Formations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Formations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Formations
    **/
    _count?: true | FormationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FormationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FormationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FormationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FormationMaxAggregateInputType
  }

  export type GetFormationAggregateType<T extends FormationAggregateArgs> = {
        [P in keyof T & keyof AggregateFormation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFormation[P]>
      : GetScalarType<T[P], AggregateFormation[P]>
  }




  export type FormationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FormationWhereInput
    orderBy?: FormationOrderByWithAggregationInput | FormationOrderByWithAggregationInput[]
    by: FormationScalarFieldEnum[] | FormationScalarFieldEnum
    having?: FormationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FormationCountAggregateInputType | true
    _avg?: FormationAvgAggregateInputType
    _sum?: FormationSumAggregateInputType
    _min?: FormationMinAggregateInputType
    _max?: FormationMaxAggregateInputType
  }

  export type FormationGroupByOutputType = {
    id: string
    titre: string
    description: string
    duree: string
    prix: number
    niveau: string
    createdAt: Date
    updatedAt: Date
    _count: FormationCountAggregateOutputType | null
    _avg: FormationAvgAggregateOutputType | null
    _sum: FormationSumAggregateOutputType | null
    _min: FormationMinAggregateOutputType | null
    _max: FormationMaxAggregateOutputType | null
  }

  type GetFormationGroupByPayload<T extends FormationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FormationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FormationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FormationGroupByOutputType[P]>
            : GetScalarType<T[P], FormationGroupByOutputType[P]>
        }
      >
    >


  export type FormationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titre?: boolean
    description?: boolean
    duree?: boolean
    prix?: boolean
    niveau?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    demandes?: boolean | Formation$demandesArgs<ExtArgs>
    _count?: boolean | FormationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["formation"]>

  export type FormationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titre?: boolean
    description?: boolean
    duree?: boolean
    prix?: boolean
    niveau?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["formation"]>

  export type FormationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titre?: boolean
    description?: boolean
    duree?: boolean
    prix?: boolean
    niveau?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["formation"]>

  export type FormationSelectScalar = {
    id?: boolean
    titre?: boolean
    description?: boolean
    duree?: boolean
    prix?: boolean
    niveau?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type FormationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "titre" | "description" | "duree" | "prix" | "niveau" | "createdAt" | "updatedAt", ExtArgs["result"]["formation"]>
  export type FormationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    demandes?: boolean | Formation$demandesArgs<ExtArgs>
    _count?: boolean | FormationCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type FormationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type FormationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $FormationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Formation"
    objects: {
      demandes: Prisma.$DemandePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      titre: string
      description: string
      duree: string
      prix: number
      niveau: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["formation"]>
    composites: {}
  }

  type FormationGetPayload<S extends boolean | null | undefined | FormationDefaultArgs> = $Result.GetResult<Prisma.$FormationPayload, S>

  type FormationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FormationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FormationCountAggregateInputType | true
    }

  export interface FormationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Formation'], meta: { name: 'Formation' } }
    /**
     * Find zero or one Formation that matches the filter.
     * @param {FormationFindUniqueArgs} args - Arguments to find a Formation
     * @example
     * // Get one Formation
     * const formation = await prisma.formation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FormationFindUniqueArgs>(args: SelectSubset<T, FormationFindUniqueArgs<ExtArgs>>): Prisma__FormationClient<$Result.GetResult<Prisma.$FormationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Formation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FormationFindUniqueOrThrowArgs} args - Arguments to find a Formation
     * @example
     * // Get one Formation
     * const formation = await prisma.formation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FormationFindUniqueOrThrowArgs>(args: SelectSubset<T, FormationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FormationClient<$Result.GetResult<Prisma.$FormationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Formation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormationFindFirstArgs} args - Arguments to find a Formation
     * @example
     * // Get one Formation
     * const formation = await prisma.formation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FormationFindFirstArgs>(args?: SelectSubset<T, FormationFindFirstArgs<ExtArgs>>): Prisma__FormationClient<$Result.GetResult<Prisma.$FormationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Formation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormationFindFirstOrThrowArgs} args - Arguments to find a Formation
     * @example
     * // Get one Formation
     * const formation = await prisma.formation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FormationFindFirstOrThrowArgs>(args?: SelectSubset<T, FormationFindFirstOrThrowArgs<ExtArgs>>): Prisma__FormationClient<$Result.GetResult<Prisma.$FormationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Formations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Formations
     * const formations = await prisma.formation.findMany()
     * 
     * // Get first 10 Formations
     * const formations = await prisma.formation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const formationWithIdOnly = await prisma.formation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FormationFindManyArgs>(args?: SelectSubset<T, FormationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FormationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Formation.
     * @param {FormationCreateArgs} args - Arguments to create a Formation.
     * @example
     * // Create one Formation
     * const Formation = await prisma.formation.create({
     *   data: {
     *     // ... data to create a Formation
     *   }
     * })
     * 
     */
    create<T extends FormationCreateArgs>(args: SelectSubset<T, FormationCreateArgs<ExtArgs>>): Prisma__FormationClient<$Result.GetResult<Prisma.$FormationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Formations.
     * @param {FormationCreateManyArgs} args - Arguments to create many Formations.
     * @example
     * // Create many Formations
     * const formation = await prisma.formation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FormationCreateManyArgs>(args?: SelectSubset<T, FormationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Formations and returns the data saved in the database.
     * @param {FormationCreateManyAndReturnArgs} args - Arguments to create many Formations.
     * @example
     * // Create many Formations
     * const formation = await prisma.formation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Formations and only return the `id`
     * const formationWithIdOnly = await prisma.formation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FormationCreateManyAndReturnArgs>(args?: SelectSubset<T, FormationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FormationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Formation.
     * @param {FormationDeleteArgs} args - Arguments to delete one Formation.
     * @example
     * // Delete one Formation
     * const Formation = await prisma.formation.delete({
     *   where: {
     *     // ... filter to delete one Formation
     *   }
     * })
     * 
     */
    delete<T extends FormationDeleteArgs>(args: SelectSubset<T, FormationDeleteArgs<ExtArgs>>): Prisma__FormationClient<$Result.GetResult<Prisma.$FormationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Formation.
     * @param {FormationUpdateArgs} args - Arguments to update one Formation.
     * @example
     * // Update one Formation
     * const formation = await prisma.formation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FormationUpdateArgs>(args: SelectSubset<T, FormationUpdateArgs<ExtArgs>>): Prisma__FormationClient<$Result.GetResult<Prisma.$FormationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Formations.
     * @param {FormationDeleteManyArgs} args - Arguments to filter Formations to delete.
     * @example
     * // Delete a few Formations
     * const { count } = await prisma.formation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FormationDeleteManyArgs>(args?: SelectSubset<T, FormationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Formations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Formations
     * const formation = await prisma.formation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FormationUpdateManyArgs>(args: SelectSubset<T, FormationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Formations and returns the data updated in the database.
     * @param {FormationUpdateManyAndReturnArgs} args - Arguments to update many Formations.
     * @example
     * // Update many Formations
     * const formation = await prisma.formation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Formations and only return the `id`
     * const formationWithIdOnly = await prisma.formation.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FormationUpdateManyAndReturnArgs>(args: SelectSubset<T, FormationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FormationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Formation.
     * @param {FormationUpsertArgs} args - Arguments to update or create a Formation.
     * @example
     * // Update or create a Formation
     * const formation = await prisma.formation.upsert({
     *   create: {
     *     // ... data to create a Formation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Formation we want to update
     *   }
     * })
     */
    upsert<T extends FormationUpsertArgs>(args: SelectSubset<T, FormationUpsertArgs<ExtArgs>>): Prisma__FormationClient<$Result.GetResult<Prisma.$FormationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Formations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormationCountArgs} args - Arguments to filter Formations to count.
     * @example
     * // Count the number of Formations
     * const count = await prisma.formation.count({
     *   where: {
     *     // ... the filter for the Formations we want to count
     *   }
     * })
    **/
    count<T extends FormationCountArgs>(
      args?: Subset<T, FormationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FormationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Formation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FormationAggregateArgs>(args: Subset<T, FormationAggregateArgs>): Prisma.PrismaPromise<GetFormationAggregateType<T>>

    /**
     * Group by Formation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FormationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FormationGroupByArgs['orderBy'] }
        : { orderBy?: FormationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FormationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFormationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Formation model
   */
  readonly fields: FormationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Formation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FormationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    demandes<T extends Formation$demandesArgs<ExtArgs> = {}>(args?: Subset<T, Formation$demandesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DemandePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Formation model
   */
  interface FormationFieldRefs {
    readonly id: FieldRef<"Formation", 'String'>
    readonly titre: FieldRef<"Formation", 'String'>
    readonly description: FieldRef<"Formation", 'String'>
    readonly duree: FieldRef<"Formation", 'String'>
    readonly prix: FieldRef<"Formation", 'Float'>
    readonly niveau: FieldRef<"Formation", 'String'>
    readonly createdAt: FieldRef<"Formation", 'DateTime'>
    readonly updatedAt: FieldRef<"Formation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Formation findUnique
   */
  export type FormationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formation
     */
    select?: FormationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formation
     */
    omit?: FormationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormationInclude<ExtArgs> | null
    /**
     * Filter, which Formation to fetch.
     */
    where: FormationWhereUniqueInput
  }

  /**
   * Formation findUniqueOrThrow
   */
  export type FormationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formation
     */
    select?: FormationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formation
     */
    omit?: FormationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormationInclude<ExtArgs> | null
    /**
     * Filter, which Formation to fetch.
     */
    where: FormationWhereUniqueInput
  }

  /**
   * Formation findFirst
   */
  export type FormationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formation
     */
    select?: FormationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formation
     */
    omit?: FormationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormationInclude<ExtArgs> | null
    /**
     * Filter, which Formation to fetch.
     */
    where?: FormationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Formations to fetch.
     */
    orderBy?: FormationOrderByWithRelationInput | FormationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Formations.
     */
    cursor?: FormationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Formations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Formations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Formations.
     */
    distinct?: FormationScalarFieldEnum | FormationScalarFieldEnum[]
  }

  /**
   * Formation findFirstOrThrow
   */
  export type FormationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formation
     */
    select?: FormationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formation
     */
    omit?: FormationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormationInclude<ExtArgs> | null
    /**
     * Filter, which Formation to fetch.
     */
    where?: FormationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Formations to fetch.
     */
    orderBy?: FormationOrderByWithRelationInput | FormationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Formations.
     */
    cursor?: FormationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Formations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Formations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Formations.
     */
    distinct?: FormationScalarFieldEnum | FormationScalarFieldEnum[]
  }

  /**
   * Formation findMany
   */
  export type FormationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formation
     */
    select?: FormationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formation
     */
    omit?: FormationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormationInclude<ExtArgs> | null
    /**
     * Filter, which Formations to fetch.
     */
    where?: FormationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Formations to fetch.
     */
    orderBy?: FormationOrderByWithRelationInput | FormationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Formations.
     */
    cursor?: FormationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Formations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Formations.
     */
    skip?: number
    distinct?: FormationScalarFieldEnum | FormationScalarFieldEnum[]
  }

  /**
   * Formation create
   */
  export type FormationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formation
     */
    select?: FormationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formation
     */
    omit?: FormationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormationInclude<ExtArgs> | null
    /**
     * The data needed to create a Formation.
     */
    data: XOR<FormationCreateInput, FormationUncheckedCreateInput>
  }

  /**
   * Formation createMany
   */
  export type FormationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Formations.
     */
    data: FormationCreateManyInput | FormationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Formation createManyAndReturn
   */
  export type FormationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formation
     */
    select?: FormationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Formation
     */
    omit?: FormationOmit<ExtArgs> | null
    /**
     * The data used to create many Formations.
     */
    data: FormationCreateManyInput | FormationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Formation update
   */
  export type FormationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formation
     */
    select?: FormationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formation
     */
    omit?: FormationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormationInclude<ExtArgs> | null
    /**
     * The data needed to update a Formation.
     */
    data: XOR<FormationUpdateInput, FormationUncheckedUpdateInput>
    /**
     * Choose, which Formation to update.
     */
    where: FormationWhereUniqueInput
  }

  /**
   * Formation updateMany
   */
  export type FormationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Formations.
     */
    data: XOR<FormationUpdateManyMutationInput, FormationUncheckedUpdateManyInput>
    /**
     * Filter which Formations to update
     */
    where?: FormationWhereInput
    /**
     * Limit how many Formations to update.
     */
    limit?: number
  }

  /**
   * Formation updateManyAndReturn
   */
  export type FormationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formation
     */
    select?: FormationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Formation
     */
    omit?: FormationOmit<ExtArgs> | null
    /**
     * The data used to update Formations.
     */
    data: XOR<FormationUpdateManyMutationInput, FormationUncheckedUpdateManyInput>
    /**
     * Filter which Formations to update
     */
    where?: FormationWhereInput
    /**
     * Limit how many Formations to update.
     */
    limit?: number
  }

  /**
   * Formation upsert
   */
  export type FormationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formation
     */
    select?: FormationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formation
     */
    omit?: FormationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormationInclude<ExtArgs> | null
    /**
     * The filter to search for the Formation to update in case it exists.
     */
    where: FormationWhereUniqueInput
    /**
     * In case the Formation found by the `where` argument doesn't exist, create a new Formation with this data.
     */
    create: XOR<FormationCreateInput, FormationUncheckedCreateInput>
    /**
     * In case the Formation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FormationUpdateInput, FormationUncheckedUpdateInput>
  }

  /**
   * Formation delete
   */
  export type FormationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formation
     */
    select?: FormationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formation
     */
    omit?: FormationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormationInclude<ExtArgs> | null
    /**
     * Filter which Formation to delete.
     */
    where: FormationWhereUniqueInput
  }

  /**
   * Formation deleteMany
   */
  export type FormationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Formations to delete
     */
    where?: FormationWhereInput
    /**
     * Limit how many Formations to delete.
     */
    limit?: number
  }

  /**
   * Formation.demandes
   */
  export type Formation$demandesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Demande
     */
    select?: DemandeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Demande
     */
    omit?: DemandeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DemandeInclude<ExtArgs> | null
    where?: DemandeWhereInput
    orderBy?: DemandeOrderByWithRelationInput | DemandeOrderByWithRelationInput[]
    cursor?: DemandeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DemandeScalarFieldEnum | DemandeScalarFieldEnum[]
  }

  /**
   * Formation without action
   */
  export type FormationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formation
     */
    select?: FormationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formation
     */
    omit?: FormationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormationInclude<ExtArgs> | null
  }


  /**
   * Model Demande
   */

  export type AggregateDemande = {
    _count: DemandeCountAggregateOutputType | null
    _min: DemandeMinAggregateOutputType | null
    _max: DemandeMaxAggregateOutputType | null
  }

  export type DemandeMinAggregateOutputType = {
    id: string | null
    userId: string | null
    formationId: string | null
    statut: $Enums.Statut | null
    message: string | null
    commentaire: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DemandeMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    formationId: string | null
    statut: $Enums.Statut | null
    message: string | null
    commentaire: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DemandeCountAggregateOutputType = {
    id: number
    userId: number
    formationId: number
    statut: number
    message: number
    commentaire: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DemandeMinAggregateInputType = {
    id?: true
    userId?: true
    formationId?: true
    statut?: true
    message?: true
    commentaire?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DemandeMaxAggregateInputType = {
    id?: true
    userId?: true
    formationId?: true
    statut?: true
    message?: true
    commentaire?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DemandeCountAggregateInputType = {
    id?: true
    userId?: true
    formationId?: true
    statut?: true
    message?: true
    commentaire?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DemandeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Demande to aggregate.
     */
    where?: DemandeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Demandes to fetch.
     */
    orderBy?: DemandeOrderByWithRelationInput | DemandeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DemandeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Demandes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Demandes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Demandes
    **/
    _count?: true | DemandeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DemandeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DemandeMaxAggregateInputType
  }

  export type GetDemandeAggregateType<T extends DemandeAggregateArgs> = {
        [P in keyof T & keyof AggregateDemande]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDemande[P]>
      : GetScalarType<T[P], AggregateDemande[P]>
  }




  export type DemandeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DemandeWhereInput
    orderBy?: DemandeOrderByWithAggregationInput | DemandeOrderByWithAggregationInput[]
    by: DemandeScalarFieldEnum[] | DemandeScalarFieldEnum
    having?: DemandeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DemandeCountAggregateInputType | true
    _min?: DemandeMinAggregateInputType
    _max?: DemandeMaxAggregateInputType
  }

  export type DemandeGroupByOutputType = {
    id: string
    userId: string
    formationId: string
    statut: $Enums.Statut
    message: string | null
    commentaire: string | null
    createdAt: Date
    updatedAt: Date
    _count: DemandeCountAggregateOutputType | null
    _min: DemandeMinAggregateOutputType | null
    _max: DemandeMaxAggregateOutputType | null
  }

  type GetDemandeGroupByPayload<T extends DemandeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DemandeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DemandeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DemandeGroupByOutputType[P]>
            : GetScalarType<T[P], DemandeGroupByOutputType[P]>
        }
      >
    >


  export type DemandeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    formationId?: boolean
    statut?: boolean
    message?: boolean
    commentaire?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    formation?: boolean | FormationDefaultArgs<ExtArgs>
    devis?: boolean | Demande$devisArgs<ExtArgs>
  }, ExtArgs["result"]["demande"]>

  export type DemandeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    formationId?: boolean
    statut?: boolean
    message?: boolean
    commentaire?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    formation?: boolean | FormationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["demande"]>

  export type DemandeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    formationId?: boolean
    statut?: boolean
    message?: boolean
    commentaire?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    formation?: boolean | FormationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["demande"]>

  export type DemandeSelectScalar = {
    id?: boolean
    userId?: boolean
    formationId?: boolean
    statut?: boolean
    message?: boolean
    commentaire?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DemandeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "formationId" | "statut" | "message" | "commentaire" | "createdAt" | "updatedAt", ExtArgs["result"]["demande"]>
  export type DemandeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    formation?: boolean | FormationDefaultArgs<ExtArgs>
    devis?: boolean | Demande$devisArgs<ExtArgs>
  }
  export type DemandeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    formation?: boolean | FormationDefaultArgs<ExtArgs>
  }
  export type DemandeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    formation?: boolean | FormationDefaultArgs<ExtArgs>
  }

  export type $DemandePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Demande"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      formation: Prisma.$FormationPayload<ExtArgs>
      devis: Prisma.$DevisPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      formationId: string
      statut: $Enums.Statut
      message: string | null
      commentaire: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["demande"]>
    composites: {}
  }

  type DemandeGetPayload<S extends boolean | null | undefined | DemandeDefaultArgs> = $Result.GetResult<Prisma.$DemandePayload, S>

  type DemandeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DemandeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DemandeCountAggregateInputType | true
    }

  export interface DemandeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Demande'], meta: { name: 'Demande' } }
    /**
     * Find zero or one Demande that matches the filter.
     * @param {DemandeFindUniqueArgs} args - Arguments to find a Demande
     * @example
     * // Get one Demande
     * const demande = await prisma.demande.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DemandeFindUniqueArgs>(args: SelectSubset<T, DemandeFindUniqueArgs<ExtArgs>>): Prisma__DemandeClient<$Result.GetResult<Prisma.$DemandePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Demande that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DemandeFindUniqueOrThrowArgs} args - Arguments to find a Demande
     * @example
     * // Get one Demande
     * const demande = await prisma.demande.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DemandeFindUniqueOrThrowArgs>(args: SelectSubset<T, DemandeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DemandeClient<$Result.GetResult<Prisma.$DemandePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Demande that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DemandeFindFirstArgs} args - Arguments to find a Demande
     * @example
     * // Get one Demande
     * const demande = await prisma.demande.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DemandeFindFirstArgs>(args?: SelectSubset<T, DemandeFindFirstArgs<ExtArgs>>): Prisma__DemandeClient<$Result.GetResult<Prisma.$DemandePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Demande that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DemandeFindFirstOrThrowArgs} args - Arguments to find a Demande
     * @example
     * // Get one Demande
     * const demande = await prisma.demande.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DemandeFindFirstOrThrowArgs>(args?: SelectSubset<T, DemandeFindFirstOrThrowArgs<ExtArgs>>): Prisma__DemandeClient<$Result.GetResult<Prisma.$DemandePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Demandes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DemandeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Demandes
     * const demandes = await prisma.demande.findMany()
     * 
     * // Get first 10 Demandes
     * const demandes = await prisma.demande.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const demandeWithIdOnly = await prisma.demande.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DemandeFindManyArgs>(args?: SelectSubset<T, DemandeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DemandePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Demande.
     * @param {DemandeCreateArgs} args - Arguments to create a Demande.
     * @example
     * // Create one Demande
     * const Demande = await prisma.demande.create({
     *   data: {
     *     // ... data to create a Demande
     *   }
     * })
     * 
     */
    create<T extends DemandeCreateArgs>(args: SelectSubset<T, DemandeCreateArgs<ExtArgs>>): Prisma__DemandeClient<$Result.GetResult<Prisma.$DemandePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Demandes.
     * @param {DemandeCreateManyArgs} args - Arguments to create many Demandes.
     * @example
     * // Create many Demandes
     * const demande = await prisma.demande.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DemandeCreateManyArgs>(args?: SelectSubset<T, DemandeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Demandes and returns the data saved in the database.
     * @param {DemandeCreateManyAndReturnArgs} args - Arguments to create many Demandes.
     * @example
     * // Create many Demandes
     * const demande = await prisma.demande.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Demandes and only return the `id`
     * const demandeWithIdOnly = await prisma.demande.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DemandeCreateManyAndReturnArgs>(args?: SelectSubset<T, DemandeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DemandePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Demande.
     * @param {DemandeDeleteArgs} args - Arguments to delete one Demande.
     * @example
     * // Delete one Demande
     * const Demande = await prisma.demande.delete({
     *   where: {
     *     // ... filter to delete one Demande
     *   }
     * })
     * 
     */
    delete<T extends DemandeDeleteArgs>(args: SelectSubset<T, DemandeDeleteArgs<ExtArgs>>): Prisma__DemandeClient<$Result.GetResult<Prisma.$DemandePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Demande.
     * @param {DemandeUpdateArgs} args - Arguments to update one Demande.
     * @example
     * // Update one Demande
     * const demande = await prisma.demande.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DemandeUpdateArgs>(args: SelectSubset<T, DemandeUpdateArgs<ExtArgs>>): Prisma__DemandeClient<$Result.GetResult<Prisma.$DemandePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Demandes.
     * @param {DemandeDeleteManyArgs} args - Arguments to filter Demandes to delete.
     * @example
     * // Delete a few Demandes
     * const { count } = await prisma.demande.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DemandeDeleteManyArgs>(args?: SelectSubset<T, DemandeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Demandes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DemandeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Demandes
     * const demande = await prisma.demande.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DemandeUpdateManyArgs>(args: SelectSubset<T, DemandeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Demandes and returns the data updated in the database.
     * @param {DemandeUpdateManyAndReturnArgs} args - Arguments to update many Demandes.
     * @example
     * // Update many Demandes
     * const demande = await prisma.demande.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Demandes and only return the `id`
     * const demandeWithIdOnly = await prisma.demande.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DemandeUpdateManyAndReturnArgs>(args: SelectSubset<T, DemandeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DemandePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Demande.
     * @param {DemandeUpsertArgs} args - Arguments to update or create a Demande.
     * @example
     * // Update or create a Demande
     * const demande = await prisma.demande.upsert({
     *   create: {
     *     // ... data to create a Demande
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Demande we want to update
     *   }
     * })
     */
    upsert<T extends DemandeUpsertArgs>(args: SelectSubset<T, DemandeUpsertArgs<ExtArgs>>): Prisma__DemandeClient<$Result.GetResult<Prisma.$DemandePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Demandes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DemandeCountArgs} args - Arguments to filter Demandes to count.
     * @example
     * // Count the number of Demandes
     * const count = await prisma.demande.count({
     *   where: {
     *     // ... the filter for the Demandes we want to count
     *   }
     * })
    **/
    count<T extends DemandeCountArgs>(
      args?: Subset<T, DemandeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DemandeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Demande.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DemandeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DemandeAggregateArgs>(args: Subset<T, DemandeAggregateArgs>): Prisma.PrismaPromise<GetDemandeAggregateType<T>>

    /**
     * Group by Demande.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DemandeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DemandeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DemandeGroupByArgs['orderBy'] }
        : { orderBy?: DemandeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DemandeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDemandeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Demande model
   */
  readonly fields: DemandeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Demande.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DemandeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    formation<T extends FormationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, FormationDefaultArgs<ExtArgs>>): Prisma__FormationClient<$Result.GetResult<Prisma.$FormationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    devis<T extends Demande$devisArgs<ExtArgs> = {}>(args?: Subset<T, Demande$devisArgs<ExtArgs>>): Prisma__DevisClient<$Result.GetResult<Prisma.$DevisPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Demande model
   */
  interface DemandeFieldRefs {
    readonly id: FieldRef<"Demande", 'String'>
    readonly userId: FieldRef<"Demande", 'String'>
    readonly formationId: FieldRef<"Demande", 'String'>
    readonly statut: FieldRef<"Demande", 'Statut'>
    readonly message: FieldRef<"Demande", 'String'>
    readonly commentaire: FieldRef<"Demande", 'String'>
    readonly createdAt: FieldRef<"Demande", 'DateTime'>
    readonly updatedAt: FieldRef<"Demande", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Demande findUnique
   */
  export type DemandeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Demande
     */
    select?: DemandeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Demande
     */
    omit?: DemandeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DemandeInclude<ExtArgs> | null
    /**
     * Filter, which Demande to fetch.
     */
    where: DemandeWhereUniqueInput
  }

  /**
   * Demande findUniqueOrThrow
   */
  export type DemandeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Demande
     */
    select?: DemandeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Demande
     */
    omit?: DemandeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DemandeInclude<ExtArgs> | null
    /**
     * Filter, which Demande to fetch.
     */
    where: DemandeWhereUniqueInput
  }

  /**
   * Demande findFirst
   */
  export type DemandeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Demande
     */
    select?: DemandeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Demande
     */
    omit?: DemandeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DemandeInclude<ExtArgs> | null
    /**
     * Filter, which Demande to fetch.
     */
    where?: DemandeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Demandes to fetch.
     */
    orderBy?: DemandeOrderByWithRelationInput | DemandeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Demandes.
     */
    cursor?: DemandeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Demandes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Demandes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Demandes.
     */
    distinct?: DemandeScalarFieldEnum | DemandeScalarFieldEnum[]
  }

  /**
   * Demande findFirstOrThrow
   */
  export type DemandeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Demande
     */
    select?: DemandeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Demande
     */
    omit?: DemandeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DemandeInclude<ExtArgs> | null
    /**
     * Filter, which Demande to fetch.
     */
    where?: DemandeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Demandes to fetch.
     */
    orderBy?: DemandeOrderByWithRelationInput | DemandeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Demandes.
     */
    cursor?: DemandeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Demandes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Demandes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Demandes.
     */
    distinct?: DemandeScalarFieldEnum | DemandeScalarFieldEnum[]
  }

  /**
   * Demande findMany
   */
  export type DemandeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Demande
     */
    select?: DemandeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Demande
     */
    omit?: DemandeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DemandeInclude<ExtArgs> | null
    /**
     * Filter, which Demandes to fetch.
     */
    where?: DemandeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Demandes to fetch.
     */
    orderBy?: DemandeOrderByWithRelationInput | DemandeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Demandes.
     */
    cursor?: DemandeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Demandes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Demandes.
     */
    skip?: number
    distinct?: DemandeScalarFieldEnum | DemandeScalarFieldEnum[]
  }

  /**
   * Demande create
   */
  export type DemandeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Demande
     */
    select?: DemandeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Demande
     */
    omit?: DemandeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DemandeInclude<ExtArgs> | null
    /**
     * The data needed to create a Demande.
     */
    data: XOR<DemandeCreateInput, DemandeUncheckedCreateInput>
  }

  /**
   * Demande createMany
   */
  export type DemandeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Demandes.
     */
    data: DemandeCreateManyInput | DemandeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Demande createManyAndReturn
   */
  export type DemandeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Demande
     */
    select?: DemandeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Demande
     */
    omit?: DemandeOmit<ExtArgs> | null
    /**
     * The data used to create many Demandes.
     */
    data: DemandeCreateManyInput | DemandeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DemandeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Demande update
   */
  export type DemandeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Demande
     */
    select?: DemandeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Demande
     */
    omit?: DemandeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DemandeInclude<ExtArgs> | null
    /**
     * The data needed to update a Demande.
     */
    data: XOR<DemandeUpdateInput, DemandeUncheckedUpdateInput>
    /**
     * Choose, which Demande to update.
     */
    where: DemandeWhereUniqueInput
  }

  /**
   * Demande updateMany
   */
  export type DemandeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Demandes.
     */
    data: XOR<DemandeUpdateManyMutationInput, DemandeUncheckedUpdateManyInput>
    /**
     * Filter which Demandes to update
     */
    where?: DemandeWhereInput
    /**
     * Limit how many Demandes to update.
     */
    limit?: number
  }

  /**
   * Demande updateManyAndReturn
   */
  export type DemandeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Demande
     */
    select?: DemandeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Demande
     */
    omit?: DemandeOmit<ExtArgs> | null
    /**
     * The data used to update Demandes.
     */
    data: XOR<DemandeUpdateManyMutationInput, DemandeUncheckedUpdateManyInput>
    /**
     * Filter which Demandes to update
     */
    where?: DemandeWhereInput
    /**
     * Limit how many Demandes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DemandeIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Demande upsert
   */
  export type DemandeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Demande
     */
    select?: DemandeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Demande
     */
    omit?: DemandeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DemandeInclude<ExtArgs> | null
    /**
     * The filter to search for the Demande to update in case it exists.
     */
    where: DemandeWhereUniqueInput
    /**
     * In case the Demande found by the `where` argument doesn't exist, create a new Demande with this data.
     */
    create: XOR<DemandeCreateInput, DemandeUncheckedCreateInput>
    /**
     * In case the Demande was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DemandeUpdateInput, DemandeUncheckedUpdateInput>
  }

  /**
   * Demande delete
   */
  export type DemandeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Demande
     */
    select?: DemandeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Demande
     */
    omit?: DemandeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DemandeInclude<ExtArgs> | null
    /**
     * Filter which Demande to delete.
     */
    where: DemandeWhereUniqueInput
  }

  /**
   * Demande deleteMany
   */
  export type DemandeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Demandes to delete
     */
    where?: DemandeWhereInput
    /**
     * Limit how many Demandes to delete.
     */
    limit?: number
  }

  /**
   * Demande.devis
   */
  export type Demande$devisArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devis
     */
    select?: DevisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devis
     */
    omit?: DevisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevisInclude<ExtArgs> | null
    where?: DevisWhereInput
  }

  /**
   * Demande without action
   */
  export type DemandeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Demande
     */
    select?: DemandeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Demande
     */
    omit?: DemandeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DemandeInclude<ExtArgs> | null
  }


  /**
   * Model Devis
   */

  export type AggregateDevis = {
    _count: DevisCountAggregateOutputType | null
    _avg: DevisAvgAggregateOutputType | null
    _sum: DevisSumAggregateOutputType | null
    _min: DevisMinAggregateOutputType | null
    _max: DevisMaxAggregateOutputType | null
  }

  export type DevisAvgAggregateOutputType = {
    quantite: number | null
    prixUnitaire: number | null
    tva: number | null
    montant: number | null
  }

  export type DevisSumAggregateOutputType = {
    quantite: number | null
    prixUnitaire: number | null
    tva: number | null
    montant: number | null
  }

  export type DevisMinAggregateOutputType = {
    id: string | null
    demandeId: string | null
    userId: string | null
    numero: string | null
    client: string | null
    mail: string | null
    mail2: string | null
    adresseLivraison: string | null
    dateLivraison: Date | null
    dateExamen: Date | null
    adresse: string | null
    siret: string | null
    numNDA: string | null
    dateFormation: Date | null
    suiviPar: string | null
    designation: string | null
    quantite: number | null
    unite: string | null
    prixUnitaire: number | null
    tva: number | null
    exoneration: string | null
    datePriseEffet: Date | null
    montant: number | null
    iban: string | null
    bic: string | null
    banque: string | null
    intituleCompte: string | null
    signature: string | null
    statut: $Enums.Statut | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DevisMaxAggregateOutputType = {
    id: string | null
    demandeId: string | null
    userId: string | null
    numero: string | null
    client: string | null
    mail: string | null
    mail2: string | null
    adresseLivraison: string | null
    dateLivraison: Date | null
    dateExamen: Date | null
    adresse: string | null
    siret: string | null
    numNDA: string | null
    dateFormation: Date | null
    suiviPar: string | null
    designation: string | null
    quantite: number | null
    unite: string | null
    prixUnitaire: number | null
    tva: number | null
    exoneration: string | null
    datePriseEffet: Date | null
    montant: number | null
    iban: string | null
    bic: string | null
    banque: string | null
    intituleCompte: string | null
    signature: string | null
    statut: $Enums.Statut | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DevisCountAggregateOutputType = {
    id: number
    demandeId: number
    userId: number
    numero: number
    client: number
    mail: number
    mail2: number
    adresseLivraison: number
    dateLivraison: number
    dateExamen: number
    adresse: number
    siret: number
    numNDA: number
    dateFormation: number
    suiviPar: number
    designation: number
    quantite: number
    unite: number
    prixUnitaire: number
    tva: number
    exoneration: number
    datePriseEffet: number
    montant: number
    iban: number
    bic: number
    banque: number
    intituleCompte: number
    signature: number
    statut: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DevisAvgAggregateInputType = {
    quantite?: true
    prixUnitaire?: true
    tva?: true
    montant?: true
  }

  export type DevisSumAggregateInputType = {
    quantite?: true
    prixUnitaire?: true
    tva?: true
    montant?: true
  }

  export type DevisMinAggregateInputType = {
    id?: true
    demandeId?: true
    userId?: true
    numero?: true
    client?: true
    mail?: true
    mail2?: true
    adresseLivraison?: true
    dateLivraison?: true
    dateExamen?: true
    adresse?: true
    siret?: true
    numNDA?: true
    dateFormation?: true
    suiviPar?: true
    designation?: true
    quantite?: true
    unite?: true
    prixUnitaire?: true
    tva?: true
    exoneration?: true
    datePriseEffet?: true
    montant?: true
    iban?: true
    bic?: true
    banque?: true
    intituleCompte?: true
    signature?: true
    statut?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DevisMaxAggregateInputType = {
    id?: true
    demandeId?: true
    userId?: true
    numero?: true
    client?: true
    mail?: true
    mail2?: true
    adresseLivraison?: true
    dateLivraison?: true
    dateExamen?: true
    adresse?: true
    siret?: true
    numNDA?: true
    dateFormation?: true
    suiviPar?: true
    designation?: true
    quantite?: true
    unite?: true
    prixUnitaire?: true
    tva?: true
    exoneration?: true
    datePriseEffet?: true
    montant?: true
    iban?: true
    bic?: true
    banque?: true
    intituleCompte?: true
    signature?: true
    statut?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DevisCountAggregateInputType = {
    id?: true
    demandeId?: true
    userId?: true
    numero?: true
    client?: true
    mail?: true
    mail2?: true
    adresseLivraison?: true
    dateLivraison?: true
    dateExamen?: true
    adresse?: true
    siret?: true
    numNDA?: true
    dateFormation?: true
    suiviPar?: true
    designation?: true
    quantite?: true
    unite?: true
    prixUnitaire?: true
    tva?: true
    exoneration?: true
    datePriseEffet?: true
    montant?: true
    iban?: true
    bic?: true
    banque?: true
    intituleCompte?: true
    signature?: true
    statut?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DevisAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Devis to aggregate.
     */
    where?: DevisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Devis to fetch.
     */
    orderBy?: DevisOrderByWithRelationInput | DevisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DevisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Devis from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Devis.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Devis
    **/
    _count?: true | DevisCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DevisAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DevisSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DevisMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DevisMaxAggregateInputType
  }

  export type GetDevisAggregateType<T extends DevisAggregateArgs> = {
        [P in keyof T & keyof AggregateDevis]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDevis[P]>
      : GetScalarType<T[P], AggregateDevis[P]>
  }




  export type DevisGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DevisWhereInput
    orderBy?: DevisOrderByWithAggregationInput | DevisOrderByWithAggregationInput[]
    by: DevisScalarFieldEnum[] | DevisScalarFieldEnum
    having?: DevisScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DevisCountAggregateInputType | true
    _avg?: DevisAvgAggregateInputType
    _sum?: DevisSumAggregateInputType
    _min?: DevisMinAggregateInputType
    _max?: DevisMaxAggregateInputType
  }

  export type DevisGroupByOutputType = {
    id: string
    demandeId: string
    userId: string
    numero: string
    client: string
    mail: string
    mail2: string
    adresseLivraison: string | null
    dateLivraison: Date | null
    dateExamen: Date | null
    adresse: string | null
    siret: string | null
    numNDA: string | null
    dateFormation: Date | null
    suiviPar: string | null
    designation: string
    quantite: number
    unite: string
    prixUnitaire: number
    tva: number
    exoneration: string | null
    datePriseEffet: Date | null
    montant: number
    iban: string | null
    bic: string | null
    banque: string | null
    intituleCompte: string | null
    signature: string | null
    statut: $Enums.Statut
    createdAt: Date
    updatedAt: Date
    _count: DevisCountAggregateOutputType | null
    _avg: DevisAvgAggregateOutputType | null
    _sum: DevisSumAggregateOutputType | null
    _min: DevisMinAggregateOutputType | null
    _max: DevisMaxAggregateOutputType | null
  }

  type GetDevisGroupByPayload<T extends DevisGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DevisGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DevisGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DevisGroupByOutputType[P]>
            : GetScalarType<T[P], DevisGroupByOutputType[P]>
        }
      >
    >


  export type DevisSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    demandeId?: boolean
    userId?: boolean
    numero?: boolean
    client?: boolean
    mail?: boolean
    mail2?: boolean
    adresseLivraison?: boolean
    dateLivraison?: boolean
    dateExamen?: boolean
    adresse?: boolean
    siret?: boolean
    numNDA?: boolean
    dateFormation?: boolean
    suiviPar?: boolean
    designation?: boolean
    quantite?: boolean
    unite?: boolean
    prixUnitaire?: boolean
    tva?: boolean
    exoneration?: boolean
    datePriseEffet?: boolean
    montant?: boolean
    iban?: boolean
    bic?: boolean
    banque?: boolean
    intituleCompte?: boolean
    signature?: boolean
    statut?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    demande?: boolean | DemandeDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
    contrat?: boolean | Devis$contratArgs<ExtArgs>
  }, ExtArgs["result"]["devis"]>

  export type DevisSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    demandeId?: boolean
    userId?: boolean
    numero?: boolean
    client?: boolean
    mail?: boolean
    mail2?: boolean
    adresseLivraison?: boolean
    dateLivraison?: boolean
    dateExamen?: boolean
    adresse?: boolean
    siret?: boolean
    numNDA?: boolean
    dateFormation?: boolean
    suiviPar?: boolean
    designation?: boolean
    quantite?: boolean
    unite?: boolean
    prixUnitaire?: boolean
    tva?: boolean
    exoneration?: boolean
    datePriseEffet?: boolean
    montant?: boolean
    iban?: boolean
    bic?: boolean
    banque?: boolean
    intituleCompte?: boolean
    signature?: boolean
    statut?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    demande?: boolean | DemandeDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["devis"]>

  export type DevisSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    demandeId?: boolean
    userId?: boolean
    numero?: boolean
    client?: boolean
    mail?: boolean
    mail2?: boolean
    adresseLivraison?: boolean
    dateLivraison?: boolean
    dateExamen?: boolean
    adresse?: boolean
    siret?: boolean
    numNDA?: boolean
    dateFormation?: boolean
    suiviPar?: boolean
    designation?: boolean
    quantite?: boolean
    unite?: boolean
    prixUnitaire?: boolean
    tva?: boolean
    exoneration?: boolean
    datePriseEffet?: boolean
    montant?: boolean
    iban?: boolean
    bic?: boolean
    banque?: boolean
    intituleCompte?: boolean
    signature?: boolean
    statut?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    demande?: boolean | DemandeDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["devis"]>

  export type DevisSelectScalar = {
    id?: boolean
    demandeId?: boolean
    userId?: boolean
    numero?: boolean
    client?: boolean
    mail?: boolean
    mail2?: boolean
    adresseLivraison?: boolean
    dateLivraison?: boolean
    dateExamen?: boolean
    adresse?: boolean
    siret?: boolean
    numNDA?: boolean
    dateFormation?: boolean
    suiviPar?: boolean
    designation?: boolean
    quantite?: boolean
    unite?: boolean
    prixUnitaire?: boolean
    tva?: boolean
    exoneration?: boolean
    datePriseEffet?: boolean
    montant?: boolean
    iban?: boolean
    bic?: boolean
    banque?: boolean
    intituleCompte?: boolean
    signature?: boolean
    statut?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DevisOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "demandeId" | "userId" | "numero" | "client" | "mail" | "mail2" | "adresseLivraison" | "dateLivraison" | "dateExamen" | "adresse" | "siret" | "numNDA" | "dateFormation" | "suiviPar" | "designation" | "quantite" | "unite" | "prixUnitaire" | "tva" | "exoneration" | "datePriseEffet" | "montant" | "iban" | "bic" | "banque" | "intituleCompte" | "signature" | "statut" | "createdAt" | "updatedAt", ExtArgs["result"]["devis"]>
  export type DevisInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    demande?: boolean | DemandeDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
    contrat?: boolean | Devis$contratArgs<ExtArgs>
  }
  export type DevisIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    demande?: boolean | DemandeDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type DevisIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    demande?: boolean | DemandeDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $DevisPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Devis"
    objects: {
      demande: Prisma.$DemandePayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs>
      contrat: Prisma.$ContratPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      demandeId: string
      userId: string
      numero: string
      client: string
      mail: string
      mail2: string
      adresseLivraison: string | null
      dateLivraison: Date | null
      dateExamen: Date | null
      adresse: string | null
      siret: string | null
      numNDA: string | null
      dateFormation: Date | null
      suiviPar: string | null
      designation: string
      quantite: number
      unite: string
      prixUnitaire: number
      tva: number
      exoneration: string | null
      datePriseEffet: Date | null
      montant: number
      iban: string | null
      bic: string | null
      banque: string | null
      intituleCompte: string | null
      signature: string | null
      statut: $Enums.Statut
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["devis"]>
    composites: {}
  }

  type DevisGetPayload<S extends boolean | null | undefined | DevisDefaultArgs> = $Result.GetResult<Prisma.$DevisPayload, S>

  type DevisCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DevisFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DevisCountAggregateInputType | true
    }

  export interface DevisDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Devis'], meta: { name: 'Devis' } }
    /**
     * Find zero or one Devis that matches the filter.
     * @param {DevisFindUniqueArgs} args - Arguments to find a Devis
     * @example
     * // Get one Devis
     * const devis = await prisma.devis.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DevisFindUniqueArgs>(args: SelectSubset<T, DevisFindUniqueArgs<ExtArgs>>): Prisma__DevisClient<$Result.GetResult<Prisma.$DevisPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Devis that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DevisFindUniqueOrThrowArgs} args - Arguments to find a Devis
     * @example
     * // Get one Devis
     * const devis = await prisma.devis.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DevisFindUniqueOrThrowArgs>(args: SelectSubset<T, DevisFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DevisClient<$Result.GetResult<Prisma.$DevisPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Devis that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DevisFindFirstArgs} args - Arguments to find a Devis
     * @example
     * // Get one Devis
     * const devis = await prisma.devis.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DevisFindFirstArgs>(args?: SelectSubset<T, DevisFindFirstArgs<ExtArgs>>): Prisma__DevisClient<$Result.GetResult<Prisma.$DevisPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Devis that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DevisFindFirstOrThrowArgs} args - Arguments to find a Devis
     * @example
     * // Get one Devis
     * const devis = await prisma.devis.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DevisFindFirstOrThrowArgs>(args?: SelectSubset<T, DevisFindFirstOrThrowArgs<ExtArgs>>): Prisma__DevisClient<$Result.GetResult<Prisma.$DevisPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Devis that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DevisFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Devis
     * const devis = await prisma.devis.findMany()
     * 
     * // Get first 10 Devis
     * const devis = await prisma.devis.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const devisWithIdOnly = await prisma.devis.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DevisFindManyArgs>(args?: SelectSubset<T, DevisFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DevisPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Devis.
     * @param {DevisCreateArgs} args - Arguments to create a Devis.
     * @example
     * // Create one Devis
     * const Devis = await prisma.devis.create({
     *   data: {
     *     // ... data to create a Devis
     *   }
     * })
     * 
     */
    create<T extends DevisCreateArgs>(args: SelectSubset<T, DevisCreateArgs<ExtArgs>>): Prisma__DevisClient<$Result.GetResult<Prisma.$DevisPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Devis.
     * @param {DevisCreateManyArgs} args - Arguments to create many Devis.
     * @example
     * // Create many Devis
     * const devis = await prisma.devis.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DevisCreateManyArgs>(args?: SelectSubset<T, DevisCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Devis and returns the data saved in the database.
     * @param {DevisCreateManyAndReturnArgs} args - Arguments to create many Devis.
     * @example
     * // Create many Devis
     * const devis = await prisma.devis.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Devis and only return the `id`
     * const devisWithIdOnly = await prisma.devis.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DevisCreateManyAndReturnArgs>(args?: SelectSubset<T, DevisCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DevisPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Devis.
     * @param {DevisDeleteArgs} args - Arguments to delete one Devis.
     * @example
     * // Delete one Devis
     * const Devis = await prisma.devis.delete({
     *   where: {
     *     // ... filter to delete one Devis
     *   }
     * })
     * 
     */
    delete<T extends DevisDeleteArgs>(args: SelectSubset<T, DevisDeleteArgs<ExtArgs>>): Prisma__DevisClient<$Result.GetResult<Prisma.$DevisPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Devis.
     * @param {DevisUpdateArgs} args - Arguments to update one Devis.
     * @example
     * // Update one Devis
     * const devis = await prisma.devis.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DevisUpdateArgs>(args: SelectSubset<T, DevisUpdateArgs<ExtArgs>>): Prisma__DevisClient<$Result.GetResult<Prisma.$DevisPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Devis.
     * @param {DevisDeleteManyArgs} args - Arguments to filter Devis to delete.
     * @example
     * // Delete a few Devis
     * const { count } = await prisma.devis.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DevisDeleteManyArgs>(args?: SelectSubset<T, DevisDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Devis.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DevisUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Devis
     * const devis = await prisma.devis.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DevisUpdateManyArgs>(args: SelectSubset<T, DevisUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Devis and returns the data updated in the database.
     * @param {DevisUpdateManyAndReturnArgs} args - Arguments to update many Devis.
     * @example
     * // Update many Devis
     * const devis = await prisma.devis.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Devis and only return the `id`
     * const devisWithIdOnly = await prisma.devis.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DevisUpdateManyAndReturnArgs>(args: SelectSubset<T, DevisUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DevisPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Devis.
     * @param {DevisUpsertArgs} args - Arguments to update or create a Devis.
     * @example
     * // Update or create a Devis
     * const devis = await prisma.devis.upsert({
     *   create: {
     *     // ... data to create a Devis
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Devis we want to update
     *   }
     * })
     */
    upsert<T extends DevisUpsertArgs>(args: SelectSubset<T, DevisUpsertArgs<ExtArgs>>): Prisma__DevisClient<$Result.GetResult<Prisma.$DevisPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Devis.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DevisCountArgs} args - Arguments to filter Devis to count.
     * @example
     * // Count the number of Devis
     * const count = await prisma.devis.count({
     *   where: {
     *     // ... the filter for the Devis we want to count
     *   }
     * })
    **/
    count<T extends DevisCountArgs>(
      args?: Subset<T, DevisCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DevisCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Devis.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DevisAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DevisAggregateArgs>(args: Subset<T, DevisAggregateArgs>): Prisma.PrismaPromise<GetDevisAggregateType<T>>

    /**
     * Group by Devis.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DevisGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DevisGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DevisGroupByArgs['orderBy'] }
        : { orderBy?: DevisGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DevisGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDevisGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Devis model
   */
  readonly fields: DevisFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Devis.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DevisClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    demande<T extends DemandeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DemandeDefaultArgs<ExtArgs>>): Prisma__DemandeClient<$Result.GetResult<Prisma.$DemandePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    contrat<T extends Devis$contratArgs<ExtArgs> = {}>(args?: Subset<T, Devis$contratArgs<ExtArgs>>): Prisma__ContratClient<$Result.GetResult<Prisma.$ContratPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Devis model
   */
  interface DevisFieldRefs {
    readonly id: FieldRef<"Devis", 'String'>
    readonly demandeId: FieldRef<"Devis", 'String'>
    readonly userId: FieldRef<"Devis", 'String'>
    readonly numero: FieldRef<"Devis", 'String'>
    readonly client: FieldRef<"Devis", 'String'>
    readonly mail: FieldRef<"Devis", 'String'>
    readonly mail2: FieldRef<"Devis", 'String'>
    readonly adresseLivraison: FieldRef<"Devis", 'String'>
    readonly dateLivraison: FieldRef<"Devis", 'DateTime'>
    readonly dateExamen: FieldRef<"Devis", 'DateTime'>
    readonly adresse: FieldRef<"Devis", 'String'>
    readonly siret: FieldRef<"Devis", 'String'>
    readonly numNDA: FieldRef<"Devis", 'String'>
    readonly dateFormation: FieldRef<"Devis", 'DateTime'>
    readonly suiviPar: FieldRef<"Devis", 'String'>
    readonly designation: FieldRef<"Devis", 'String'>
    readonly quantite: FieldRef<"Devis", 'Int'>
    readonly unite: FieldRef<"Devis", 'String'>
    readonly prixUnitaire: FieldRef<"Devis", 'Float'>
    readonly tva: FieldRef<"Devis", 'Float'>
    readonly exoneration: FieldRef<"Devis", 'String'>
    readonly datePriseEffet: FieldRef<"Devis", 'DateTime'>
    readonly montant: FieldRef<"Devis", 'Float'>
    readonly iban: FieldRef<"Devis", 'String'>
    readonly bic: FieldRef<"Devis", 'String'>
    readonly banque: FieldRef<"Devis", 'String'>
    readonly intituleCompte: FieldRef<"Devis", 'String'>
    readonly signature: FieldRef<"Devis", 'String'>
    readonly statut: FieldRef<"Devis", 'Statut'>
    readonly createdAt: FieldRef<"Devis", 'DateTime'>
    readonly updatedAt: FieldRef<"Devis", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Devis findUnique
   */
  export type DevisFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devis
     */
    select?: DevisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devis
     */
    omit?: DevisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevisInclude<ExtArgs> | null
    /**
     * Filter, which Devis to fetch.
     */
    where: DevisWhereUniqueInput
  }

  /**
   * Devis findUniqueOrThrow
   */
  export type DevisFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devis
     */
    select?: DevisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devis
     */
    omit?: DevisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevisInclude<ExtArgs> | null
    /**
     * Filter, which Devis to fetch.
     */
    where: DevisWhereUniqueInput
  }

  /**
   * Devis findFirst
   */
  export type DevisFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devis
     */
    select?: DevisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devis
     */
    omit?: DevisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevisInclude<ExtArgs> | null
    /**
     * Filter, which Devis to fetch.
     */
    where?: DevisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Devis to fetch.
     */
    orderBy?: DevisOrderByWithRelationInput | DevisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Devis.
     */
    cursor?: DevisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Devis from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Devis.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Devis.
     */
    distinct?: DevisScalarFieldEnum | DevisScalarFieldEnum[]
  }

  /**
   * Devis findFirstOrThrow
   */
  export type DevisFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devis
     */
    select?: DevisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devis
     */
    omit?: DevisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevisInclude<ExtArgs> | null
    /**
     * Filter, which Devis to fetch.
     */
    where?: DevisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Devis to fetch.
     */
    orderBy?: DevisOrderByWithRelationInput | DevisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Devis.
     */
    cursor?: DevisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Devis from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Devis.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Devis.
     */
    distinct?: DevisScalarFieldEnum | DevisScalarFieldEnum[]
  }

  /**
   * Devis findMany
   */
  export type DevisFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devis
     */
    select?: DevisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devis
     */
    omit?: DevisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevisInclude<ExtArgs> | null
    /**
     * Filter, which Devis to fetch.
     */
    where?: DevisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Devis to fetch.
     */
    orderBy?: DevisOrderByWithRelationInput | DevisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Devis.
     */
    cursor?: DevisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Devis from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Devis.
     */
    skip?: number
    distinct?: DevisScalarFieldEnum | DevisScalarFieldEnum[]
  }

  /**
   * Devis create
   */
  export type DevisCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devis
     */
    select?: DevisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devis
     */
    omit?: DevisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevisInclude<ExtArgs> | null
    /**
     * The data needed to create a Devis.
     */
    data: XOR<DevisCreateInput, DevisUncheckedCreateInput>
  }

  /**
   * Devis createMany
   */
  export type DevisCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Devis.
     */
    data: DevisCreateManyInput | DevisCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Devis createManyAndReturn
   */
  export type DevisCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devis
     */
    select?: DevisSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Devis
     */
    omit?: DevisOmit<ExtArgs> | null
    /**
     * The data used to create many Devis.
     */
    data: DevisCreateManyInput | DevisCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevisIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Devis update
   */
  export type DevisUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devis
     */
    select?: DevisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devis
     */
    omit?: DevisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevisInclude<ExtArgs> | null
    /**
     * The data needed to update a Devis.
     */
    data: XOR<DevisUpdateInput, DevisUncheckedUpdateInput>
    /**
     * Choose, which Devis to update.
     */
    where: DevisWhereUniqueInput
  }

  /**
   * Devis updateMany
   */
  export type DevisUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Devis.
     */
    data: XOR<DevisUpdateManyMutationInput, DevisUncheckedUpdateManyInput>
    /**
     * Filter which Devis to update
     */
    where?: DevisWhereInput
    /**
     * Limit how many Devis to update.
     */
    limit?: number
  }

  /**
   * Devis updateManyAndReturn
   */
  export type DevisUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devis
     */
    select?: DevisSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Devis
     */
    omit?: DevisOmit<ExtArgs> | null
    /**
     * The data used to update Devis.
     */
    data: XOR<DevisUpdateManyMutationInput, DevisUncheckedUpdateManyInput>
    /**
     * Filter which Devis to update
     */
    where?: DevisWhereInput
    /**
     * Limit how many Devis to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevisIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Devis upsert
   */
  export type DevisUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devis
     */
    select?: DevisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devis
     */
    omit?: DevisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevisInclude<ExtArgs> | null
    /**
     * The filter to search for the Devis to update in case it exists.
     */
    where: DevisWhereUniqueInput
    /**
     * In case the Devis found by the `where` argument doesn't exist, create a new Devis with this data.
     */
    create: XOR<DevisCreateInput, DevisUncheckedCreateInput>
    /**
     * In case the Devis was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DevisUpdateInput, DevisUncheckedUpdateInput>
  }

  /**
   * Devis delete
   */
  export type DevisDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devis
     */
    select?: DevisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devis
     */
    omit?: DevisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevisInclude<ExtArgs> | null
    /**
     * Filter which Devis to delete.
     */
    where: DevisWhereUniqueInput
  }

  /**
   * Devis deleteMany
   */
  export type DevisDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Devis to delete
     */
    where?: DevisWhereInput
    /**
     * Limit how many Devis to delete.
     */
    limit?: number
  }

  /**
   * Devis.contrat
   */
  export type Devis$contratArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contrat
     */
    select?: ContratSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contrat
     */
    omit?: ContratOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContratInclude<ExtArgs> | null
    where?: ContratWhereInput
  }

  /**
   * Devis without action
   */
  export type DevisDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devis
     */
    select?: DevisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devis
     */
    omit?: DevisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevisInclude<ExtArgs> | null
  }


  /**
   * Model Contrat
   */

  export type AggregateContrat = {
    _count: ContratCountAggregateOutputType | null
    _min: ContratMinAggregateOutputType | null
    _max: ContratMaxAggregateOutputType | null
  }

  export type ContratMinAggregateOutputType = {
    id: string | null
    devisId: string | null
    userId: string | null
    statut: $Enums.Statut | null
    dateDebut: Date | null
    dateFin: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ContratMaxAggregateOutputType = {
    id: string | null
    devisId: string | null
    userId: string | null
    statut: $Enums.Statut | null
    dateDebut: Date | null
    dateFin: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ContratCountAggregateOutputType = {
    id: number
    devisId: number
    userId: number
    statut: number
    dateDebut: number
    dateFin: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ContratMinAggregateInputType = {
    id?: true
    devisId?: true
    userId?: true
    statut?: true
    dateDebut?: true
    dateFin?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ContratMaxAggregateInputType = {
    id?: true
    devisId?: true
    userId?: true
    statut?: true
    dateDebut?: true
    dateFin?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ContratCountAggregateInputType = {
    id?: true
    devisId?: true
    userId?: true
    statut?: true
    dateDebut?: true
    dateFin?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ContratAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Contrat to aggregate.
     */
    where?: ContratWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Contrats to fetch.
     */
    orderBy?: ContratOrderByWithRelationInput | ContratOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ContratWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Contrats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Contrats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Contrats
    **/
    _count?: true | ContratCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ContratMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ContratMaxAggregateInputType
  }

  export type GetContratAggregateType<T extends ContratAggregateArgs> = {
        [P in keyof T & keyof AggregateContrat]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateContrat[P]>
      : GetScalarType<T[P], AggregateContrat[P]>
  }




  export type ContratGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ContratWhereInput
    orderBy?: ContratOrderByWithAggregationInput | ContratOrderByWithAggregationInput[]
    by: ContratScalarFieldEnum[] | ContratScalarFieldEnum
    having?: ContratScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ContratCountAggregateInputType | true
    _min?: ContratMinAggregateInputType
    _max?: ContratMaxAggregateInputType
  }

  export type ContratGroupByOutputType = {
    id: string
    devisId: string
    userId: string
    statut: $Enums.Statut
    dateDebut: Date | null
    dateFin: Date | null
    createdAt: Date
    updatedAt: Date
    _count: ContratCountAggregateOutputType | null
    _min: ContratMinAggregateOutputType | null
    _max: ContratMaxAggregateOutputType | null
  }

  type GetContratGroupByPayload<T extends ContratGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ContratGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ContratGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ContratGroupByOutputType[P]>
            : GetScalarType<T[P], ContratGroupByOutputType[P]>
        }
      >
    >


  export type ContratSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    devisId?: boolean
    userId?: boolean
    statut?: boolean
    dateDebut?: boolean
    dateFin?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    devis?: boolean | DevisDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["contrat"]>

  export type ContratSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    devisId?: boolean
    userId?: boolean
    statut?: boolean
    dateDebut?: boolean
    dateFin?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    devis?: boolean | DevisDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["contrat"]>

  export type ContratSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    devisId?: boolean
    userId?: boolean
    statut?: boolean
    dateDebut?: boolean
    dateFin?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    devis?: boolean | DevisDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["contrat"]>

  export type ContratSelectScalar = {
    id?: boolean
    devisId?: boolean
    userId?: boolean
    statut?: boolean
    dateDebut?: boolean
    dateFin?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ContratOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "devisId" | "userId" | "statut" | "dateDebut" | "dateFin" | "createdAt" | "updatedAt", ExtArgs["result"]["contrat"]>
  export type ContratInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    devis?: boolean | DevisDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ContratIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    devis?: boolean | DevisDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ContratIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    devis?: boolean | DevisDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ContratPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Contrat"
    objects: {
      devis: Prisma.$DevisPayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      devisId: string
      userId: string
      statut: $Enums.Statut
      dateDebut: Date | null
      dateFin: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["contrat"]>
    composites: {}
  }

  type ContratGetPayload<S extends boolean | null | undefined | ContratDefaultArgs> = $Result.GetResult<Prisma.$ContratPayload, S>

  type ContratCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ContratFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ContratCountAggregateInputType | true
    }

  export interface ContratDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Contrat'], meta: { name: 'Contrat' } }
    /**
     * Find zero or one Contrat that matches the filter.
     * @param {ContratFindUniqueArgs} args - Arguments to find a Contrat
     * @example
     * // Get one Contrat
     * const contrat = await prisma.contrat.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ContratFindUniqueArgs>(args: SelectSubset<T, ContratFindUniqueArgs<ExtArgs>>): Prisma__ContratClient<$Result.GetResult<Prisma.$ContratPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Contrat that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ContratFindUniqueOrThrowArgs} args - Arguments to find a Contrat
     * @example
     * // Get one Contrat
     * const contrat = await prisma.contrat.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ContratFindUniqueOrThrowArgs>(args: SelectSubset<T, ContratFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ContratClient<$Result.GetResult<Prisma.$ContratPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Contrat that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContratFindFirstArgs} args - Arguments to find a Contrat
     * @example
     * // Get one Contrat
     * const contrat = await prisma.contrat.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ContratFindFirstArgs>(args?: SelectSubset<T, ContratFindFirstArgs<ExtArgs>>): Prisma__ContratClient<$Result.GetResult<Prisma.$ContratPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Contrat that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContratFindFirstOrThrowArgs} args - Arguments to find a Contrat
     * @example
     * // Get one Contrat
     * const contrat = await prisma.contrat.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ContratFindFirstOrThrowArgs>(args?: SelectSubset<T, ContratFindFirstOrThrowArgs<ExtArgs>>): Prisma__ContratClient<$Result.GetResult<Prisma.$ContratPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Contrats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContratFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Contrats
     * const contrats = await prisma.contrat.findMany()
     * 
     * // Get first 10 Contrats
     * const contrats = await prisma.contrat.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const contratWithIdOnly = await prisma.contrat.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ContratFindManyArgs>(args?: SelectSubset<T, ContratFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContratPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Contrat.
     * @param {ContratCreateArgs} args - Arguments to create a Contrat.
     * @example
     * // Create one Contrat
     * const Contrat = await prisma.contrat.create({
     *   data: {
     *     // ... data to create a Contrat
     *   }
     * })
     * 
     */
    create<T extends ContratCreateArgs>(args: SelectSubset<T, ContratCreateArgs<ExtArgs>>): Prisma__ContratClient<$Result.GetResult<Prisma.$ContratPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Contrats.
     * @param {ContratCreateManyArgs} args - Arguments to create many Contrats.
     * @example
     * // Create many Contrats
     * const contrat = await prisma.contrat.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ContratCreateManyArgs>(args?: SelectSubset<T, ContratCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Contrats and returns the data saved in the database.
     * @param {ContratCreateManyAndReturnArgs} args - Arguments to create many Contrats.
     * @example
     * // Create many Contrats
     * const contrat = await prisma.contrat.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Contrats and only return the `id`
     * const contratWithIdOnly = await prisma.contrat.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ContratCreateManyAndReturnArgs>(args?: SelectSubset<T, ContratCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContratPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Contrat.
     * @param {ContratDeleteArgs} args - Arguments to delete one Contrat.
     * @example
     * // Delete one Contrat
     * const Contrat = await prisma.contrat.delete({
     *   where: {
     *     // ... filter to delete one Contrat
     *   }
     * })
     * 
     */
    delete<T extends ContratDeleteArgs>(args: SelectSubset<T, ContratDeleteArgs<ExtArgs>>): Prisma__ContratClient<$Result.GetResult<Prisma.$ContratPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Contrat.
     * @param {ContratUpdateArgs} args - Arguments to update one Contrat.
     * @example
     * // Update one Contrat
     * const contrat = await prisma.contrat.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ContratUpdateArgs>(args: SelectSubset<T, ContratUpdateArgs<ExtArgs>>): Prisma__ContratClient<$Result.GetResult<Prisma.$ContratPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Contrats.
     * @param {ContratDeleteManyArgs} args - Arguments to filter Contrats to delete.
     * @example
     * // Delete a few Contrats
     * const { count } = await prisma.contrat.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ContratDeleteManyArgs>(args?: SelectSubset<T, ContratDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Contrats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContratUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Contrats
     * const contrat = await prisma.contrat.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ContratUpdateManyArgs>(args: SelectSubset<T, ContratUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Contrats and returns the data updated in the database.
     * @param {ContratUpdateManyAndReturnArgs} args - Arguments to update many Contrats.
     * @example
     * // Update many Contrats
     * const contrat = await prisma.contrat.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Contrats and only return the `id`
     * const contratWithIdOnly = await prisma.contrat.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ContratUpdateManyAndReturnArgs>(args: SelectSubset<T, ContratUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContratPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Contrat.
     * @param {ContratUpsertArgs} args - Arguments to update or create a Contrat.
     * @example
     * // Update or create a Contrat
     * const contrat = await prisma.contrat.upsert({
     *   create: {
     *     // ... data to create a Contrat
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Contrat we want to update
     *   }
     * })
     */
    upsert<T extends ContratUpsertArgs>(args: SelectSubset<T, ContratUpsertArgs<ExtArgs>>): Prisma__ContratClient<$Result.GetResult<Prisma.$ContratPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Contrats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContratCountArgs} args - Arguments to filter Contrats to count.
     * @example
     * // Count the number of Contrats
     * const count = await prisma.contrat.count({
     *   where: {
     *     // ... the filter for the Contrats we want to count
     *   }
     * })
    **/
    count<T extends ContratCountArgs>(
      args?: Subset<T, ContratCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ContratCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Contrat.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContratAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ContratAggregateArgs>(args: Subset<T, ContratAggregateArgs>): Prisma.PrismaPromise<GetContratAggregateType<T>>

    /**
     * Group by Contrat.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContratGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ContratGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ContratGroupByArgs['orderBy'] }
        : { orderBy?: ContratGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ContratGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetContratGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Contrat model
   */
  readonly fields: ContratFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Contrat.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ContratClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    devis<T extends DevisDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DevisDefaultArgs<ExtArgs>>): Prisma__DevisClient<$Result.GetResult<Prisma.$DevisPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Contrat model
   */
  interface ContratFieldRefs {
    readonly id: FieldRef<"Contrat", 'String'>
    readonly devisId: FieldRef<"Contrat", 'String'>
    readonly userId: FieldRef<"Contrat", 'String'>
    readonly statut: FieldRef<"Contrat", 'Statut'>
    readonly dateDebut: FieldRef<"Contrat", 'DateTime'>
    readonly dateFin: FieldRef<"Contrat", 'DateTime'>
    readonly createdAt: FieldRef<"Contrat", 'DateTime'>
    readonly updatedAt: FieldRef<"Contrat", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Contrat findUnique
   */
  export type ContratFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contrat
     */
    select?: ContratSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contrat
     */
    omit?: ContratOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContratInclude<ExtArgs> | null
    /**
     * Filter, which Contrat to fetch.
     */
    where: ContratWhereUniqueInput
  }

  /**
   * Contrat findUniqueOrThrow
   */
  export type ContratFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contrat
     */
    select?: ContratSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contrat
     */
    omit?: ContratOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContratInclude<ExtArgs> | null
    /**
     * Filter, which Contrat to fetch.
     */
    where: ContratWhereUniqueInput
  }

  /**
   * Contrat findFirst
   */
  export type ContratFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contrat
     */
    select?: ContratSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contrat
     */
    omit?: ContratOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContratInclude<ExtArgs> | null
    /**
     * Filter, which Contrat to fetch.
     */
    where?: ContratWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Contrats to fetch.
     */
    orderBy?: ContratOrderByWithRelationInput | ContratOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Contrats.
     */
    cursor?: ContratWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Contrats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Contrats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Contrats.
     */
    distinct?: ContratScalarFieldEnum | ContratScalarFieldEnum[]
  }

  /**
   * Contrat findFirstOrThrow
   */
  export type ContratFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contrat
     */
    select?: ContratSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contrat
     */
    omit?: ContratOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContratInclude<ExtArgs> | null
    /**
     * Filter, which Contrat to fetch.
     */
    where?: ContratWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Contrats to fetch.
     */
    orderBy?: ContratOrderByWithRelationInput | ContratOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Contrats.
     */
    cursor?: ContratWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Contrats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Contrats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Contrats.
     */
    distinct?: ContratScalarFieldEnum | ContratScalarFieldEnum[]
  }

  /**
   * Contrat findMany
   */
  export type ContratFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contrat
     */
    select?: ContratSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contrat
     */
    omit?: ContratOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContratInclude<ExtArgs> | null
    /**
     * Filter, which Contrats to fetch.
     */
    where?: ContratWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Contrats to fetch.
     */
    orderBy?: ContratOrderByWithRelationInput | ContratOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Contrats.
     */
    cursor?: ContratWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Contrats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Contrats.
     */
    skip?: number
    distinct?: ContratScalarFieldEnum | ContratScalarFieldEnum[]
  }

  /**
   * Contrat create
   */
  export type ContratCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contrat
     */
    select?: ContratSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contrat
     */
    omit?: ContratOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContratInclude<ExtArgs> | null
    /**
     * The data needed to create a Contrat.
     */
    data: XOR<ContratCreateInput, ContratUncheckedCreateInput>
  }

  /**
   * Contrat createMany
   */
  export type ContratCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Contrats.
     */
    data: ContratCreateManyInput | ContratCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Contrat createManyAndReturn
   */
  export type ContratCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contrat
     */
    select?: ContratSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Contrat
     */
    omit?: ContratOmit<ExtArgs> | null
    /**
     * The data used to create many Contrats.
     */
    data: ContratCreateManyInput | ContratCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContratIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Contrat update
   */
  export type ContratUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contrat
     */
    select?: ContratSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contrat
     */
    omit?: ContratOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContratInclude<ExtArgs> | null
    /**
     * The data needed to update a Contrat.
     */
    data: XOR<ContratUpdateInput, ContratUncheckedUpdateInput>
    /**
     * Choose, which Contrat to update.
     */
    where: ContratWhereUniqueInput
  }

  /**
   * Contrat updateMany
   */
  export type ContratUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Contrats.
     */
    data: XOR<ContratUpdateManyMutationInput, ContratUncheckedUpdateManyInput>
    /**
     * Filter which Contrats to update
     */
    where?: ContratWhereInput
    /**
     * Limit how many Contrats to update.
     */
    limit?: number
  }

  /**
   * Contrat updateManyAndReturn
   */
  export type ContratUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contrat
     */
    select?: ContratSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Contrat
     */
    omit?: ContratOmit<ExtArgs> | null
    /**
     * The data used to update Contrats.
     */
    data: XOR<ContratUpdateManyMutationInput, ContratUncheckedUpdateManyInput>
    /**
     * Filter which Contrats to update
     */
    where?: ContratWhereInput
    /**
     * Limit how many Contrats to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContratIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Contrat upsert
   */
  export type ContratUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contrat
     */
    select?: ContratSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contrat
     */
    omit?: ContratOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContratInclude<ExtArgs> | null
    /**
     * The filter to search for the Contrat to update in case it exists.
     */
    where: ContratWhereUniqueInput
    /**
     * In case the Contrat found by the `where` argument doesn't exist, create a new Contrat with this data.
     */
    create: XOR<ContratCreateInput, ContratUncheckedCreateInput>
    /**
     * In case the Contrat was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ContratUpdateInput, ContratUncheckedUpdateInput>
  }

  /**
   * Contrat delete
   */
  export type ContratDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contrat
     */
    select?: ContratSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contrat
     */
    omit?: ContratOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContratInclude<ExtArgs> | null
    /**
     * Filter which Contrat to delete.
     */
    where: ContratWhereUniqueInput
  }

  /**
   * Contrat deleteMany
   */
  export type ContratDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Contrats to delete
     */
    where?: ContratWhereInput
    /**
     * Limit how many Contrats to delete.
     */
    limit?: number
  }

  /**
   * Contrat without action
   */
  export type ContratDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contrat
     */
    select?: ContratSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contrat
     */
    omit?: ContratOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContratInclude<ExtArgs> | null
  }


  /**
   * Model Settings
   */

  export type AggregateSettings = {
    _count: SettingsCountAggregateOutputType | null
    _min: SettingsMinAggregateOutputType | null
    _max: SettingsMaxAggregateOutputType | null
  }

  export type SettingsMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SettingsMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SettingsCountAggregateOutputType = {
    id: number
    company: number
    formation: number
    email: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SettingsMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SettingsMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SettingsCountAggregateInputType = {
    id?: true
    company?: true
    formation?: true
    email?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SettingsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Settings to aggregate.
     */
    where?: SettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settings to fetch.
     */
    orderBy?: SettingsOrderByWithRelationInput | SettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Settings
    **/
    _count?: true | SettingsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SettingsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SettingsMaxAggregateInputType
  }

  export type GetSettingsAggregateType<T extends SettingsAggregateArgs> = {
        [P in keyof T & keyof AggregateSettings]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSettings[P]>
      : GetScalarType<T[P], AggregateSettings[P]>
  }




  export type SettingsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SettingsWhereInput
    orderBy?: SettingsOrderByWithAggregationInput | SettingsOrderByWithAggregationInput[]
    by: SettingsScalarFieldEnum[] | SettingsScalarFieldEnum
    having?: SettingsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SettingsCountAggregateInputType | true
    _min?: SettingsMinAggregateInputType
    _max?: SettingsMaxAggregateInputType
  }

  export type SettingsGroupByOutputType = {
    id: string
    company: JsonValue
    formation: JsonValue
    email: JsonValue
    createdAt: Date
    updatedAt: Date
    _count: SettingsCountAggregateOutputType | null
    _min: SettingsMinAggregateOutputType | null
    _max: SettingsMaxAggregateOutputType | null
  }

  type GetSettingsGroupByPayload<T extends SettingsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SettingsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SettingsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SettingsGroupByOutputType[P]>
            : GetScalarType<T[P], SettingsGroupByOutputType[P]>
        }
      >
    >


  export type SettingsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    company?: boolean
    formation?: boolean
    email?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["settings"]>

  export type SettingsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    company?: boolean
    formation?: boolean
    email?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["settings"]>

  export type SettingsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    company?: boolean
    formation?: boolean
    email?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["settings"]>

  export type SettingsSelectScalar = {
    id?: boolean
    company?: boolean
    formation?: boolean
    email?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SettingsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "company" | "formation" | "email" | "createdAt" | "updatedAt", ExtArgs["result"]["settings"]>

  export type $SettingsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Settings"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      company: Prisma.JsonValue
      formation: Prisma.JsonValue
      email: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["settings"]>
    composites: {}
  }

  type SettingsGetPayload<S extends boolean | null | undefined | SettingsDefaultArgs> = $Result.GetResult<Prisma.$SettingsPayload, S>

  type SettingsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SettingsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SettingsCountAggregateInputType | true
    }

  export interface SettingsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Settings'], meta: { name: 'Settings' } }
    /**
     * Find zero or one Settings that matches the filter.
     * @param {SettingsFindUniqueArgs} args - Arguments to find a Settings
     * @example
     * // Get one Settings
     * const settings = await prisma.settings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SettingsFindUniqueArgs>(args: SelectSubset<T, SettingsFindUniqueArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Settings that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SettingsFindUniqueOrThrowArgs} args - Arguments to find a Settings
     * @example
     * // Get one Settings
     * const settings = await prisma.settings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SettingsFindUniqueOrThrowArgs>(args: SelectSubset<T, SettingsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Settings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsFindFirstArgs} args - Arguments to find a Settings
     * @example
     * // Get one Settings
     * const settings = await prisma.settings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SettingsFindFirstArgs>(args?: SelectSubset<T, SettingsFindFirstArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Settings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsFindFirstOrThrowArgs} args - Arguments to find a Settings
     * @example
     * // Get one Settings
     * const settings = await prisma.settings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SettingsFindFirstOrThrowArgs>(args?: SelectSubset<T, SettingsFindFirstOrThrowArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Settings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Settings
     * const settings = await prisma.settings.findMany()
     * 
     * // Get first 10 Settings
     * const settings = await prisma.settings.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const settingsWithIdOnly = await prisma.settings.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SettingsFindManyArgs>(args?: SelectSubset<T, SettingsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Settings.
     * @param {SettingsCreateArgs} args - Arguments to create a Settings.
     * @example
     * // Create one Settings
     * const Settings = await prisma.settings.create({
     *   data: {
     *     // ... data to create a Settings
     *   }
     * })
     * 
     */
    create<T extends SettingsCreateArgs>(args: SelectSubset<T, SettingsCreateArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Settings.
     * @param {SettingsCreateManyArgs} args - Arguments to create many Settings.
     * @example
     * // Create many Settings
     * const settings = await prisma.settings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SettingsCreateManyArgs>(args?: SelectSubset<T, SettingsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Settings and returns the data saved in the database.
     * @param {SettingsCreateManyAndReturnArgs} args - Arguments to create many Settings.
     * @example
     * // Create many Settings
     * const settings = await prisma.settings.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Settings and only return the `id`
     * const settingsWithIdOnly = await prisma.settings.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SettingsCreateManyAndReturnArgs>(args?: SelectSubset<T, SettingsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Settings.
     * @param {SettingsDeleteArgs} args - Arguments to delete one Settings.
     * @example
     * // Delete one Settings
     * const Settings = await prisma.settings.delete({
     *   where: {
     *     // ... filter to delete one Settings
     *   }
     * })
     * 
     */
    delete<T extends SettingsDeleteArgs>(args: SelectSubset<T, SettingsDeleteArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Settings.
     * @param {SettingsUpdateArgs} args - Arguments to update one Settings.
     * @example
     * // Update one Settings
     * const settings = await prisma.settings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SettingsUpdateArgs>(args: SelectSubset<T, SettingsUpdateArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Settings.
     * @param {SettingsDeleteManyArgs} args - Arguments to filter Settings to delete.
     * @example
     * // Delete a few Settings
     * const { count } = await prisma.settings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SettingsDeleteManyArgs>(args?: SelectSubset<T, SettingsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Settings
     * const settings = await prisma.settings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SettingsUpdateManyArgs>(args: SelectSubset<T, SettingsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Settings and returns the data updated in the database.
     * @param {SettingsUpdateManyAndReturnArgs} args - Arguments to update many Settings.
     * @example
     * // Update many Settings
     * const settings = await prisma.settings.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Settings and only return the `id`
     * const settingsWithIdOnly = await prisma.settings.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SettingsUpdateManyAndReturnArgs>(args: SelectSubset<T, SettingsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Settings.
     * @param {SettingsUpsertArgs} args - Arguments to update or create a Settings.
     * @example
     * // Update or create a Settings
     * const settings = await prisma.settings.upsert({
     *   create: {
     *     // ... data to create a Settings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Settings we want to update
     *   }
     * })
     */
    upsert<T extends SettingsUpsertArgs>(args: SelectSubset<T, SettingsUpsertArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsCountArgs} args - Arguments to filter Settings to count.
     * @example
     * // Count the number of Settings
     * const count = await prisma.settings.count({
     *   where: {
     *     // ... the filter for the Settings we want to count
     *   }
     * })
    **/
    count<T extends SettingsCountArgs>(
      args?: Subset<T, SettingsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SettingsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SettingsAggregateArgs>(args: Subset<T, SettingsAggregateArgs>): Prisma.PrismaPromise<GetSettingsAggregateType<T>>

    /**
     * Group by Settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SettingsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SettingsGroupByArgs['orderBy'] }
        : { orderBy?: SettingsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SettingsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSettingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Settings model
   */
  readonly fields: SettingsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Settings.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SettingsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Settings model
   */
  interface SettingsFieldRefs {
    readonly id: FieldRef<"Settings", 'String'>
    readonly company: FieldRef<"Settings", 'Json'>
    readonly formation: FieldRef<"Settings", 'Json'>
    readonly email: FieldRef<"Settings", 'Json'>
    readonly createdAt: FieldRef<"Settings", 'DateTime'>
    readonly updatedAt: FieldRef<"Settings", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Settings findUnique
   */
  export type SettingsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where: SettingsWhereUniqueInput
  }

  /**
   * Settings findUniqueOrThrow
   */
  export type SettingsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where: SettingsWhereUniqueInput
  }

  /**
   * Settings findFirst
   */
  export type SettingsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where?: SettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settings to fetch.
     */
    orderBy?: SettingsOrderByWithRelationInput | SettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Settings.
     */
    cursor?: SettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Settings.
     */
    distinct?: SettingsScalarFieldEnum | SettingsScalarFieldEnum[]
  }

  /**
   * Settings findFirstOrThrow
   */
  export type SettingsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where?: SettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settings to fetch.
     */
    orderBy?: SettingsOrderByWithRelationInput | SettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Settings.
     */
    cursor?: SettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Settings.
     */
    distinct?: SettingsScalarFieldEnum | SettingsScalarFieldEnum[]
  }

  /**
   * Settings findMany
   */
  export type SettingsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where?: SettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settings to fetch.
     */
    orderBy?: SettingsOrderByWithRelationInput | SettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Settings.
     */
    cursor?: SettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settings.
     */
    skip?: number
    distinct?: SettingsScalarFieldEnum | SettingsScalarFieldEnum[]
  }

  /**
   * Settings create
   */
  export type SettingsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * The data needed to create a Settings.
     */
    data: XOR<SettingsCreateInput, SettingsUncheckedCreateInput>
  }

  /**
   * Settings createMany
   */
  export type SettingsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Settings.
     */
    data: SettingsCreateManyInput | SettingsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Settings createManyAndReturn
   */
  export type SettingsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * The data used to create many Settings.
     */
    data: SettingsCreateManyInput | SettingsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Settings update
   */
  export type SettingsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * The data needed to update a Settings.
     */
    data: XOR<SettingsUpdateInput, SettingsUncheckedUpdateInput>
    /**
     * Choose, which Settings to update.
     */
    where: SettingsWhereUniqueInput
  }

  /**
   * Settings updateMany
   */
  export type SettingsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Settings.
     */
    data: XOR<SettingsUpdateManyMutationInput, SettingsUncheckedUpdateManyInput>
    /**
     * Filter which Settings to update
     */
    where?: SettingsWhereInput
    /**
     * Limit how many Settings to update.
     */
    limit?: number
  }

  /**
   * Settings updateManyAndReturn
   */
  export type SettingsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * The data used to update Settings.
     */
    data: XOR<SettingsUpdateManyMutationInput, SettingsUncheckedUpdateManyInput>
    /**
     * Filter which Settings to update
     */
    where?: SettingsWhereInput
    /**
     * Limit how many Settings to update.
     */
    limit?: number
  }

  /**
   * Settings upsert
   */
  export type SettingsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * The filter to search for the Settings to update in case it exists.
     */
    where: SettingsWhereUniqueInput
    /**
     * In case the Settings found by the `where` argument doesn't exist, create a new Settings with this data.
     */
    create: XOR<SettingsCreateInput, SettingsUncheckedCreateInput>
    /**
     * In case the Settings was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SettingsUpdateInput, SettingsUncheckedUpdateInput>
  }

  /**
   * Settings delete
   */
  export type SettingsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Filter which Settings to delete.
     */
    where: SettingsWhereUniqueInput
  }

  /**
   * Settings deleteMany
   */
  export type SettingsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Settings to delete
     */
    where?: SettingsWhereInput
    /**
     * Limit how many Settings to delete.
     */
    limit?: number
  }

  /**
   * Settings without action
   */
  export type SettingsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    password: 'password',
    nom: 'nom',
    prenom: 'prenom',
    role: 'role',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const FormationScalarFieldEnum: {
    id: 'id',
    titre: 'titre',
    description: 'description',
    duree: 'duree',
    prix: 'prix',
    niveau: 'niveau',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type FormationScalarFieldEnum = (typeof FormationScalarFieldEnum)[keyof typeof FormationScalarFieldEnum]


  export const DemandeScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    formationId: 'formationId',
    statut: 'statut',
    message: 'message',
    commentaire: 'commentaire',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DemandeScalarFieldEnum = (typeof DemandeScalarFieldEnum)[keyof typeof DemandeScalarFieldEnum]


  export const DevisScalarFieldEnum: {
    id: 'id',
    demandeId: 'demandeId',
    userId: 'userId',
    numero: 'numero',
    client: 'client',
    mail: 'mail',
    mail2: 'mail2',
    adresseLivraison: 'adresseLivraison',
    dateLivraison: 'dateLivraison',
    dateExamen: 'dateExamen',
    adresse: 'adresse',
    siret: 'siret',
    numNDA: 'numNDA',
    dateFormation: 'dateFormation',
    suiviPar: 'suiviPar',
    designation: 'designation',
    quantite: 'quantite',
    unite: 'unite',
    prixUnitaire: 'prixUnitaire',
    tva: 'tva',
    exoneration: 'exoneration',
    datePriseEffet: 'datePriseEffet',
    montant: 'montant',
    iban: 'iban',
    bic: 'bic',
    banque: 'banque',
    intituleCompte: 'intituleCompte',
    signature: 'signature',
    statut: 'statut',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DevisScalarFieldEnum = (typeof DevisScalarFieldEnum)[keyof typeof DevisScalarFieldEnum]


  export const ContratScalarFieldEnum: {
    id: 'id',
    devisId: 'devisId',
    userId: 'userId',
    statut: 'statut',
    dateDebut: 'dateDebut',
    dateFin: 'dateFin',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ContratScalarFieldEnum = (typeof ContratScalarFieldEnum)[keyof typeof ContratScalarFieldEnum]


  export const SettingsScalarFieldEnum: {
    id: 'id',
    company: 'company',
    formation: 'formation',
    email: 'email',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SettingsScalarFieldEnum = (typeof SettingsScalarFieldEnum)[keyof typeof SettingsScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Statut'
   */
  export type EnumStatutFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Statut'>
    


  /**
   * Reference to a field of type 'Statut[]'
   */
  export type ListEnumStatutFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Statut[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    nom?: StringFilter<"User"> | string
    prenom?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    demandes?: DemandeListRelationFilter
    devis?: DevisListRelationFilter
    contrats?: ContratListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    nom?: SortOrder
    prenom?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    demandes?: DemandeOrderByRelationAggregateInput
    devis?: DevisOrderByRelationAggregateInput
    contrats?: ContratOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    password?: StringFilter<"User"> | string
    nom?: StringFilter<"User"> | string
    prenom?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    demandes?: DemandeListRelationFilter
    devis?: DevisListRelationFilter
    contrats?: ContratListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    nom?: SortOrder
    prenom?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    nom?: StringWithAggregatesFilter<"User"> | string
    prenom?: StringWithAggregatesFilter<"User"> | string
    role?: EnumRoleWithAggregatesFilter<"User"> | $Enums.Role
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type FormationWhereInput = {
    AND?: FormationWhereInput | FormationWhereInput[]
    OR?: FormationWhereInput[]
    NOT?: FormationWhereInput | FormationWhereInput[]
    id?: StringFilter<"Formation"> | string
    titre?: StringFilter<"Formation"> | string
    description?: StringFilter<"Formation"> | string
    duree?: StringFilter<"Formation"> | string
    prix?: FloatFilter<"Formation"> | number
    niveau?: StringFilter<"Formation"> | string
    createdAt?: DateTimeFilter<"Formation"> | Date | string
    updatedAt?: DateTimeFilter<"Formation"> | Date | string
    demandes?: DemandeListRelationFilter
  }

  export type FormationOrderByWithRelationInput = {
    id?: SortOrder
    titre?: SortOrder
    description?: SortOrder
    duree?: SortOrder
    prix?: SortOrder
    niveau?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    demandes?: DemandeOrderByRelationAggregateInput
  }

  export type FormationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FormationWhereInput | FormationWhereInput[]
    OR?: FormationWhereInput[]
    NOT?: FormationWhereInput | FormationWhereInput[]
    titre?: StringFilter<"Formation"> | string
    description?: StringFilter<"Formation"> | string
    duree?: StringFilter<"Formation"> | string
    prix?: FloatFilter<"Formation"> | number
    niveau?: StringFilter<"Formation"> | string
    createdAt?: DateTimeFilter<"Formation"> | Date | string
    updatedAt?: DateTimeFilter<"Formation"> | Date | string
    demandes?: DemandeListRelationFilter
  }, "id">

  export type FormationOrderByWithAggregationInput = {
    id?: SortOrder
    titre?: SortOrder
    description?: SortOrder
    duree?: SortOrder
    prix?: SortOrder
    niveau?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: FormationCountOrderByAggregateInput
    _avg?: FormationAvgOrderByAggregateInput
    _max?: FormationMaxOrderByAggregateInput
    _min?: FormationMinOrderByAggregateInput
    _sum?: FormationSumOrderByAggregateInput
  }

  export type FormationScalarWhereWithAggregatesInput = {
    AND?: FormationScalarWhereWithAggregatesInput | FormationScalarWhereWithAggregatesInput[]
    OR?: FormationScalarWhereWithAggregatesInput[]
    NOT?: FormationScalarWhereWithAggregatesInput | FormationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Formation"> | string
    titre?: StringWithAggregatesFilter<"Formation"> | string
    description?: StringWithAggregatesFilter<"Formation"> | string
    duree?: StringWithAggregatesFilter<"Formation"> | string
    prix?: FloatWithAggregatesFilter<"Formation"> | number
    niveau?: StringWithAggregatesFilter<"Formation"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Formation"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Formation"> | Date | string
  }

  export type DemandeWhereInput = {
    AND?: DemandeWhereInput | DemandeWhereInput[]
    OR?: DemandeWhereInput[]
    NOT?: DemandeWhereInput | DemandeWhereInput[]
    id?: StringFilter<"Demande"> | string
    userId?: StringFilter<"Demande"> | string
    formationId?: StringFilter<"Demande"> | string
    statut?: EnumStatutFilter<"Demande"> | $Enums.Statut
    message?: StringNullableFilter<"Demande"> | string | null
    commentaire?: StringNullableFilter<"Demande"> | string | null
    createdAt?: DateTimeFilter<"Demande"> | Date | string
    updatedAt?: DateTimeFilter<"Demande"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    formation?: XOR<FormationScalarRelationFilter, FormationWhereInput>
    devis?: XOR<DevisNullableScalarRelationFilter, DevisWhereInput> | null
  }

  export type DemandeOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    formationId?: SortOrder
    statut?: SortOrder
    message?: SortOrderInput | SortOrder
    commentaire?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    formation?: FormationOrderByWithRelationInput
    devis?: DevisOrderByWithRelationInput
  }

  export type DemandeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DemandeWhereInput | DemandeWhereInput[]
    OR?: DemandeWhereInput[]
    NOT?: DemandeWhereInput | DemandeWhereInput[]
    userId?: StringFilter<"Demande"> | string
    formationId?: StringFilter<"Demande"> | string
    statut?: EnumStatutFilter<"Demande"> | $Enums.Statut
    message?: StringNullableFilter<"Demande"> | string | null
    commentaire?: StringNullableFilter<"Demande"> | string | null
    createdAt?: DateTimeFilter<"Demande"> | Date | string
    updatedAt?: DateTimeFilter<"Demande"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    formation?: XOR<FormationScalarRelationFilter, FormationWhereInput>
    devis?: XOR<DevisNullableScalarRelationFilter, DevisWhereInput> | null
  }, "id">

  export type DemandeOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    formationId?: SortOrder
    statut?: SortOrder
    message?: SortOrderInput | SortOrder
    commentaire?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DemandeCountOrderByAggregateInput
    _max?: DemandeMaxOrderByAggregateInput
    _min?: DemandeMinOrderByAggregateInput
  }

  export type DemandeScalarWhereWithAggregatesInput = {
    AND?: DemandeScalarWhereWithAggregatesInput | DemandeScalarWhereWithAggregatesInput[]
    OR?: DemandeScalarWhereWithAggregatesInput[]
    NOT?: DemandeScalarWhereWithAggregatesInput | DemandeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Demande"> | string
    userId?: StringWithAggregatesFilter<"Demande"> | string
    formationId?: StringWithAggregatesFilter<"Demande"> | string
    statut?: EnumStatutWithAggregatesFilter<"Demande"> | $Enums.Statut
    message?: StringNullableWithAggregatesFilter<"Demande"> | string | null
    commentaire?: StringNullableWithAggregatesFilter<"Demande"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Demande"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Demande"> | Date | string
  }

  export type DevisWhereInput = {
    AND?: DevisWhereInput | DevisWhereInput[]
    OR?: DevisWhereInput[]
    NOT?: DevisWhereInput | DevisWhereInput[]
    id?: StringFilter<"Devis"> | string
    demandeId?: StringFilter<"Devis"> | string
    userId?: StringFilter<"Devis"> | string
    numero?: StringFilter<"Devis"> | string
    client?: StringFilter<"Devis"> | string
    mail?: StringFilter<"Devis"> | string
    mail2?: StringFilter<"Devis"> | string
    adresseLivraison?: StringNullableFilter<"Devis"> | string | null
    dateLivraison?: DateTimeNullableFilter<"Devis"> | Date | string | null
    dateExamen?: DateTimeNullableFilter<"Devis"> | Date | string | null
    adresse?: StringNullableFilter<"Devis"> | string | null
    siret?: StringNullableFilter<"Devis"> | string | null
    numNDA?: StringNullableFilter<"Devis"> | string | null
    dateFormation?: DateTimeNullableFilter<"Devis"> | Date | string | null
    suiviPar?: StringNullableFilter<"Devis"> | string | null
    designation?: StringFilter<"Devis"> | string
    quantite?: IntFilter<"Devis"> | number
    unite?: StringFilter<"Devis"> | string
    prixUnitaire?: FloatFilter<"Devis"> | number
    tva?: FloatFilter<"Devis"> | number
    exoneration?: StringNullableFilter<"Devis"> | string | null
    datePriseEffet?: DateTimeNullableFilter<"Devis"> | Date | string | null
    montant?: FloatFilter<"Devis"> | number
    iban?: StringNullableFilter<"Devis"> | string | null
    bic?: StringNullableFilter<"Devis"> | string | null
    banque?: StringNullableFilter<"Devis"> | string | null
    intituleCompte?: StringNullableFilter<"Devis"> | string | null
    signature?: StringNullableFilter<"Devis"> | string | null
    statut?: EnumStatutFilter<"Devis"> | $Enums.Statut
    createdAt?: DateTimeFilter<"Devis"> | Date | string
    updatedAt?: DateTimeFilter<"Devis"> | Date | string
    demande?: XOR<DemandeScalarRelationFilter, DemandeWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    contrat?: XOR<ContratNullableScalarRelationFilter, ContratWhereInput> | null
  }

  export type DevisOrderByWithRelationInput = {
    id?: SortOrder
    demandeId?: SortOrder
    userId?: SortOrder
    numero?: SortOrder
    client?: SortOrder
    mail?: SortOrder
    mail2?: SortOrder
    adresseLivraison?: SortOrderInput | SortOrder
    dateLivraison?: SortOrderInput | SortOrder
    dateExamen?: SortOrderInput | SortOrder
    adresse?: SortOrderInput | SortOrder
    siret?: SortOrderInput | SortOrder
    numNDA?: SortOrderInput | SortOrder
    dateFormation?: SortOrderInput | SortOrder
    suiviPar?: SortOrderInput | SortOrder
    designation?: SortOrder
    quantite?: SortOrder
    unite?: SortOrder
    prixUnitaire?: SortOrder
    tva?: SortOrder
    exoneration?: SortOrderInput | SortOrder
    datePriseEffet?: SortOrderInput | SortOrder
    montant?: SortOrder
    iban?: SortOrderInput | SortOrder
    bic?: SortOrderInput | SortOrder
    banque?: SortOrderInput | SortOrder
    intituleCompte?: SortOrderInput | SortOrder
    signature?: SortOrderInput | SortOrder
    statut?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    demande?: DemandeOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
    contrat?: ContratOrderByWithRelationInput
  }

  export type DevisWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    demandeId?: string
    AND?: DevisWhereInput | DevisWhereInput[]
    OR?: DevisWhereInput[]
    NOT?: DevisWhereInput | DevisWhereInput[]
    userId?: StringFilter<"Devis"> | string
    numero?: StringFilter<"Devis"> | string
    client?: StringFilter<"Devis"> | string
    mail?: StringFilter<"Devis"> | string
    mail2?: StringFilter<"Devis"> | string
    adresseLivraison?: StringNullableFilter<"Devis"> | string | null
    dateLivraison?: DateTimeNullableFilter<"Devis"> | Date | string | null
    dateExamen?: DateTimeNullableFilter<"Devis"> | Date | string | null
    adresse?: StringNullableFilter<"Devis"> | string | null
    siret?: StringNullableFilter<"Devis"> | string | null
    numNDA?: StringNullableFilter<"Devis"> | string | null
    dateFormation?: DateTimeNullableFilter<"Devis"> | Date | string | null
    suiviPar?: StringNullableFilter<"Devis"> | string | null
    designation?: StringFilter<"Devis"> | string
    quantite?: IntFilter<"Devis"> | number
    unite?: StringFilter<"Devis"> | string
    prixUnitaire?: FloatFilter<"Devis"> | number
    tva?: FloatFilter<"Devis"> | number
    exoneration?: StringNullableFilter<"Devis"> | string | null
    datePriseEffet?: DateTimeNullableFilter<"Devis"> | Date | string | null
    montant?: FloatFilter<"Devis"> | number
    iban?: StringNullableFilter<"Devis"> | string | null
    bic?: StringNullableFilter<"Devis"> | string | null
    banque?: StringNullableFilter<"Devis"> | string | null
    intituleCompte?: StringNullableFilter<"Devis"> | string | null
    signature?: StringNullableFilter<"Devis"> | string | null
    statut?: EnumStatutFilter<"Devis"> | $Enums.Statut
    createdAt?: DateTimeFilter<"Devis"> | Date | string
    updatedAt?: DateTimeFilter<"Devis"> | Date | string
    demande?: XOR<DemandeScalarRelationFilter, DemandeWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    contrat?: XOR<ContratNullableScalarRelationFilter, ContratWhereInput> | null
  }, "id" | "demandeId">

  export type DevisOrderByWithAggregationInput = {
    id?: SortOrder
    demandeId?: SortOrder
    userId?: SortOrder
    numero?: SortOrder
    client?: SortOrder
    mail?: SortOrder
    mail2?: SortOrder
    adresseLivraison?: SortOrderInput | SortOrder
    dateLivraison?: SortOrderInput | SortOrder
    dateExamen?: SortOrderInput | SortOrder
    adresse?: SortOrderInput | SortOrder
    siret?: SortOrderInput | SortOrder
    numNDA?: SortOrderInput | SortOrder
    dateFormation?: SortOrderInput | SortOrder
    suiviPar?: SortOrderInput | SortOrder
    designation?: SortOrder
    quantite?: SortOrder
    unite?: SortOrder
    prixUnitaire?: SortOrder
    tva?: SortOrder
    exoneration?: SortOrderInput | SortOrder
    datePriseEffet?: SortOrderInput | SortOrder
    montant?: SortOrder
    iban?: SortOrderInput | SortOrder
    bic?: SortOrderInput | SortOrder
    banque?: SortOrderInput | SortOrder
    intituleCompte?: SortOrderInput | SortOrder
    signature?: SortOrderInput | SortOrder
    statut?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DevisCountOrderByAggregateInput
    _avg?: DevisAvgOrderByAggregateInput
    _max?: DevisMaxOrderByAggregateInput
    _min?: DevisMinOrderByAggregateInput
    _sum?: DevisSumOrderByAggregateInput
  }

  export type DevisScalarWhereWithAggregatesInput = {
    AND?: DevisScalarWhereWithAggregatesInput | DevisScalarWhereWithAggregatesInput[]
    OR?: DevisScalarWhereWithAggregatesInput[]
    NOT?: DevisScalarWhereWithAggregatesInput | DevisScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Devis"> | string
    demandeId?: StringWithAggregatesFilter<"Devis"> | string
    userId?: StringWithAggregatesFilter<"Devis"> | string
    numero?: StringWithAggregatesFilter<"Devis"> | string
    client?: StringWithAggregatesFilter<"Devis"> | string
    mail?: StringWithAggregatesFilter<"Devis"> | string
    mail2?: StringWithAggregatesFilter<"Devis"> | string
    adresseLivraison?: StringNullableWithAggregatesFilter<"Devis"> | string | null
    dateLivraison?: DateTimeNullableWithAggregatesFilter<"Devis"> | Date | string | null
    dateExamen?: DateTimeNullableWithAggregatesFilter<"Devis"> | Date | string | null
    adresse?: StringNullableWithAggregatesFilter<"Devis"> | string | null
    siret?: StringNullableWithAggregatesFilter<"Devis"> | string | null
    numNDA?: StringNullableWithAggregatesFilter<"Devis"> | string | null
    dateFormation?: DateTimeNullableWithAggregatesFilter<"Devis"> | Date | string | null
    suiviPar?: StringNullableWithAggregatesFilter<"Devis"> | string | null
    designation?: StringWithAggregatesFilter<"Devis"> | string
    quantite?: IntWithAggregatesFilter<"Devis"> | number
    unite?: StringWithAggregatesFilter<"Devis"> | string
    prixUnitaire?: FloatWithAggregatesFilter<"Devis"> | number
    tva?: FloatWithAggregatesFilter<"Devis"> | number
    exoneration?: StringNullableWithAggregatesFilter<"Devis"> | string | null
    datePriseEffet?: DateTimeNullableWithAggregatesFilter<"Devis"> | Date | string | null
    montant?: FloatWithAggregatesFilter<"Devis"> | number
    iban?: StringNullableWithAggregatesFilter<"Devis"> | string | null
    bic?: StringNullableWithAggregatesFilter<"Devis"> | string | null
    banque?: StringNullableWithAggregatesFilter<"Devis"> | string | null
    intituleCompte?: StringNullableWithAggregatesFilter<"Devis"> | string | null
    signature?: StringNullableWithAggregatesFilter<"Devis"> | string | null
    statut?: EnumStatutWithAggregatesFilter<"Devis"> | $Enums.Statut
    createdAt?: DateTimeWithAggregatesFilter<"Devis"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Devis"> | Date | string
  }

  export type ContratWhereInput = {
    AND?: ContratWhereInput | ContratWhereInput[]
    OR?: ContratWhereInput[]
    NOT?: ContratWhereInput | ContratWhereInput[]
    id?: StringFilter<"Contrat"> | string
    devisId?: StringFilter<"Contrat"> | string
    userId?: StringFilter<"Contrat"> | string
    statut?: EnumStatutFilter<"Contrat"> | $Enums.Statut
    dateDebut?: DateTimeNullableFilter<"Contrat"> | Date | string | null
    dateFin?: DateTimeNullableFilter<"Contrat"> | Date | string | null
    createdAt?: DateTimeFilter<"Contrat"> | Date | string
    updatedAt?: DateTimeFilter<"Contrat"> | Date | string
    devis?: XOR<DevisScalarRelationFilter, DevisWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type ContratOrderByWithRelationInput = {
    id?: SortOrder
    devisId?: SortOrder
    userId?: SortOrder
    statut?: SortOrder
    dateDebut?: SortOrderInput | SortOrder
    dateFin?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    devis?: DevisOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
  }

  export type ContratWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    devisId?: string
    AND?: ContratWhereInput | ContratWhereInput[]
    OR?: ContratWhereInput[]
    NOT?: ContratWhereInput | ContratWhereInput[]
    userId?: StringFilter<"Contrat"> | string
    statut?: EnumStatutFilter<"Contrat"> | $Enums.Statut
    dateDebut?: DateTimeNullableFilter<"Contrat"> | Date | string | null
    dateFin?: DateTimeNullableFilter<"Contrat"> | Date | string | null
    createdAt?: DateTimeFilter<"Contrat"> | Date | string
    updatedAt?: DateTimeFilter<"Contrat"> | Date | string
    devis?: XOR<DevisScalarRelationFilter, DevisWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "devisId">

  export type ContratOrderByWithAggregationInput = {
    id?: SortOrder
    devisId?: SortOrder
    userId?: SortOrder
    statut?: SortOrder
    dateDebut?: SortOrderInput | SortOrder
    dateFin?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ContratCountOrderByAggregateInput
    _max?: ContratMaxOrderByAggregateInput
    _min?: ContratMinOrderByAggregateInput
  }

  export type ContratScalarWhereWithAggregatesInput = {
    AND?: ContratScalarWhereWithAggregatesInput | ContratScalarWhereWithAggregatesInput[]
    OR?: ContratScalarWhereWithAggregatesInput[]
    NOT?: ContratScalarWhereWithAggregatesInput | ContratScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Contrat"> | string
    devisId?: StringWithAggregatesFilter<"Contrat"> | string
    userId?: StringWithAggregatesFilter<"Contrat"> | string
    statut?: EnumStatutWithAggregatesFilter<"Contrat"> | $Enums.Statut
    dateDebut?: DateTimeNullableWithAggregatesFilter<"Contrat"> | Date | string | null
    dateFin?: DateTimeNullableWithAggregatesFilter<"Contrat"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Contrat"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Contrat"> | Date | string
  }

  export type SettingsWhereInput = {
    AND?: SettingsWhereInput | SettingsWhereInput[]
    OR?: SettingsWhereInput[]
    NOT?: SettingsWhereInput | SettingsWhereInput[]
    id?: StringFilter<"Settings"> | string
    company?: JsonFilter<"Settings">
    formation?: JsonFilter<"Settings">
    email?: JsonFilter<"Settings">
    createdAt?: DateTimeFilter<"Settings"> | Date | string
    updatedAt?: DateTimeFilter<"Settings"> | Date | string
  }

  export type SettingsOrderByWithRelationInput = {
    id?: SortOrder
    company?: SortOrder
    formation?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SettingsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SettingsWhereInput | SettingsWhereInput[]
    OR?: SettingsWhereInput[]
    NOT?: SettingsWhereInput | SettingsWhereInput[]
    company?: JsonFilter<"Settings">
    formation?: JsonFilter<"Settings">
    email?: JsonFilter<"Settings">
    createdAt?: DateTimeFilter<"Settings"> | Date | string
    updatedAt?: DateTimeFilter<"Settings"> | Date | string
  }, "id">

  export type SettingsOrderByWithAggregationInput = {
    id?: SortOrder
    company?: SortOrder
    formation?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SettingsCountOrderByAggregateInput
    _max?: SettingsMaxOrderByAggregateInput
    _min?: SettingsMinOrderByAggregateInput
  }

  export type SettingsScalarWhereWithAggregatesInput = {
    AND?: SettingsScalarWhereWithAggregatesInput | SettingsScalarWhereWithAggregatesInput[]
    OR?: SettingsScalarWhereWithAggregatesInput[]
    NOT?: SettingsScalarWhereWithAggregatesInput | SettingsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Settings"> | string
    company?: JsonWithAggregatesFilter<"Settings">
    formation?: JsonWithAggregatesFilter<"Settings">
    email?: JsonWithAggregatesFilter<"Settings">
    createdAt?: DateTimeWithAggregatesFilter<"Settings"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Settings"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    password: string
    nom: string
    prenom: string
    role?: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    demandes?: DemandeCreateNestedManyWithoutUserInput
    devis?: DevisCreateNestedManyWithoutUserInput
    contrats?: ContratCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    password: string
    nom: string
    prenom: string
    role?: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    demandes?: DemandeUncheckedCreateNestedManyWithoutUserInput
    devis?: DevisUncheckedCreateNestedManyWithoutUserInput
    contrats?: ContratUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    demandes?: DemandeUpdateManyWithoutUserNestedInput
    devis?: DevisUpdateManyWithoutUserNestedInput
    contrats?: ContratUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    demandes?: DemandeUncheckedUpdateManyWithoutUserNestedInput
    devis?: DevisUncheckedUpdateManyWithoutUserNestedInput
    contrats?: ContratUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    password: string
    nom: string
    prenom: string
    role?: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FormationCreateInput = {
    id?: string
    titre: string
    description: string
    duree: string
    prix: number
    niveau: string
    createdAt?: Date | string
    updatedAt?: Date | string
    demandes?: DemandeCreateNestedManyWithoutFormationInput
  }

  export type FormationUncheckedCreateInput = {
    id?: string
    titre: string
    description: string
    duree: string
    prix: number
    niveau: string
    createdAt?: Date | string
    updatedAt?: Date | string
    demandes?: DemandeUncheckedCreateNestedManyWithoutFormationInput
  }

  export type FormationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    duree?: StringFieldUpdateOperationsInput | string
    prix?: FloatFieldUpdateOperationsInput | number
    niveau?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    demandes?: DemandeUpdateManyWithoutFormationNestedInput
  }

  export type FormationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    duree?: StringFieldUpdateOperationsInput | string
    prix?: FloatFieldUpdateOperationsInput | number
    niveau?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    demandes?: DemandeUncheckedUpdateManyWithoutFormationNestedInput
  }

  export type FormationCreateManyInput = {
    id?: string
    titre: string
    description: string
    duree: string
    prix: number
    niveau: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FormationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    duree?: StringFieldUpdateOperationsInput | string
    prix?: FloatFieldUpdateOperationsInput | number
    niveau?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FormationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    duree?: StringFieldUpdateOperationsInput | string
    prix?: FloatFieldUpdateOperationsInput | number
    niveau?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DemandeCreateInput = {
    id?: string
    statut?: $Enums.Statut
    message?: string | null
    commentaire?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutDemandesInput
    formation: FormationCreateNestedOneWithoutDemandesInput
    devis?: DevisCreateNestedOneWithoutDemandeInput
  }

  export type DemandeUncheckedCreateInput = {
    id?: string
    userId: string
    formationId: string
    statut?: $Enums.Statut
    message?: string | null
    commentaire?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    devis?: DevisUncheckedCreateNestedOneWithoutDemandeInput
  }

  export type DemandeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    message?: NullableStringFieldUpdateOperationsInput | string | null
    commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutDemandesNestedInput
    formation?: FormationUpdateOneRequiredWithoutDemandesNestedInput
    devis?: DevisUpdateOneWithoutDemandeNestedInput
  }

  export type DemandeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    formationId?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    message?: NullableStringFieldUpdateOperationsInput | string | null
    commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    devis?: DevisUncheckedUpdateOneWithoutDemandeNestedInput
  }

  export type DemandeCreateManyInput = {
    id?: string
    userId: string
    formationId: string
    statut?: $Enums.Statut
    message?: string | null
    commentaire?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DemandeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    message?: NullableStringFieldUpdateOperationsInput | string | null
    commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DemandeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    formationId?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    message?: NullableStringFieldUpdateOperationsInput | string | null
    commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DevisCreateInput = {
    id?: string
    numero: string
    client: string
    mail: string
    mail2?: string
    adresseLivraison?: string | null
    dateLivraison?: Date | string | null
    dateExamen?: Date | string | null
    adresse?: string | null
    siret?: string | null
    numNDA?: string | null
    dateFormation?: Date | string | null
    suiviPar?: string | null
    designation: string
    quantite: number
    unite: string
    prixUnitaire: number
    tva: number
    exoneration?: string | null
    datePriseEffet?: Date | string | null
    montant: number
    iban?: string | null
    bic?: string | null
    banque?: string | null
    intituleCompte?: string | null
    signature?: string | null
    statut?: $Enums.Statut
    createdAt?: Date | string
    updatedAt?: Date | string
    demande: DemandeCreateNestedOneWithoutDevisInput
    user: UserCreateNestedOneWithoutDevisInput
    contrat?: ContratCreateNestedOneWithoutDevisInput
  }

  export type DevisUncheckedCreateInput = {
    id?: string
    demandeId: string
    userId: string
    numero: string
    client: string
    mail: string
    mail2?: string
    adresseLivraison?: string | null
    dateLivraison?: Date | string | null
    dateExamen?: Date | string | null
    adresse?: string | null
    siret?: string | null
    numNDA?: string | null
    dateFormation?: Date | string | null
    suiviPar?: string | null
    designation: string
    quantite: number
    unite: string
    prixUnitaire: number
    tva: number
    exoneration?: string | null
    datePriseEffet?: Date | string | null
    montant: number
    iban?: string | null
    bic?: string | null
    banque?: string | null
    intituleCompte?: string | null
    signature?: string | null
    statut?: $Enums.Statut
    createdAt?: Date | string
    updatedAt?: Date | string
    contrat?: ContratUncheckedCreateNestedOneWithoutDevisInput
  }

  export type DevisUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    numero?: StringFieldUpdateOperationsInput | string
    client?: StringFieldUpdateOperationsInput | string
    mail?: StringFieldUpdateOperationsInput | string
    mail2?: StringFieldUpdateOperationsInput | string
    adresseLivraison?: NullableStringFieldUpdateOperationsInput | string | null
    dateLivraison?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dateExamen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    siret?: NullableStringFieldUpdateOperationsInput | string | null
    numNDA?: NullableStringFieldUpdateOperationsInput | string | null
    dateFormation?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    suiviPar?: NullableStringFieldUpdateOperationsInput | string | null
    designation?: StringFieldUpdateOperationsInput | string
    quantite?: IntFieldUpdateOperationsInput | number
    unite?: StringFieldUpdateOperationsInput | string
    prixUnitaire?: FloatFieldUpdateOperationsInput | number
    tva?: FloatFieldUpdateOperationsInput | number
    exoneration?: NullableStringFieldUpdateOperationsInput | string | null
    datePriseEffet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    montant?: FloatFieldUpdateOperationsInput | number
    iban?: NullableStringFieldUpdateOperationsInput | string | null
    bic?: NullableStringFieldUpdateOperationsInput | string | null
    banque?: NullableStringFieldUpdateOperationsInput | string | null
    intituleCompte?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    demande?: DemandeUpdateOneRequiredWithoutDevisNestedInput
    user?: UserUpdateOneRequiredWithoutDevisNestedInput
    contrat?: ContratUpdateOneWithoutDevisNestedInput
  }

  export type DevisUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    demandeId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    numero?: StringFieldUpdateOperationsInput | string
    client?: StringFieldUpdateOperationsInput | string
    mail?: StringFieldUpdateOperationsInput | string
    mail2?: StringFieldUpdateOperationsInput | string
    adresseLivraison?: NullableStringFieldUpdateOperationsInput | string | null
    dateLivraison?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dateExamen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    siret?: NullableStringFieldUpdateOperationsInput | string | null
    numNDA?: NullableStringFieldUpdateOperationsInput | string | null
    dateFormation?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    suiviPar?: NullableStringFieldUpdateOperationsInput | string | null
    designation?: StringFieldUpdateOperationsInput | string
    quantite?: IntFieldUpdateOperationsInput | number
    unite?: StringFieldUpdateOperationsInput | string
    prixUnitaire?: FloatFieldUpdateOperationsInput | number
    tva?: FloatFieldUpdateOperationsInput | number
    exoneration?: NullableStringFieldUpdateOperationsInput | string | null
    datePriseEffet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    montant?: FloatFieldUpdateOperationsInput | number
    iban?: NullableStringFieldUpdateOperationsInput | string | null
    bic?: NullableStringFieldUpdateOperationsInput | string | null
    banque?: NullableStringFieldUpdateOperationsInput | string | null
    intituleCompte?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contrat?: ContratUncheckedUpdateOneWithoutDevisNestedInput
  }

  export type DevisCreateManyInput = {
    id?: string
    demandeId: string
    userId: string
    numero: string
    client: string
    mail: string
    mail2?: string
    adresseLivraison?: string | null
    dateLivraison?: Date | string | null
    dateExamen?: Date | string | null
    adresse?: string | null
    siret?: string | null
    numNDA?: string | null
    dateFormation?: Date | string | null
    suiviPar?: string | null
    designation: string
    quantite: number
    unite: string
    prixUnitaire: number
    tva: number
    exoneration?: string | null
    datePriseEffet?: Date | string | null
    montant: number
    iban?: string | null
    bic?: string | null
    banque?: string | null
    intituleCompte?: string | null
    signature?: string | null
    statut?: $Enums.Statut
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DevisUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    numero?: StringFieldUpdateOperationsInput | string
    client?: StringFieldUpdateOperationsInput | string
    mail?: StringFieldUpdateOperationsInput | string
    mail2?: StringFieldUpdateOperationsInput | string
    adresseLivraison?: NullableStringFieldUpdateOperationsInput | string | null
    dateLivraison?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dateExamen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    siret?: NullableStringFieldUpdateOperationsInput | string | null
    numNDA?: NullableStringFieldUpdateOperationsInput | string | null
    dateFormation?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    suiviPar?: NullableStringFieldUpdateOperationsInput | string | null
    designation?: StringFieldUpdateOperationsInput | string
    quantite?: IntFieldUpdateOperationsInput | number
    unite?: StringFieldUpdateOperationsInput | string
    prixUnitaire?: FloatFieldUpdateOperationsInput | number
    tva?: FloatFieldUpdateOperationsInput | number
    exoneration?: NullableStringFieldUpdateOperationsInput | string | null
    datePriseEffet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    montant?: FloatFieldUpdateOperationsInput | number
    iban?: NullableStringFieldUpdateOperationsInput | string | null
    bic?: NullableStringFieldUpdateOperationsInput | string | null
    banque?: NullableStringFieldUpdateOperationsInput | string | null
    intituleCompte?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DevisUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    demandeId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    numero?: StringFieldUpdateOperationsInput | string
    client?: StringFieldUpdateOperationsInput | string
    mail?: StringFieldUpdateOperationsInput | string
    mail2?: StringFieldUpdateOperationsInput | string
    adresseLivraison?: NullableStringFieldUpdateOperationsInput | string | null
    dateLivraison?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dateExamen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    siret?: NullableStringFieldUpdateOperationsInput | string | null
    numNDA?: NullableStringFieldUpdateOperationsInput | string | null
    dateFormation?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    suiviPar?: NullableStringFieldUpdateOperationsInput | string | null
    designation?: StringFieldUpdateOperationsInput | string
    quantite?: IntFieldUpdateOperationsInput | number
    unite?: StringFieldUpdateOperationsInput | string
    prixUnitaire?: FloatFieldUpdateOperationsInput | number
    tva?: FloatFieldUpdateOperationsInput | number
    exoneration?: NullableStringFieldUpdateOperationsInput | string | null
    datePriseEffet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    montant?: FloatFieldUpdateOperationsInput | number
    iban?: NullableStringFieldUpdateOperationsInput | string | null
    bic?: NullableStringFieldUpdateOperationsInput | string | null
    banque?: NullableStringFieldUpdateOperationsInput | string | null
    intituleCompte?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContratCreateInput = {
    id?: string
    statut?: $Enums.Statut
    dateDebut?: Date | string | null
    dateFin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    devis: DevisCreateNestedOneWithoutContratInput
    user: UserCreateNestedOneWithoutContratsInput
  }

  export type ContratUncheckedCreateInput = {
    id?: string
    devisId: string
    userId: string
    statut?: $Enums.Statut
    dateDebut?: Date | string | null
    dateFin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ContratUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    dateDebut?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dateFin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    devis?: DevisUpdateOneRequiredWithoutContratNestedInput
    user?: UserUpdateOneRequiredWithoutContratsNestedInput
  }

  export type ContratUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    devisId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    dateDebut?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dateFin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContratCreateManyInput = {
    id?: string
    devisId: string
    userId: string
    statut?: $Enums.Statut
    dateDebut?: Date | string | null
    dateFin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ContratUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    dateDebut?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dateFin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContratUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    devisId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    dateDebut?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dateFin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SettingsCreateInput = {
    id?: string
    company: JsonNullValueInput | InputJsonValue
    formation: JsonNullValueInput | InputJsonValue
    email: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SettingsUncheckedCreateInput = {
    id?: string
    company: JsonNullValueInput | InputJsonValue
    formation: JsonNullValueInput | InputJsonValue
    email: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SettingsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    company?: JsonNullValueInput | InputJsonValue
    formation?: JsonNullValueInput | InputJsonValue
    email?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SettingsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    company?: JsonNullValueInput | InputJsonValue
    formation?: JsonNullValueInput | InputJsonValue
    email?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SettingsCreateManyInput = {
    id?: string
    company: JsonNullValueInput | InputJsonValue
    formation: JsonNullValueInput | InputJsonValue
    email: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SettingsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    company?: JsonNullValueInput | InputJsonValue
    formation?: JsonNullValueInput | InputJsonValue
    email?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SettingsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    company?: JsonNullValueInput | InputJsonValue
    formation?: JsonNullValueInput | InputJsonValue
    email?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DemandeListRelationFilter = {
    every?: DemandeWhereInput
    some?: DemandeWhereInput
    none?: DemandeWhereInput
  }

  export type DevisListRelationFilter = {
    every?: DevisWhereInput
    some?: DevisWhereInput
    none?: DevisWhereInput
  }

  export type ContratListRelationFilter = {
    every?: ContratWhereInput
    some?: ContratWhereInput
    none?: ContratWhereInput
  }

  export type DemandeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DevisOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ContratOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    nom?: SortOrder
    prenom?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    nom?: SortOrder
    prenom?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    nom?: SortOrder
    prenom?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type FormationCountOrderByAggregateInput = {
    id?: SortOrder
    titre?: SortOrder
    description?: SortOrder
    duree?: SortOrder
    prix?: SortOrder
    niveau?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FormationAvgOrderByAggregateInput = {
    prix?: SortOrder
  }

  export type FormationMaxOrderByAggregateInput = {
    id?: SortOrder
    titre?: SortOrder
    description?: SortOrder
    duree?: SortOrder
    prix?: SortOrder
    niveau?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FormationMinOrderByAggregateInput = {
    id?: SortOrder
    titre?: SortOrder
    description?: SortOrder
    duree?: SortOrder
    prix?: SortOrder
    niveau?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FormationSumOrderByAggregateInput = {
    prix?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type EnumStatutFilter<$PrismaModel = never> = {
    equals?: $Enums.Statut | EnumStatutFieldRefInput<$PrismaModel>
    in?: $Enums.Statut[] | ListEnumStatutFieldRefInput<$PrismaModel>
    notIn?: $Enums.Statut[] | ListEnumStatutFieldRefInput<$PrismaModel>
    not?: NestedEnumStatutFilter<$PrismaModel> | $Enums.Statut
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type FormationScalarRelationFilter = {
    is?: FormationWhereInput
    isNot?: FormationWhereInput
  }

  export type DevisNullableScalarRelationFilter = {
    is?: DevisWhereInput | null
    isNot?: DevisWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type DemandeCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    formationId?: SortOrder
    statut?: SortOrder
    message?: SortOrder
    commentaire?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DemandeMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    formationId?: SortOrder
    statut?: SortOrder
    message?: SortOrder
    commentaire?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DemandeMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    formationId?: SortOrder
    statut?: SortOrder
    message?: SortOrder
    commentaire?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumStatutWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Statut | EnumStatutFieldRefInput<$PrismaModel>
    in?: $Enums.Statut[] | ListEnumStatutFieldRefInput<$PrismaModel>
    notIn?: $Enums.Statut[] | ListEnumStatutFieldRefInput<$PrismaModel>
    not?: NestedEnumStatutWithAggregatesFilter<$PrismaModel> | $Enums.Statut
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStatutFilter<$PrismaModel>
    _max?: NestedEnumStatutFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DemandeScalarRelationFilter = {
    is?: DemandeWhereInput
    isNot?: DemandeWhereInput
  }

  export type ContratNullableScalarRelationFilter = {
    is?: ContratWhereInput | null
    isNot?: ContratWhereInput | null
  }

  export type DevisCountOrderByAggregateInput = {
    id?: SortOrder
    demandeId?: SortOrder
    userId?: SortOrder
    numero?: SortOrder
    client?: SortOrder
    mail?: SortOrder
    mail2?: SortOrder
    adresseLivraison?: SortOrder
    dateLivraison?: SortOrder
    dateExamen?: SortOrder
    adresse?: SortOrder
    siret?: SortOrder
    numNDA?: SortOrder
    dateFormation?: SortOrder
    suiviPar?: SortOrder
    designation?: SortOrder
    quantite?: SortOrder
    unite?: SortOrder
    prixUnitaire?: SortOrder
    tva?: SortOrder
    exoneration?: SortOrder
    datePriseEffet?: SortOrder
    montant?: SortOrder
    iban?: SortOrder
    bic?: SortOrder
    banque?: SortOrder
    intituleCompte?: SortOrder
    signature?: SortOrder
    statut?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DevisAvgOrderByAggregateInput = {
    quantite?: SortOrder
    prixUnitaire?: SortOrder
    tva?: SortOrder
    montant?: SortOrder
  }

  export type DevisMaxOrderByAggregateInput = {
    id?: SortOrder
    demandeId?: SortOrder
    userId?: SortOrder
    numero?: SortOrder
    client?: SortOrder
    mail?: SortOrder
    mail2?: SortOrder
    adresseLivraison?: SortOrder
    dateLivraison?: SortOrder
    dateExamen?: SortOrder
    adresse?: SortOrder
    siret?: SortOrder
    numNDA?: SortOrder
    dateFormation?: SortOrder
    suiviPar?: SortOrder
    designation?: SortOrder
    quantite?: SortOrder
    unite?: SortOrder
    prixUnitaire?: SortOrder
    tva?: SortOrder
    exoneration?: SortOrder
    datePriseEffet?: SortOrder
    montant?: SortOrder
    iban?: SortOrder
    bic?: SortOrder
    banque?: SortOrder
    intituleCompte?: SortOrder
    signature?: SortOrder
    statut?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DevisMinOrderByAggregateInput = {
    id?: SortOrder
    demandeId?: SortOrder
    userId?: SortOrder
    numero?: SortOrder
    client?: SortOrder
    mail?: SortOrder
    mail2?: SortOrder
    adresseLivraison?: SortOrder
    dateLivraison?: SortOrder
    dateExamen?: SortOrder
    adresse?: SortOrder
    siret?: SortOrder
    numNDA?: SortOrder
    dateFormation?: SortOrder
    suiviPar?: SortOrder
    designation?: SortOrder
    quantite?: SortOrder
    unite?: SortOrder
    prixUnitaire?: SortOrder
    tva?: SortOrder
    exoneration?: SortOrder
    datePriseEffet?: SortOrder
    montant?: SortOrder
    iban?: SortOrder
    bic?: SortOrder
    banque?: SortOrder
    intituleCompte?: SortOrder
    signature?: SortOrder
    statut?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DevisSumOrderByAggregateInput = {
    quantite?: SortOrder
    prixUnitaire?: SortOrder
    tva?: SortOrder
    montant?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DevisScalarRelationFilter = {
    is?: DevisWhereInput
    isNot?: DevisWhereInput
  }

  export type ContratCountOrderByAggregateInput = {
    id?: SortOrder
    devisId?: SortOrder
    userId?: SortOrder
    statut?: SortOrder
    dateDebut?: SortOrder
    dateFin?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ContratMaxOrderByAggregateInput = {
    id?: SortOrder
    devisId?: SortOrder
    userId?: SortOrder
    statut?: SortOrder
    dateDebut?: SortOrder
    dateFin?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ContratMinOrderByAggregateInput = {
    id?: SortOrder
    devisId?: SortOrder
    userId?: SortOrder
    statut?: SortOrder
    dateDebut?: SortOrder
    dateFin?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type SettingsCountOrderByAggregateInput = {
    id?: SortOrder
    company?: SortOrder
    formation?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SettingsMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SettingsMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type DemandeCreateNestedManyWithoutUserInput = {
    create?: XOR<DemandeCreateWithoutUserInput, DemandeUncheckedCreateWithoutUserInput> | DemandeCreateWithoutUserInput[] | DemandeUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DemandeCreateOrConnectWithoutUserInput | DemandeCreateOrConnectWithoutUserInput[]
    createMany?: DemandeCreateManyUserInputEnvelope
    connect?: DemandeWhereUniqueInput | DemandeWhereUniqueInput[]
  }

  export type DevisCreateNestedManyWithoutUserInput = {
    create?: XOR<DevisCreateWithoutUserInput, DevisUncheckedCreateWithoutUserInput> | DevisCreateWithoutUserInput[] | DevisUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DevisCreateOrConnectWithoutUserInput | DevisCreateOrConnectWithoutUserInput[]
    createMany?: DevisCreateManyUserInputEnvelope
    connect?: DevisWhereUniqueInput | DevisWhereUniqueInput[]
  }

  export type ContratCreateNestedManyWithoutUserInput = {
    create?: XOR<ContratCreateWithoutUserInput, ContratUncheckedCreateWithoutUserInput> | ContratCreateWithoutUserInput[] | ContratUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ContratCreateOrConnectWithoutUserInput | ContratCreateOrConnectWithoutUserInput[]
    createMany?: ContratCreateManyUserInputEnvelope
    connect?: ContratWhereUniqueInput | ContratWhereUniqueInput[]
  }

  export type DemandeUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<DemandeCreateWithoutUserInput, DemandeUncheckedCreateWithoutUserInput> | DemandeCreateWithoutUserInput[] | DemandeUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DemandeCreateOrConnectWithoutUserInput | DemandeCreateOrConnectWithoutUserInput[]
    createMany?: DemandeCreateManyUserInputEnvelope
    connect?: DemandeWhereUniqueInput | DemandeWhereUniqueInput[]
  }

  export type DevisUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<DevisCreateWithoutUserInput, DevisUncheckedCreateWithoutUserInput> | DevisCreateWithoutUserInput[] | DevisUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DevisCreateOrConnectWithoutUserInput | DevisCreateOrConnectWithoutUserInput[]
    createMany?: DevisCreateManyUserInputEnvelope
    connect?: DevisWhereUniqueInput | DevisWhereUniqueInput[]
  }

  export type ContratUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ContratCreateWithoutUserInput, ContratUncheckedCreateWithoutUserInput> | ContratCreateWithoutUserInput[] | ContratUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ContratCreateOrConnectWithoutUserInput | ContratCreateOrConnectWithoutUserInput[]
    createMany?: ContratCreateManyUserInputEnvelope
    connect?: ContratWhereUniqueInput | ContratWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type DemandeUpdateManyWithoutUserNestedInput = {
    create?: XOR<DemandeCreateWithoutUserInput, DemandeUncheckedCreateWithoutUserInput> | DemandeCreateWithoutUserInput[] | DemandeUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DemandeCreateOrConnectWithoutUserInput | DemandeCreateOrConnectWithoutUserInput[]
    upsert?: DemandeUpsertWithWhereUniqueWithoutUserInput | DemandeUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: DemandeCreateManyUserInputEnvelope
    set?: DemandeWhereUniqueInput | DemandeWhereUniqueInput[]
    disconnect?: DemandeWhereUniqueInput | DemandeWhereUniqueInput[]
    delete?: DemandeWhereUniqueInput | DemandeWhereUniqueInput[]
    connect?: DemandeWhereUniqueInput | DemandeWhereUniqueInput[]
    update?: DemandeUpdateWithWhereUniqueWithoutUserInput | DemandeUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: DemandeUpdateManyWithWhereWithoutUserInput | DemandeUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: DemandeScalarWhereInput | DemandeScalarWhereInput[]
  }

  export type DevisUpdateManyWithoutUserNestedInput = {
    create?: XOR<DevisCreateWithoutUserInput, DevisUncheckedCreateWithoutUserInput> | DevisCreateWithoutUserInput[] | DevisUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DevisCreateOrConnectWithoutUserInput | DevisCreateOrConnectWithoutUserInput[]
    upsert?: DevisUpsertWithWhereUniqueWithoutUserInput | DevisUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: DevisCreateManyUserInputEnvelope
    set?: DevisWhereUniqueInput | DevisWhereUniqueInput[]
    disconnect?: DevisWhereUniqueInput | DevisWhereUniqueInput[]
    delete?: DevisWhereUniqueInput | DevisWhereUniqueInput[]
    connect?: DevisWhereUniqueInput | DevisWhereUniqueInput[]
    update?: DevisUpdateWithWhereUniqueWithoutUserInput | DevisUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: DevisUpdateManyWithWhereWithoutUserInput | DevisUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: DevisScalarWhereInput | DevisScalarWhereInput[]
  }

  export type ContratUpdateManyWithoutUserNestedInput = {
    create?: XOR<ContratCreateWithoutUserInput, ContratUncheckedCreateWithoutUserInput> | ContratCreateWithoutUserInput[] | ContratUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ContratCreateOrConnectWithoutUserInput | ContratCreateOrConnectWithoutUserInput[]
    upsert?: ContratUpsertWithWhereUniqueWithoutUserInput | ContratUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ContratCreateManyUserInputEnvelope
    set?: ContratWhereUniqueInput | ContratWhereUniqueInput[]
    disconnect?: ContratWhereUniqueInput | ContratWhereUniqueInput[]
    delete?: ContratWhereUniqueInput | ContratWhereUniqueInput[]
    connect?: ContratWhereUniqueInput | ContratWhereUniqueInput[]
    update?: ContratUpdateWithWhereUniqueWithoutUserInput | ContratUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ContratUpdateManyWithWhereWithoutUserInput | ContratUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ContratScalarWhereInput | ContratScalarWhereInput[]
  }

  export type DemandeUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<DemandeCreateWithoutUserInput, DemandeUncheckedCreateWithoutUserInput> | DemandeCreateWithoutUserInput[] | DemandeUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DemandeCreateOrConnectWithoutUserInput | DemandeCreateOrConnectWithoutUserInput[]
    upsert?: DemandeUpsertWithWhereUniqueWithoutUserInput | DemandeUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: DemandeCreateManyUserInputEnvelope
    set?: DemandeWhereUniqueInput | DemandeWhereUniqueInput[]
    disconnect?: DemandeWhereUniqueInput | DemandeWhereUniqueInput[]
    delete?: DemandeWhereUniqueInput | DemandeWhereUniqueInput[]
    connect?: DemandeWhereUniqueInput | DemandeWhereUniqueInput[]
    update?: DemandeUpdateWithWhereUniqueWithoutUserInput | DemandeUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: DemandeUpdateManyWithWhereWithoutUserInput | DemandeUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: DemandeScalarWhereInput | DemandeScalarWhereInput[]
  }

  export type DevisUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<DevisCreateWithoutUserInput, DevisUncheckedCreateWithoutUserInput> | DevisCreateWithoutUserInput[] | DevisUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DevisCreateOrConnectWithoutUserInput | DevisCreateOrConnectWithoutUserInput[]
    upsert?: DevisUpsertWithWhereUniqueWithoutUserInput | DevisUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: DevisCreateManyUserInputEnvelope
    set?: DevisWhereUniqueInput | DevisWhereUniqueInput[]
    disconnect?: DevisWhereUniqueInput | DevisWhereUniqueInput[]
    delete?: DevisWhereUniqueInput | DevisWhereUniqueInput[]
    connect?: DevisWhereUniqueInput | DevisWhereUniqueInput[]
    update?: DevisUpdateWithWhereUniqueWithoutUserInput | DevisUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: DevisUpdateManyWithWhereWithoutUserInput | DevisUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: DevisScalarWhereInput | DevisScalarWhereInput[]
  }

  export type ContratUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ContratCreateWithoutUserInput, ContratUncheckedCreateWithoutUserInput> | ContratCreateWithoutUserInput[] | ContratUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ContratCreateOrConnectWithoutUserInput | ContratCreateOrConnectWithoutUserInput[]
    upsert?: ContratUpsertWithWhereUniqueWithoutUserInput | ContratUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ContratCreateManyUserInputEnvelope
    set?: ContratWhereUniqueInput | ContratWhereUniqueInput[]
    disconnect?: ContratWhereUniqueInput | ContratWhereUniqueInput[]
    delete?: ContratWhereUniqueInput | ContratWhereUniqueInput[]
    connect?: ContratWhereUniqueInput | ContratWhereUniqueInput[]
    update?: ContratUpdateWithWhereUniqueWithoutUserInput | ContratUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ContratUpdateManyWithWhereWithoutUserInput | ContratUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ContratScalarWhereInput | ContratScalarWhereInput[]
  }

  export type DemandeCreateNestedManyWithoutFormationInput = {
    create?: XOR<DemandeCreateWithoutFormationInput, DemandeUncheckedCreateWithoutFormationInput> | DemandeCreateWithoutFormationInput[] | DemandeUncheckedCreateWithoutFormationInput[]
    connectOrCreate?: DemandeCreateOrConnectWithoutFormationInput | DemandeCreateOrConnectWithoutFormationInput[]
    createMany?: DemandeCreateManyFormationInputEnvelope
    connect?: DemandeWhereUniqueInput | DemandeWhereUniqueInput[]
  }

  export type DemandeUncheckedCreateNestedManyWithoutFormationInput = {
    create?: XOR<DemandeCreateWithoutFormationInput, DemandeUncheckedCreateWithoutFormationInput> | DemandeCreateWithoutFormationInput[] | DemandeUncheckedCreateWithoutFormationInput[]
    connectOrCreate?: DemandeCreateOrConnectWithoutFormationInput | DemandeCreateOrConnectWithoutFormationInput[]
    createMany?: DemandeCreateManyFormationInputEnvelope
    connect?: DemandeWhereUniqueInput | DemandeWhereUniqueInput[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DemandeUpdateManyWithoutFormationNestedInput = {
    create?: XOR<DemandeCreateWithoutFormationInput, DemandeUncheckedCreateWithoutFormationInput> | DemandeCreateWithoutFormationInput[] | DemandeUncheckedCreateWithoutFormationInput[]
    connectOrCreate?: DemandeCreateOrConnectWithoutFormationInput | DemandeCreateOrConnectWithoutFormationInput[]
    upsert?: DemandeUpsertWithWhereUniqueWithoutFormationInput | DemandeUpsertWithWhereUniqueWithoutFormationInput[]
    createMany?: DemandeCreateManyFormationInputEnvelope
    set?: DemandeWhereUniqueInput | DemandeWhereUniqueInput[]
    disconnect?: DemandeWhereUniqueInput | DemandeWhereUniqueInput[]
    delete?: DemandeWhereUniqueInput | DemandeWhereUniqueInput[]
    connect?: DemandeWhereUniqueInput | DemandeWhereUniqueInput[]
    update?: DemandeUpdateWithWhereUniqueWithoutFormationInput | DemandeUpdateWithWhereUniqueWithoutFormationInput[]
    updateMany?: DemandeUpdateManyWithWhereWithoutFormationInput | DemandeUpdateManyWithWhereWithoutFormationInput[]
    deleteMany?: DemandeScalarWhereInput | DemandeScalarWhereInput[]
  }

  export type DemandeUncheckedUpdateManyWithoutFormationNestedInput = {
    create?: XOR<DemandeCreateWithoutFormationInput, DemandeUncheckedCreateWithoutFormationInput> | DemandeCreateWithoutFormationInput[] | DemandeUncheckedCreateWithoutFormationInput[]
    connectOrCreate?: DemandeCreateOrConnectWithoutFormationInput | DemandeCreateOrConnectWithoutFormationInput[]
    upsert?: DemandeUpsertWithWhereUniqueWithoutFormationInput | DemandeUpsertWithWhereUniqueWithoutFormationInput[]
    createMany?: DemandeCreateManyFormationInputEnvelope
    set?: DemandeWhereUniqueInput | DemandeWhereUniqueInput[]
    disconnect?: DemandeWhereUniqueInput | DemandeWhereUniqueInput[]
    delete?: DemandeWhereUniqueInput | DemandeWhereUniqueInput[]
    connect?: DemandeWhereUniqueInput | DemandeWhereUniqueInput[]
    update?: DemandeUpdateWithWhereUniqueWithoutFormationInput | DemandeUpdateWithWhereUniqueWithoutFormationInput[]
    updateMany?: DemandeUpdateManyWithWhereWithoutFormationInput | DemandeUpdateManyWithWhereWithoutFormationInput[]
    deleteMany?: DemandeScalarWhereInput | DemandeScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutDemandesInput = {
    create?: XOR<UserCreateWithoutDemandesInput, UserUncheckedCreateWithoutDemandesInput>
    connectOrCreate?: UserCreateOrConnectWithoutDemandesInput
    connect?: UserWhereUniqueInput
  }

  export type FormationCreateNestedOneWithoutDemandesInput = {
    create?: XOR<FormationCreateWithoutDemandesInput, FormationUncheckedCreateWithoutDemandesInput>
    connectOrCreate?: FormationCreateOrConnectWithoutDemandesInput
    connect?: FormationWhereUniqueInput
  }

  export type DevisCreateNestedOneWithoutDemandeInput = {
    create?: XOR<DevisCreateWithoutDemandeInput, DevisUncheckedCreateWithoutDemandeInput>
    connectOrCreate?: DevisCreateOrConnectWithoutDemandeInput
    connect?: DevisWhereUniqueInput
  }

  export type DevisUncheckedCreateNestedOneWithoutDemandeInput = {
    create?: XOR<DevisCreateWithoutDemandeInput, DevisUncheckedCreateWithoutDemandeInput>
    connectOrCreate?: DevisCreateOrConnectWithoutDemandeInput
    connect?: DevisWhereUniqueInput
  }

  export type EnumStatutFieldUpdateOperationsInput = {
    set?: $Enums.Statut
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type UserUpdateOneRequiredWithoutDemandesNestedInput = {
    create?: XOR<UserCreateWithoutDemandesInput, UserUncheckedCreateWithoutDemandesInput>
    connectOrCreate?: UserCreateOrConnectWithoutDemandesInput
    upsert?: UserUpsertWithoutDemandesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutDemandesInput, UserUpdateWithoutDemandesInput>, UserUncheckedUpdateWithoutDemandesInput>
  }

  export type FormationUpdateOneRequiredWithoutDemandesNestedInput = {
    create?: XOR<FormationCreateWithoutDemandesInput, FormationUncheckedCreateWithoutDemandesInput>
    connectOrCreate?: FormationCreateOrConnectWithoutDemandesInput
    upsert?: FormationUpsertWithoutDemandesInput
    connect?: FormationWhereUniqueInput
    update?: XOR<XOR<FormationUpdateToOneWithWhereWithoutDemandesInput, FormationUpdateWithoutDemandesInput>, FormationUncheckedUpdateWithoutDemandesInput>
  }

  export type DevisUpdateOneWithoutDemandeNestedInput = {
    create?: XOR<DevisCreateWithoutDemandeInput, DevisUncheckedCreateWithoutDemandeInput>
    connectOrCreate?: DevisCreateOrConnectWithoutDemandeInput
    upsert?: DevisUpsertWithoutDemandeInput
    disconnect?: DevisWhereInput | boolean
    delete?: DevisWhereInput | boolean
    connect?: DevisWhereUniqueInput
    update?: XOR<XOR<DevisUpdateToOneWithWhereWithoutDemandeInput, DevisUpdateWithoutDemandeInput>, DevisUncheckedUpdateWithoutDemandeInput>
  }

  export type DevisUncheckedUpdateOneWithoutDemandeNestedInput = {
    create?: XOR<DevisCreateWithoutDemandeInput, DevisUncheckedCreateWithoutDemandeInput>
    connectOrCreate?: DevisCreateOrConnectWithoutDemandeInput
    upsert?: DevisUpsertWithoutDemandeInput
    disconnect?: DevisWhereInput | boolean
    delete?: DevisWhereInput | boolean
    connect?: DevisWhereUniqueInput
    update?: XOR<XOR<DevisUpdateToOneWithWhereWithoutDemandeInput, DevisUpdateWithoutDemandeInput>, DevisUncheckedUpdateWithoutDemandeInput>
  }

  export type DemandeCreateNestedOneWithoutDevisInput = {
    create?: XOR<DemandeCreateWithoutDevisInput, DemandeUncheckedCreateWithoutDevisInput>
    connectOrCreate?: DemandeCreateOrConnectWithoutDevisInput
    connect?: DemandeWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutDevisInput = {
    create?: XOR<UserCreateWithoutDevisInput, UserUncheckedCreateWithoutDevisInput>
    connectOrCreate?: UserCreateOrConnectWithoutDevisInput
    connect?: UserWhereUniqueInput
  }

  export type ContratCreateNestedOneWithoutDevisInput = {
    create?: XOR<ContratCreateWithoutDevisInput, ContratUncheckedCreateWithoutDevisInput>
    connectOrCreate?: ContratCreateOrConnectWithoutDevisInput
    connect?: ContratWhereUniqueInput
  }

  export type ContratUncheckedCreateNestedOneWithoutDevisInput = {
    create?: XOR<ContratCreateWithoutDevisInput, ContratUncheckedCreateWithoutDevisInput>
    connectOrCreate?: ContratCreateOrConnectWithoutDevisInput
    connect?: ContratWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DemandeUpdateOneRequiredWithoutDevisNestedInput = {
    create?: XOR<DemandeCreateWithoutDevisInput, DemandeUncheckedCreateWithoutDevisInput>
    connectOrCreate?: DemandeCreateOrConnectWithoutDevisInput
    upsert?: DemandeUpsertWithoutDevisInput
    connect?: DemandeWhereUniqueInput
    update?: XOR<XOR<DemandeUpdateToOneWithWhereWithoutDevisInput, DemandeUpdateWithoutDevisInput>, DemandeUncheckedUpdateWithoutDevisInput>
  }

  export type UserUpdateOneRequiredWithoutDevisNestedInput = {
    create?: XOR<UserCreateWithoutDevisInput, UserUncheckedCreateWithoutDevisInput>
    connectOrCreate?: UserCreateOrConnectWithoutDevisInput
    upsert?: UserUpsertWithoutDevisInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutDevisInput, UserUpdateWithoutDevisInput>, UserUncheckedUpdateWithoutDevisInput>
  }

  export type ContratUpdateOneWithoutDevisNestedInput = {
    create?: XOR<ContratCreateWithoutDevisInput, ContratUncheckedCreateWithoutDevisInput>
    connectOrCreate?: ContratCreateOrConnectWithoutDevisInput
    upsert?: ContratUpsertWithoutDevisInput
    disconnect?: ContratWhereInput | boolean
    delete?: ContratWhereInput | boolean
    connect?: ContratWhereUniqueInput
    update?: XOR<XOR<ContratUpdateToOneWithWhereWithoutDevisInput, ContratUpdateWithoutDevisInput>, ContratUncheckedUpdateWithoutDevisInput>
  }

  export type ContratUncheckedUpdateOneWithoutDevisNestedInput = {
    create?: XOR<ContratCreateWithoutDevisInput, ContratUncheckedCreateWithoutDevisInput>
    connectOrCreate?: ContratCreateOrConnectWithoutDevisInput
    upsert?: ContratUpsertWithoutDevisInput
    disconnect?: ContratWhereInput | boolean
    delete?: ContratWhereInput | boolean
    connect?: ContratWhereUniqueInput
    update?: XOR<XOR<ContratUpdateToOneWithWhereWithoutDevisInput, ContratUpdateWithoutDevisInput>, ContratUncheckedUpdateWithoutDevisInput>
  }

  export type DevisCreateNestedOneWithoutContratInput = {
    create?: XOR<DevisCreateWithoutContratInput, DevisUncheckedCreateWithoutContratInput>
    connectOrCreate?: DevisCreateOrConnectWithoutContratInput
    connect?: DevisWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutContratsInput = {
    create?: XOR<UserCreateWithoutContratsInput, UserUncheckedCreateWithoutContratsInput>
    connectOrCreate?: UserCreateOrConnectWithoutContratsInput
    connect?: UserWhereUniqueInput
  }

  export type DevisUpdateOneRequiredWithoutContratNestedInput = {
    create?: XOR<DevisCreateWithoutContratInput, DevisUncheckedCreateWithoutContratInput>
    connectOrCreate?: DevisCreateOrConnectWithoutContratInput
    upsert?: DevisUpsertWithoutContratInput
    connect?: DevisWhereUniqueInput
    update?: XOR<XOR<DevisUpdateToOneWithWhereWithoutContratInput, DevisUpdateWithoutContratInput>, DevisUncheckedUpdateWithoutContratInput>
  }

  export type UserUpdateOneRequiredWithoutContratsNestedInput = {
    create?: XOR<UserCreateWithoutContratsInput, UserUncheckedCreateWithoutContratsInput>
    connectOrCreate?: UserCreateOrConnectWithoutContratsInput
    upsert?: UserUpsertWithoutContratsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutContratsInput, UserUpdateWithoutContratsInput>, UserUncheckedUpdateWithoutContratsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedEnumStatutFilter<$PrismaModel = never> = {
    equals?: $Enums.Statut | EnumStatutFieldRefInput<$PrismaModel>
    in?: $Enums.Statut[] | ListEnumStatutFieldRefInput<$PrismaModel>
    notIn?: $Enums.Statut[] | ListEnumStatutFieldRefInput<$PrismaModel>
    not?: NestedEnumStatutFilter<$PrismaModel> | $Enums.Statut
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumStatutWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Statut | EnumStatutFieldRefInput<$PrismaModel>
    in?: $Enums.Statut[] | ListEnumStatutFieldRefInput<$PrismaModel>
    notIn?: $Enums.Statut[] | ListEnumStatutFieldRefInput<$PrismaModel>
    not?: NestedEnumStatutWithAggregatesFilter<$PrismaModel> | $Enums.Statut
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStatutFilter<$PrismaModel>
    _max?: NestedEnumStatutFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DemandeCreateWithoutUserInput = {
    id?: string
    statut?: $Enums.Statut
    message?: string | null
    commentaire?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    formation: FormationCreateNestedOneWithoutDemandesInput
    devis?: DevisCreateNestedOneWithoutDemandeInput
  }

  export type DemandeUncheckedCreateWithoutUserInput = {
    id?: string
    formationId: string
    statut?: $Enums.Statut
    message?: string | null
    commentaire?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    devis?: DevisUncheckedCreateNestedOneWithoutDemandeInput
  }

  export type DemandeCreateOrConnectWithoutUserInput = {
    where: DemandeWhereUniqueInput
    create: XOR<DemandeCreateWithoutUserInput, DemandeUncheckedCreateWithoutUserInput>
  }

  export type DemandeCreateManyUserInputEnvelope = {
    data: DemandeCreateManyUserInput | DemandeCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type DevisCreateWithoutUserInput = {
    id?: string
    numero: string
    client: string
    mail: string
    mail2?: string
    adresseLivraison?: string | null
    dateLivraison?: Date | string | null
    dateExamen?: Date | string | null
    adresse?: string | null
    siret?: string | null
    numNDA?: string | null
    dateFormation?: Date | string | null
    suiviPar?: string | null
    designation: string
    quantite: number
    unite: string
    prixUnitaire: number
    tva: number
    exoneration?: string | null
    datePriseEffet?: Date | string | null
    montant: number
    iban?: string | null
    bic?: string | null
    banque?: string | null
    intituleCompte?: string | null
    signature?: string | null
    statut?: $Enums.Statut
    createdAt?: Date | string
    updatedAt?: Date | string
    demande: DemandeCreateNestedOneWithoutDevisInput
    contrat?: ContratCreateNestedOneWithoutDevisInput
  }

  export type DevisUncheckedCreateWithoutUserInput = {
    id?: string
    demandeId: string
    numero: string
    client: string
    mail: string
    mail2?: string
    adresseLivraison?: string | null
    dateLivraison?: Date | string | null
    dateExamen?: Date | string | null
    adresse?: string | null
    siret?: string | null
    numNDA?: string | null
    dateFormation?: Date | string | null
    suiviPar?: string | null
    designation: string
    quantite: number
    unite: string
    prixUnitaire: number
    tva: number
    exoneration?: string | null
    datePriseEffet?: Date | string | null
    montant: number
    iban?: string | null
    bic?: string | null
    banque?: string | null
    intituleCompte?: string | null
    signature?: string | null
    statut?: $Enums.Statut
    createdAt?: Date | string
    updatedAt?: Date | string
    contrat?: ContratUncheckedCreateNestedOneWithoutDevisInput
  }

  export type DevisCreateOrConnectWithoutUserInput = {
    where: DevisWhereUniqueInput
    create: XOR<DevisCreateWithoutUserInput, DevisUncheckedCreateWithoutUserInput>
  }

  export type DevisCreateManyUserInputEnvelope = {
    data: DevisCreateManyUserInput | DevisCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ContratCreateWithoutUserInput = {
    id?: string
    statut?: $Enums.Statut
    dateDebut?: Date | string | null
    dateFin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    devis: DevisCreateNestedOneWithoutContratInput
  }

  export type ContratUncheckedCreateWithoutUserInput = {
    id?: string
    devisId: string
    statut?: $Enums.Statut
    dateDebut?: Date | string | null
    dateFin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ContratCreateOrConnectWithoutUserInput = {
    where: ContratWhereUniqueInput
    create: XOR<ContratCreateWithoutUserInput, ContratUncheckedCreateWithoutUserInput>
  }

  export type ContratCreateManyUserInputEnvelope = {
    data: ContratCreateManyUserInput | ContratCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type DemandeUpsertWithWhereUniqueWithoutUserInput = {
    where: DemandeWhereUniqueInput
    update: XOR<DemandeUpdateWithoutUserInput, DemandeUncheckedUpdateWithoutUserInput>
    create: XOR<DemandeCreateWithoutUserInput, DemandeUncheckedCreateWithoutUserInput>
  }

  export type DemandeUpdateWithWhereUniqueWithoutUserInput = {
    where: DemandeWhereUniqueInput
    data: XOR<DemandeUpdateWithoutUserInput, DemandeUncheckedUpdateWithoutUserInput>
  }

  export type DemandeUpdateManyWithWhereWithoutUserInput = {
    where: DemandeScalarWhereInput
    data: XOR<DemandeUpdateManyMutationInput, DemandeUncheckedUpdateManyWithoutUserInput>
  }

  export type DemandeScalarWhereInput = {
    AND?: DemandeScalarWhereInput | DemandeScalarWhereInput[]
    OR?: DemandeScalarWhereInput[]
    NOT?: DemandeScalarWhereInput | DemandeScalarWhereInput[]
    id?: StringFilter<"Demande"> | string
    userId?: StringFilter<"Demande"> | string
    formationId?: StringFilter<"Demande"> | string
    statut?: EnumStatutFilter<"Demande"> | $Enums.Statut
    message?: StringNullableFilter<"Demande"> | string | null
    commentaire?: StringNullableFilter<"Demande"> | string | null
    createdAt?: DateTimeFilter<"Demande"> | Date | string
    updatedAt?: DateTimeFilter<"Demande"> | Date | string
  }

  export type DevisUpsertWithWhereUniqueWithoutUserInput = {
    where: DevisWhereUniqueInput
    update: XOR<DevisUpdateWithoutUserInput, DevisUncheckedUpdateWithoutUserInput>
    create: XOR<DevisCreateWithoutUserInput, DevisUncheckedCreateWithoutUserInput>
  }

  export type DevisUpdateWithWhereUniqueWithoutUserInput = {
    where: DevisWhereUniqueInput
    data: XOR<DevisUpdateWithoutUserInput, DevisUncheckedUpdateWithoutUserInput>
  }

  export type DevisUpdateManyWithWhereWithoutUserInput = {
    where: DevisScalarWhereInput
    data: XOR<DevisUpdateManyMutationInput, DevisUncheckedUpdateManyWithoutUserInput>
  }

  export type DevisScalarWhereInput = {
    AND?: DevisScalarWhereInput | DevisScalarWhereInput[]
    OR?: DevisScalarWhereInput[]
    NOT?: DevisScalarWhereInput | DevisScalarWhereInput[]
    id?: StringFilter<"Devis"> | string
    demandeId?: StringFilter<"Devis"> | string
    userId?: StringFilter<"Devis"> | string
    numero?: StringFilter<"Devis"> | string
    client?: StringFilter<"Devis"> | string
    mail?: StringFilter<"Devis"> | string
    mail2?: StringFilter<"Devis"> | string
    adresseLivraison?: StringNullableFilter<"Devis"> | string | null
    dateLivraison?: DateTimeNullableFilter<"Devis"> | Date | string | null
    dateExamen?: DateTimeNullableFilter<"Devis"> | Date | string | null
    adresse?: StringNullableFilter<"Devis"> | string | null
    siret?: StringNullableFilter<"Devis"> | string | null
    numNDA?: StringNullableFilter<"Devis"> | string | null
    dateFormation?: DateTimeNullableFilter<"Devis"> | Date | string | null
    suiviPar?: StringNullableFilter<"Devis"> | string | null
    designation?: StringFilter<"Devis"> | string
    quantite?: IntFilter<"Devis"> | number
    unite?: StringFilter<"Devis"> | string
    prixUnitaire?: FloatFilter<"Devis"> | number
    tva?: FloatFilter<"Devis"> | number
    exoneration?: StringNullableFilter<"Devis"> | string | null
    datePriseEffet?: DateTimeNullableFilter<"Devis"> | Date | string | null
    montant?: FloatFilter<"Devis"> | number
    iban?: StringNullableFilter<"Devis"> | string | null
    bic?: StringNullableFilter<"Devis"> | string | null
    banque?: StringNullableFilter<"Devis"> | string | null
    intituleCompte?: StringNullableFilter<"Devis"> | string | null
    signature?: StringNullableFilter<"Devis"> | string | null
    statut?: EnumStatutFilter<"Devis"> | $Enums.Statut
    createdAt?: DateTimeFilter<"Devis"> | Date | string
    updatedAt?: DateTimeFilter<"Devis"> | Date | string
  }

  export type ContratUpsertWithWhereUniqueWithoutUserInput = {
    where: ContratWhereUniqueInput
    update: XOR<ContratUpdateWithoutUserInput, ContratUncheckedUpdateWithoutUserInput>
    create: XOR<ContratCreateWithoutUserInput, ContratUncheckedCreateWithoutUserInput>
  }

  export type ContratUpdateWithWhereUniqueWithoutUserInput = {
    where: ContratWhereUniqueInput
    data: XOR<ContratUpdateWithoutUserInput, ContratUncheckedUpdateWithoutUserInput>
  }

  export type ContratUpdateManyWithWhereWithoutUserInput = {
    where: ContratScalarWhereInput
    data: XOR<ContratUpdateManyMutationInput, ContratUncheckedUpdateManyWithoutUserInput>
  }

  export type ContratScalarWhereInput = {
    AND?: ContratScalarWhereInput | ContratScalarWhereInput[]
    OR?: ContratScalarWhereInput[]
    NOT?: ContratScalarWhereInput | ContratScalarWhereInput[]
    id?: StringFilter<"Contrat"> | string
    devisId?: StringFilter<"Contrat"> | string
    userId?: StringFilter<"Contrat"> | string
    statut?: EnumStatutFilter<"Contrat"> | $Enums.Statut
    dateDebut?: DateTimeNullableFilter<"Contrat"> | Date | string | null
    dateFin?: DateTimeNullableFilter<"Contrat"> | Date | string | null
    createdAt?: DateTimeFilter<"Contrat"> | Date | string
    updatedAt?: DateTimeFilter<"Contrat"> | Date | string
  }

  export type DemandeCreateWithoutFormationInput = {
    id?: string
    statut?: $Enums.Statut
    message?: string | null
    commentaire?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutDemandesInput
    devis?: DevisCreateNestedOneWithoutDemandeInput
  }

  export type DemandeUncheckedCreateWithoutFormationInput = {
    id?: string
    userId: string
    statut?: $Enums.Statut
    message?: string | null
    commentaire?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    devis?: DevisUncheckedCreateNestedOneWithoutDemandeInput
  }

  export type DemandeCreateOrConnectWithoutFormationInput = {
    where: DemandeWhereUniqueInput
    create: XOR<DemandeCreateWithoutFormationInput, DemandeUncheckedCreateWithoutFormationInput>
  }

  export type DemandeCreateManyFormationInputEnvelope = {
    data: DemandeCreateManyFormationInput | DemandeCreateManyFormationInput[]
    skipDuplicates?: boolean
  }

  export type DemandeUpsertWithWhereUniqueWithoutFormationInput = {
    where: DemandeWhereUniqueInput
    update: XOR<DemandeUpdateWithoutFormationInput, DemandeUncheckedUpdateWithoutFormationInput>
    create: XOR<DemandeCreateWithoutFormationInput, DemandeUncheckedCreateWithoutFormationInput>
  }

  export type DemandeUpdateWithWhereUniqueWithoutFormationInput = {
    where: DemandeWhereUniqueInput
    data: XOR<DemandeUpdateWithoutFormationInput, DemandeUncheckedUpdateWithoutFormationInput>
  }

  export type DemandeUpdateManyWithWhereWithoutFormationInput = {
    where: DemandeScalarWhereInput
    data: XOR<DemandeUpdateManyMutationInput, DemandeUncheckedUpdateManyWithoutFormationInput>
  }

  export type UserCreateWithoutDemandesInput = {
    id?: string
    email: string
    password: string
    nom: string
    prenom: string
    role?: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    devis?: DevisCreateNestedManyWithoutUserInput
    contrats?: ContratCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutDemandesInput = {
    id?: string
    email: string
    password: string
    nom: string
    prenom: string
    role?: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    devis?: DevisUncheckedCreateNestedManyWithoutUserInput
    contrats?: ContratUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutDemandesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutDemandesInput, UserUncheckedCreateWithoutDemandesInput>
  }

  export type FormationCreateWithoutDemandesInput = {
    id?: string
    titre: string
    description: string
    duree: string
    prix: number
    niveau: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FormationUncheckedCreateWithoutDemandesInput = {
    id?: string
    titre: string
    description: string
    duree: string
    prix: number
    niveau: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FormationCreateOrConnectWithoutDemandesInput = {
    where: FormationWhereUniqueInput
    create: XOR<FormationCreateWithoutDemandesInput, FormationUncheckedCreateWithoutDemandesInput>
  }

  export type DevisCreateWithoutDemandeInput = {
    id?: string
    numero: string
    client: string
    mail: string
    mail2?: string
    adresseLivraison?: string | null
    dateLivraison?: Date | string | null
    dateExamen?: Date | string | null
    adresse?: string | null
    siret?: string | null
    numNDA?: string | null
    dateFormation?: Date | string | null
    suiviPar?: string | null
    designation: string
    quantite: number
    unite: string
    prixUnitaire: number
    tva: number
    exoneration?: string | null
    datePriseEffet?: Date | string | null
    montant: number
    iban?: string | null
    bic?: string | null
    banque?: string | null
    intituleCompte?: string | null
    signature?: string | null
    statut?: $Enums.Statut
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutDevisInput
    contrat?: ContratCreateNestedOneWithoutDevisInput
  }

  export type DevisUncheckedCreateWithoutDemandeInput = {
    id?: string
    userId: string
    numero: string
    client: string
    mail: string
    mail2?: string
    adresseLivraison?: string | null
    dateLivraison?: Date | string | null
    dateExamen?: Date | string | null
    adresse?: string | null
    siret?: string | null
    numNDA?: string | null
    dateFormation?: Date | string | null
    suiviPar?: string | null
    designation: string
    quantite: number
    unite: string
    prixUnitaire: number
    tva: number
    exoneration?: string | null
    datePriseEffet?: Date | string | null
    montant: number
    iban?: string | null
    bic?: string | null
    banque?: string | null
    intituleCompte?: string | null
    signature?: string | null
    statut?: $Enums.Statut
    createdAt?: Date | string
    updatedAt?: Date | string
    contrat?: ContratUncheckedCreateNestedOneWithoutDevisInput
  }

  export type DevisCreateOrConnectWithoutDemandeInput = {
    where: DevisWhereUniqueInput
    create: XOR<DevisCreateWithoutDemandeInput, DevisUncheckedCreateWithoutDemandeInput>
  }

  export type UserUpsertWithoutDemandesInput = {
    update: XOR<UserUpdateWithoutDemandesInput, UserUncheckedUpdateWithoutDemandesInput>
    create: XOR<UserCreateWithoutDemandesInput, UserUncheckedCreateWithoutDemandesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutDemandesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutDemandesInput, UserUncheckedUpdateWithoutDemandesInput>
  }

  export type UserUpdateWithoutDemandesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    devis?: DevisUpdateManyWithoutUserNestedInput
    contrats?: ContratUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutDemandesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    devis?: DevisUncheckedUpdateManyWithoutUserNestedInput
    contrats?: ContratUncheckedUpdateManyWithoutUserNestedInput
  }

  export type FormationUpsertWithoutDemandesInput = {
    update: XOR<FormationUpdateWithoutDemandesInput, FormationUncheckedUpdateWithoutDemandesInput>
    create: XOR<FormationCreateWithoutDemandesInput, FormationUncheckedCreateWithoutDemandesInput>
    where?: FormationWhereInput
  }

  export type FormationUpdateToOneWithWhereWithoutDemandesInput = {
    where?: FormationWhereInput
    data: XOR<FormationUpdateWithoutDemandesInput, FormationUncheckedUpdateWithoutDemandesInput>
  }

  export type FormationUpdateWithoutDemandesInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    duree?: StringFieldUpdateOperationsInput | string
    prix?: FloatFieldUpdateOperationsInput | number
    niveau?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FormationUncheckedUpdateWithoutDemandesInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    duree?: StringFieldUpdateOperationsInput | string
    prix?: FloatFieldUpdateOperationsInput | number
    niveau?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DevisUpsertWithoutDemandeInput = {
    update: XOR<DevisUpdateWithoutDemandeInput, DevisUncheckedUpdateWithoutDemandeInput>
    create: XOR<DevisCreateWithoutDemandeInput, DevisUncheckedCreateWithoutDemandeInput>
    where?: DevisWhereInput
  }

  export type DevisUpdateToOneWithWhereWithoutDemandeInput = {
    where?: DevisWhereInput
    data: XOR<DevisUpdateWithoutDemandeInput, DevisUncheckedUpdateWithoutDemandeInput>
  }

  export type DevisUpdateWithoutDemandeInput = {
    id?: StringFieldUpdateOperationsInput | string
    numero?: StringFieldUpdateOperationsInput | string
    client?: StringFieldUpdateOperationsInput | string
    mail?: StringFieldUpdateOperationsInput | string
    mail2?: StringFieldUpdateOperationsInput | string
    adresseLivraison?: NullableStringFieldUpdateOperationsInput | string | null
    dateLivraison?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dateExamen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    siret?: NullableStringFieldUpdateOperationsInput | string | null
    numNDA?: NullableStringFieldUpdateOperationsInput | string | null
    dateFormation?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    suiviPar?: NullableStringFieldUpdateOperationsInput | string | null
    designation?: StringFieldUpdateOperationsInput | string
    quantite?: IntFieldUpdateOperationsInput | number
    unite?: StringFieldUpdateOperationsInput | string
    prixUnitaire?: FloatFieldUpdateOperationsInput | number
    tva?: FloatFieldUpdateOperationsInput | number
    exoneration?: NullableStringFieldUpdateOperationsInput | string | null
    datePriseEffet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    montant?: FloatFieldUpdateOperationsInput | number
    iban?: NullableStringFieldUpdateOperationsInput | string | null
    bic?: NullableStringFieldUpdateOperationsInput | string | null
    banque?: NullableStringFieldUpdateOperationsInput | string | null
    intituleCompte?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutDevisNestedInput
    contrat?: ContratUpdateOneWithoutDevisNestedInput
  }

  export type DevisUncheckedUpdateWithoutDemandeInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    numero?: StringFieldUpdateOperationsInput | string
    client?: StringFieldUpdateOperationsInput | string
    mail?: StringFieldUpdateOperationsInput | string
    mail2?: StringFieldUpdateOperationsInput | string
    adresseLivraison?: NullableStringFieldUpdateOperationsInput | string | null
    dateLivraison?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dateExamen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    siret?: NullableStringFieldUpdateOperationsInput | string | null
    numNDA?: NullableStringFieldUpdateOperationsInput | string | null
    dateFormation?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    suiviPar?: NullableStringFieldUpdateOperationsInput | string | null
    designation?: StringFieldUpdateOperationsInput | string
    quantite?: IntFieldUpdateOperationsInput | number
    unite?: StringFieldUpdateOperationsInput | string
    prixUnitaire?: FloatFieldUpdateOperationsInput | number
    tva?: FloatFieldUpdateOperationsInput | number
    exoneration?: NullableStringFieldUpdateOperationsInput | string | null
    datePriseEffet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    montant?: FloatFieldUpdateOperationsInput | number
    iban?: NullableStringFieldUpdateOperationsInput | string | null
    bic?: NullableStringFieldUpdateOperationsInput | string | null
    banque?: NullableStringFieldUpdateOperationsInput | string | null
    intituleCompte?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contrat?: ContratUncheckedUpdateOneWithoutDevisNestedInput
  }

  export type DemandeCreateWithoutDevisInput = {
    id?: string
    statut?: $Enums.Statut
    message?: string | null
    commentaire?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutDemandesInput
    formation: FormationCreateNestedOneWithoutDemandesInput
  }

  export type DemandeUncheckedCreateWithoutDevisInput = {
    id?: string
    userId: string
    formationId: string
    statut?: $Enums.Statut
    message?: string | null
    commentaire?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DemandeCreateOrConnectWithoutDevisInput = {
    where: DemandeWhereUniqueInput
    create: XOR<DemandeCreateWithoutDevisInput, DemandeUncheckedCreateWithoutDevisInput>
  }

  export type UserCreateWithoutDevisInput = {
    id?: string
    email: string
    password: string
    nom: string
    prenom: string
    role?: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    demandes?: DemandeCreateNestedManyWithoutUserInput
    contrats?: ContratCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutDevisInput = {
    id?: string
    email: string
    password: string
    nom: string
    prenom: string
    role?: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    demandes?: DemandeUncheckedCreateNestedManyWithoutUserInput
    contrats?: ContratUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutDevisInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutDevisInput, UserUncheckedCreateWithoutDevisInput>
  }

  export type ContratCreateWithoutDevisInput = {
    id?: string
    statut?: $Enums.Statut
    dateDebut?: Date | string | null
    dateFin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutContratsInput
  }

  export type ContratUncheckedCreateWithoutDevisInput = {
    id?: string
    userId: string
    statut?: $Enums.Statut
    dateDebut?: Date | string | null
    dateFin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ContratCreateOrConnectWithoutDevisInput = {
    where: ContratWhereUniqueInput
    create: XOR<ContratCreateWithoutDevisInput, ContratUncheckedCreateWithoutDevisInput>
  }

  export type DemandeUpsertWithoutDevisInput = {
    update: XOR<DemandeUpdateWithoutDevisInput, DemandeUncheckedUpdateWithoutDevisInput>
    create: XOR<DemandeCreateWithoutDevisInput, DemandeUncheckedCreateWithoutDevisInput>
    where?: DemandeWhereInput
  }

  export type DemandeUpdateToOneWithWhereWithoutDevisInput = {
    where?: DemandeWhereInput
    data: XOR<DemandeUpdateWithoutDevisInput, DemandeUncheckedUpdateWithoutDevisInput>
  }

  export type DemandeUpdateWithoutDevisInput = {
    id?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    message?: NullableStringFieldUpdateOperationsInput | string | null
    commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutDemandesNestedInput
    formation?: FormationUpdateOneRequiredWithoutDemandesNestedInput
  }

  export type DemandeUncheckedUpdateWithoutDevisInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    formationId?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    message?: NullableStringFieldUpdateOperationsInput | string | null
    commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUpsertWithoutDevisInput = {
    update: XOR<UserUpdateWithoutDevisInput, UserUncheckedUpdateWithoutDevisInput>
    create: XOR<UserCreateWithoutDevisInput, UserUncheckedCreateWithoutDevisInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutDevisInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutDevisInput, UserUncheckedUpdateWithoutDevisInput>
  }

  export type UserUpdateWithoutDevisInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    demandes?: DemandeUpdateManyWithoutUserNestedInput
    contrats?: ContratUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutDevisInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    demandes?: DemandeUncheckedUpdateManyWithoutUserNestedInput
    contrats?: ContratUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ContratUpsertWithoutDevisInput = {
    update: XOR<ContratUpdateWithoutDevisInput, ContratUncheckedUpdateWithoutDevisInput>
    create: XOR<ContratCreateWithoutDevisInput, ContratUncheckedCreateWithoutDevisInput>
    where?: ContratWhereInput
  }

  export type ContratUpdateToOneWithWhereWithoutDevisInput = {
    where?: ContratWhereInput
    data: XOR<ContratUpdateWithoutDevisInput, ContratUncheckedUpdateWithoutDevisInput>
  }

  export type ContratUpdateWithoutDevisInput = {
    id?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    dateDebut?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dateFin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutContratsNestedInput
  }

  export type ContratUncheckedUpdateWithoutDevisInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    dateDebut?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dateFin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DevisCreateWithoutContratInput = {
    id?: string
    numero: string
    client: string
    mail: string
    mail2?: string
    adresseLivraison?: string | null
    dateLivraison?: Date | string | null
    dateExamen?: Date | string | null
    adresse?: string | null
    siret?: string | null
    numNDA?: string | null
    dateFormation?: Date | string | null
    suiviPar?: string | null
    designation: string
    quantite: number
    unite: string
    prixUnitaire: number
    tva: number
    exoneration?: string | null
    datePriseEffet?: Date | string | null
    montant: number
    iban?: string | null
    bic?: string | null
    banque?: string | null
    intituleCompte?: string | null
    signature?: string | null
    statut?: $Enums.Statut
    createdAt?: Date | string
    updatedAt?: Date | string
    demande: DemandeCreateNestedOneWithoutDevisInput
    user: UserCreateNestedOneWithoutDevisInput
  }

  export type DevisUncheckedCreateWithoutContratInput = {
    id?: string
    demandeId: string
    userId: string
    numero: string
    client: string
    mail: string
    mail2?: string
    adresseLivraison?: string | null
    dateLivraison?: Date | string | null
    dateExamen?: Date | string | null
    adresse?: string | null
    siret?: string | null
    numNDA?: string | null
    dateFormation?: Date | string | null
    suiviPar?: string | null
    designation: string
    quantite: number
    unite: string
    prixUnitaire: number
    tva: number
    exoneration?: string | null
    datePriseEffet?: Date | string | null
    montant: number
    iban?: string | null
    bic?: string | null
    banque?: string | null
    intituleCompte?: string | null
    signature?: string | null
    statut?: $Enums.Statut
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DevisCreateOrConnectWithoutContratInput = {
    where: DevisWhereUniqueInput
    create: XOR<DevisCreateWithoutContratInput, DevisUncheckedCreateWithoutContratInput>
  }

  export type UserCreateWithoutContratsInput = {
    id?: string
    email: string
    password: string
    nom: string
    prenom: string
    role?: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    demandes?: DemandeCreateNestedManyWithoutUserInput
    devis?: DevisCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutContratsInput = {
    id?: string
    email: string
    password: string
    nom: string
    prenom: string
    role?: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    demandes?: DemandeUncheckedCreateNestedManyWithoutUserInput
    devis?: DevisUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutContratsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutContratsInput, UserUncheckedCreateWithoutContratsInput>
  }

  export type DevisUpsertWithoutContratInput = {
    update: XOR<DevisUpdateWithoutContratInput, DevisUncheckedUpdateWithoutContratInput>
    create: XOR<DevisCreateWithoutContratInput, DevisUncheckedCreateWithoutContratInput>
    where?: DevisWhereInput
  }

  export type DevisUpdateToOneWithWhereWithoutContratInput = {
    where?: DevisWhereInput
    data: XOR<DevisUpdateWithoutContratInput, DevisUncheckedUpdateWithoutContratInput>
  }

  export type DevisUpdateWithoutContratInput = {
    id?: StringFieldUpdateOperationsInput | string
    numero?: StringFieldUpdateOperationsInput | string
    client?: StringFieldUpdateOperationsInput | string
    mail?: StringFieldUpdateOperationsInput | string
    mail2?: StringFieldUpdateOperationsInput | string
    adresseLivraison?: NullableStringFieldUpdateOperationsInput | string | null
    dateLivraison?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dateExamen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    siret?: NullableStringFieldUpdateOperationsInput | string | null
    numNDA?: NullableStringFieldUpdateOperationsInput | string | null
    dateFormation?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    suiviPar?: NullableStringFieldUpdateOperationsInput | string | null
    designation?: StringFieldUpdateOperationsInput | string
    quantite?: IntFieldUpdateOperationsInput | number
    unite?: StringFieldUpdateOperationsInput | string
    prixUnitaire?: FloatFieldUpdateOperationsInput | number
    tva?: FloatFieldUpdateOperationsInput | number
    exoneration?: NullableStringFieldUpdateOperationsInput | string | null
    datePriseEffet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    montant?: FloatFieldUpdateOperationsInput | number
    iban?: NullableStringFieldUpdateOperationsInput | string | null
    bic?: NullableStringFieldUpdateOperationsInput | string | null
    banque?: NullableStringFieldUpdateOperationsInput | string | null
    intituleCompte?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    demande?: DemandeUpdateOneRequiredWithoutDevisNestedInput
    user?: UserUpdateOneRequiredWithoutDevisNestedInput
  }

  export type DevisUncheckedUpdateWithoutContratInput = {
    id?: StringFieldUpdateOperationsInput | string
    demandeId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    numero?: StringFieldUpdateOperationsInput | string
    client?: StringFieldUpdateOperationsInput | string
    mail?: StringFieldUpdateOperationsInput | string
    mail2?: StringFieldUpdateOperationsInput | string
    adresseLivraison?: NullableStringFieldUpdateOperationsInput | string | null
    dateLivraison?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dateExamen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    siret?: NullableStringFieldUpdateOperationsInput | string | null
    numNDA?: NullableStringFieldUpdateOperationsInput | string | null
    dateFormation?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    suiviPar?: NullableStringFieldUpdateOperationsInput | string | null
    designation?: StringFieldUpdateOperationsInput | string
    quantite?: IntFieldUpdateOperationsInput | number
    unite?: StringFieldUpdateOperationsInput | string
    prixUnitaire?: FloatFieldUpdateOperationsInput | number
    tva?: FloatFieldUpdateOperationsInput | number
    exoneration?: NullableStringFieldUpdateOperationsInput | string | null
    datePriseEffet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    montant?: FloatFieldUpdateOperationsInput | number
    iban?: NullableStringFieldUpdateOperationsInput | string | null
    bic?: NullableStringFieldUpdateOperationsInput | string | null
    banque?: NullableStringFieldUpdateOperationsInput | string | null
    intituleCompte?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUpsertWithoutContratsInput = {
    update: XOR<UserUpdateWithoutContratsInput, UserUncheckedUpdateWithoutContratsInput>
    create: XOR<UserCreateWithoutContratsInput, UserUncheckedCreateWithoutContratsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutContratsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutContratsInput, UserUncheckedUpdateWithoutContratsInput>
  }

  export type UserUpdateWithoutContratsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    demandes?: DemandeUpdateManyWithoutUserNestedInput
    devis?: DevisUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutContratsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    demandes?: DemandeUncheckedUpdateManyWithoutUserNestedInput
    devis?: DevisUncheckedUpdateManyWithoutUserNestedInput
  }

  export type DemandeCreateManyUserInput = {
    id?: string
    formationId: string
    statut?: $Enums.Statut
    message?: string | null
    commentaire?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DevisCreateManyUserInput = {
    id?: string
    demandeId: string
    numero: string
    client: string
    mail: string
    mail2?: string
    adresseLivraison?: string | null
    dateLivraison?: Date | string | null
    dateExamen?: Date | string | null
    adresse?: string | null
    siret?: string | null
    numNDA?: string | null
    dateFormation?: Date | string | null
    suiviPar?: string | null
    designation: string
    quantite: number
    unite: string
    prixUnitaire: number
    tva: number
    exoneration?: string | null
    datePriseEffet?: Date | string | null
    montant: number
    iban?: string | null
    bic?: string | null
    banque?: string | null
    intituleCompte?: string | null
    signature?: string | null
    statut?: $Enums.Statut
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ContratCreateManyUserInput = {
    id?: string
    devisId: string
    statut?: $Enums.Statut
    dateDebut?: Date | string | null
    dateFin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DemandeUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    message?: NullableStringFieldUpdateOperationsInput | string | null
    commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formation?: FormationUpdateOneRequiredWithoutDemandesNestedInput
    devis?: DevisUpdateOneWithoutDemandeNestedInput
  }

  export type DemandeUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    formationId?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    message?: NullableStringFieldUpdateOperationsInput | string | null
    commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    devis?: DevisUncheckedUpdateOneWithoutDemandeNestedInput
  }

  export type DemandeUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    formationId?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    message?: NullableStringFieldUpdateOperationsInput | string | null
    commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DevisUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    numero?: StringFieldUpdateOperationsInput | string
    client?: StringFieldUpdateOperationsInput | string
    mail?: StringFieldUpdateOperationsInput | string
    mail2?: StringFieldUpdateOperationsInput | string
    adresseLivraison?: NullableStringFieldUpdateOperationsInput | string | null
    dateLivraison?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dateExamen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    siret?: NullableStringFieldUpdateOperationsInput | string | null
    numNDA?: NullableStringFieldUpdateOperationsInput | string | null
    dateFormation?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    suiviPar?: NullableStringFieldUpdateOperationsInput | string | null
    designation?: StringFieldUpdateOperationsInput | string
    quantite?: IntFieldUpdateOperationsInput | number
    unite?: StringFieldUpdateOperationsInput | string
    prixUnitaire?: FloatFieldUpdateOperationsInput | number
    tva?: FloatFieldUpdateOperationsInput | number
    exoneration?: NullableStringFieldUpdateOperationsInput | string | null
    datePriseEffet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    montant?: FloatFieldUpdateOperationsInput | number
    iban?: NullableStringFieldUpdateOperationsInput | string | null
    bic?: NullableStringFieldUpdateOperationsInput | string | null
    banque?: NullableStringFieldUpdateOperationsInput | string | null
    intituleCompte?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    demande?: DemandeUpdateOneRequiredWithoutDevisNestedInput
    contrat?: ContratUpdateOneWithoutDevisNestedInput
  }

  export type DevisUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    demandeId?: StringFieldUpdateOperationsInput | string
    numero?: StringFieldUpdateOperationsInput | string
    client?: StringFieldUpdateOperationsInput | string
    mail?: StringFieldUpdateOperationsInput | string
    mail2?: StringFieldUpdateOperationsInput | string
    adresseLivraison?: NullableStringFieldUpdateOperationsInput | string | null
    dateLivraison?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dateExamen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    siret?: NullableStringFieldUpdateOperationsInput | string | null
    numNDA?: NullableStringFieldUpdateOperationsInput | string | null
    dateFormation?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    suiviPar?: NullableStringFieldUpdateOperationsInput | string | null
    designation?: StringFieldUpdateOperationsInput | string
    quantite?: IntFieldUpdateOperationsInput | number
    unite?: StringFieldUpdateOperationsInput | string
    prixUnitaire?: FloatFieldUpdateOperationsInput | number
    tva?: FloatFieldUpdateOperationsInput | number
    exoneration?: NullableStringFieldUpdateOperationsInput | string | null
    datePriseEffet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    montant?: FloatFieldUpdateOperationsInput | number
    iban?: NullableStringFieldUpdateOperationsInput | string | null
    bic?: NullableStringFieldUpdateOperationsInput | string | null
    banque?: NullableStringFieldUpdateOperationsInput | string | null
    intituleCompte?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contrat?: ContratUncheckedUpdateOneWithoutDevisNestedInput
  }

  export type DevisUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    demandeId?: StringFieldUpdateOperationsInput | string
    numero?: StringFieldUpdateOperationsInput | string
    client?: StringFieldUpdateOperationsInput | string
    mail?: StringFieldUpdateOperationsInput | string
    mail2?: StringFieldUpdateOperationsInput | string
    adresseLivraison?: NullableStringFieldUpdateOperationsInput | string | null
    dateLivraison?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dateExamen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    siret?: NullableStringFieldUpdateOperationsInput | string | null
    numNDA?: NullableStringFieldUpdateOperationsInput | string | null
    dateFormation?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    suiviPar?: NullableStringFieldUpdateOperationsInput | string | null
    designation?: StringFieldUpdateOperationsInput | string
    quantite?: IntFieldUpdateOperationsInput | number
    unite?: StringFieldUpdateOperationsInput | string
    prixUnitaire?: FloatFieldUpdateOperationsInput | number
    tva?: FloatFieldUpdateOperationsInput | number
    exoneration?: NullableStringFieldUpdateOperationsInput | string | null
    datePriseEffet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    montant?: FloatFieldUpdateOperationsInput | number
    iban?: NullableStringFieldUpdateOperationsInput | string | null
    bic?: NullableStringFieldUpdateOperationsInput | string | null
    banque?: NullableStringFieldUpdateOperationsInput | string | null
    intituleCompte?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContratUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    dateDebut?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dateFin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    devis?: DevisUpdateOneRequiredWithoutContratNestedInput
  }

  export type ContratUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    devisId?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    dateDebut?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dateFin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContratUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    devisId?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    dateDebut?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dateFin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DemandeCreateManyFormationInput = {
    id?: string
    userId: string
    statut?: $Enums.Statut
    message?: string | null
    commentaire?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DemandeUpdateWithoutFormationInput = {
    id?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    message?: NullableStringFieldUpdateOperationsInput | string | null
    commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutDemandesNestedInput
    devis?: DevisUpdateOneWithoutDemandeNestedInput
  }

  export type DemandeUncheckedUpdateWithoutFormationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    message?: NullableStringFieldUpdateOperationsInput | string | null
    commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    devis?: DevisUncheckedUpdateOneWithoutDemandeNestedInput
  }

  export type DemandeUncheckedUpdateManyWithoutFormationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    statut?: EnumStatutFieldUpdateOperationsInput | $Enums.Statut
    message?: NullableStringFieldUpdateOperationsInput | string | null
    commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}