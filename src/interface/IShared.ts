// General helper interfaces
export interface IMap<T> {
    [K: string]: T;
}

export interface ICallback<T> {
    (data: T): void;
}

export interface IJqueryDeferredLike<T> {
    success: (callback: (result: T, request: XMLHttpRequest) => void) => void;
    error: (callback: (result: T, request: XMLHttpRequest) => void) => void;
}
