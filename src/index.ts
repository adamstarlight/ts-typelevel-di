/**
 * Has<K, V> describes existence of key K with a value
 * of type V within the environment
 */
export type Has<K extends string, V> = {[P in K]: V}

/**
 * Layer<E, V> describes a process of creating a new
 * value of type V using services of environment E.
 */
export type Layer<E, V> = (env: Env<E>) => V

/**
 * Env<T> where T is Has<K1, V1> & Has<K2, V2> & ... Has<Kn, Vn>
 * describes environment that contains N services of any arbitrary
 * types V accessible by string literal keys K.
 * 
 * Given an environment Env<Has<K, V>>, it is guaranteed that key K 
 * exists and has a value of type V. Accessing any other key will
 * result in compile time error.
 */
export class Env<T> {

    /** Environment 'map' */
    private m: T

    /**
     * Creates an environment directly. Used internally by the
     * library code.
     * 
     * @param m - Explicitly passed environment map
     */
    private constructor(m: T) {
        this.m = m
    }

    /**
     * Creates a new empty environment
     * 
     * @returns a empty environment
     */
    static build = () => new Env({})

    /**
     * Creates a new environment preserving all previosly composed
     * services and a new service accessible by key K with a value
     * of type V.
     * 
     * If key already exists it will be overriden.
     *
     * @param key - String literal key
     * @param value - Value to compose
     * @returns a new environment
     */
    with<K extends string, V>(key: K, value: V): Env<T & Has<K, V>> {
        const _m = { [key]: value } as Has<K, V>
        return new Env<T & Has<K, V>>({...this.m, ..._m})
    }

    /**
     * Creates a new environment preserving all previosly composed
     * services and a new service dependent on the environment
     * accessible by key K with a value of type V.
     * 
     * If key already exists it will be overriden.
     * 
     * @param key - String literal key
     * @param live - Layer constructor
     * @returns a new environment
     */
    withLayer<K extends string, V>(key: K, live: Layer<T, V>): Env<T & Has<K, V>> {
        return this.with(key, live(this))
    }

    /**
     * Creates a new environment by consuming an old one into layer
     * constructor. The result will be an environment with only a
     * constructed service.
     * 
     * @param key - String literal key
     * @param live - Layer constructor
     * @returns a new environment
     */
    consume<K extends string, V>(key: K, live: Layer<T, V>): Env<Has<K, V>> {
        const _m = { [key]: live(this) } as Has<K, V>
        return new Env<Has<K, V>>(_m)
    }

    /**
     * Returns a service from environment by key.
     * 
     * @param key - String literal key
     * @returns service from the environment
     */
    get<K extends keyof T>(key: K): T[K] {
        return this.m[key]
    }

}