import {StoreResponse, StoreResponseData, StoreResponseError, StoreResponseLoading} from "@upcodee/store"
import {action} from "mobx"
import {MonoTypeOperatorFunction, pipe} from "rxjs"
import {tap} from "rxjs/operators";

export interface MutableLce<C, E> {
    loading: boolean
    content?: C
    error?: E
}

export function mutableLce<C, E>(loading: boolean = false, content: C | undefined = undefined, error: E | undefined = undefined): MutableLce<C, E> {
    return {
        loading: loading,
        error: error,
        content: content
    } as MutableLce<C, E>
}

export class MergeLce<E> {

    private lces: MutableLce<any, E>[];

    constructor(...lces: MutableLce<any, E>[]) {
        this.lces = lces;
    }

    get error(): E | undefined {
        const firstLce = this.getFirstLce()
        return firstLce && firstLce.error
    }

    clearFirstError(): void {
        const firstLce = this.getFirstLce()
        action("clearFirstErrorAction", () => {
            firstLce.error = undefined
        })()
    }

    private getFirstLce() {
        return this.lces.filter(it => it.error != undefined)[0];
    }

    get loading(): boolean {
        return this.lces.filter(it => it.loading)[0] != undefined
    }

}

export function onEachSetTo<C, E>(lce: MutableLce<C, E>, anyToError: (error: any) => E): MonoTypeOperatorFunction<C> {
    action("onEachSetToLoading", () => {
        lce.loading = true
    })()
    return pipe(
        tap(action("onEachSetToContent", (it: C) => {
            lce.content = it
            lce.loading = false
        }), action("onEachSetToError", err => {
            lce.error = anyToError(err)
            lce.loading = false
        }))
    )
}

export function onEachStoreSetTo<C, E>(lce: MutableLce<C, E>, loadingAfterCached: boolean, anyToError: (error: any) => E): MonoTypeOperatorFunction<StoreResponse<C>> {
    return tap({
        next: (it: StoreResponse<C>) => {
            switch (it.type) {
                case "StoreResponseLoading":
                    action("subscribeLceLoading", (it: StoreResponseLoading) => {
                        lce.loading = true
                    })(it)
                    break
                case "StoreResponseError":
                    action("subscribeLceError", (it: StoreResponseError) => {
                        lce.error = anyToError(it.error)
                        lce.loading = false
                    })(it)
                    break
                case "StoreResponseData":
                    action("subscribeLceContent", (it: StoreResponseData<C>) => {
                        lce.content = it.value
                        lce.loading = loadingAfterCached && it.origin != "Fetcher"
                    })(it)
                    break
            }
        }
    })
}