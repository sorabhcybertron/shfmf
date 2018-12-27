import { Injectable } from '@angular/core';

function _window(): any {
    return window; // return the global native browser window object
}
export class WindowRef {
    get nativeWindow(): any {
        return _window();
    }
}