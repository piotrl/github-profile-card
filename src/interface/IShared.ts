// General helper interfaces
export interface JqueryDeferred<T> {
    success: (callback: (result: T, request: XMLHttpRequest) => void) => void;
    error: (callback: (result: T, request: XMLHttpRequest) => void) => void;
}
