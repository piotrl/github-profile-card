// General helper interfaces

interface IMap<T> {
    [K: string]: T;
}

interface ICallback<T> {
    (data: T): void
}

interface IJqueryDeferredLike<T> {
    success: (callback: (result: T, request: XMLHttpRequest) => void) => void;
    error: (callback: (result: T, request: XMLHttpRequest) => void) => void;
}