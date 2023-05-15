type StoreItem = {
    value: any;
    expires: number;
    refreshed: boolean;
};

// Store the values in a WeakMap.
const storage = new WeakMap<object, StoreItem>();

// Set a value in the storage.
function setValue(key: object, value: any, ttl = 0) {
    storage.set(key, {
        value,
        expires: ttl > 0 ? Date.now() + ttl : 0,
        refreshed: false,
    });
}

// Wait for a value to be set.
function wait<T>() {
    let waitResolve: (value: any) => void;
    let waitReject: (e: any) => void;

    const value = new Promise<T>((resolve, reject) => {
        waitResolve = resolve;
        waitReject = reject;
    });

    const cbResolve = (value: any) => {
        if (waitResolve) {
            waitResolve(value);
        }
    };

    const cbReject = (e: any) => {
        if (waitReject) {
            waitReject(e);
        }
    };

    return [value, cbResolve, cbReject] as const;
}

// Generate a getter and a resetter for a function.
// The getter will cache the result of the function.
// The resetter will clear the cache.
export function inMemory<T extends any, ReturnValue extends T | Promise<T>>(fn: () => ReturnValue, ttl = 0): [() => ReturnValue, (value?: any) => void] {
    const setter = (value?: any) => {
        if (typeof value !== 'undefined') {
            setValue(fn, value, ttl);
        } else {
            storage.delete(fn);
        }
    };

    const getter = () => {
        const item = storage.get(fn);
        if (item) {
            if (item.expires === 0 || item.expires > Date.now() || item.refreshed) {
                return item.value;
            }

            // allow only one refresh per ttl
            item.refreshed = true;
        }

        const returnValue = fn();

        if (returnValue instanceof Promise) {
            const [v, cbResolve, cbReject] = wait<T>();
            setValue(fn, v);

            return returnValue.then((value) => {
                cbResolve(value);
                setter(value);
                return value;
            }).catch(e => {
                cbReject(e);
                setter();
                throw e;
            });
        } else {
            setter(returnValue);
            return returnValue;
        }
    };

    return [getter, setter];
}
