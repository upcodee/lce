import { StoreResponse } from "@upcodee/store";
import { MonoTypeOperatorFunction } from "rxjs";
export interface MutableLce<C, E> {
    loading: boolean;
    content?: C;
    error?: E;
}
export declare function mutableLce<C, E>(loading?: boolean, content?: C | undefined, error?: E | undefined): MutableLce<C, E>;
export declare class MergeLce<E> {
    private lces;
    constructor(...lces: MutableLce<any, E>[]);
    get error(): E | undefined;
    clearFirstError(): void;
    private getFirstLce;
    get loading(): boolean;
}
export declare function onEachSetTo<C, E>(lce: MutableLce<C, E>, anyToError: (error: any) => E): MonoTypeOperatorFunction<C>;
export declare function onEachStoreSetTo<C, E>(lce: MutableLce<C, E>, loadingAfterCached: boolean, anyToError: (error: any) => E): MonoTypeOperatorFunction<StoreResponse<C>>;
