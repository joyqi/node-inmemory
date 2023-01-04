type StoreItem = {
    value: any;
    expires: number;
};

// Store the values in a WeakMap.
const storage = new WeakMap<object, StoreItem>();

// Set a value in the storage.
function setValue(key: object, value: any, ttl = 0) {
    storage.set(key, {
        value,
        expires: ttl > 0 ? Date.now() + ttl : 0,
    });
}

// Generate a getter and a resetter for a function.
// The getter will cache the result of the function.
// The resetter will clear the cache.
export function inMemory<T extends any, ReturnValue extends T | Promise<T>>(fn: () => ReturnValue, ttl = 0): [() => ReturnValue, () => void] {
    const getter = () => {
        const item = storage.get(fn);
        if (item && (item.expires === 0 || item.expires > Date.now())) {
            return item.value;
        }

        const returnValue = fn();

        if (returnValue instanceof Promise) {
            return returnValue.then((value) => {
                setValue(fn, value, ttl);
                return value;
            });
        } else {
            setValue(fn, returnValue, ttl);
            return returnValue;
        }
    };

    const resetter = () => {
        storage.delete(fn);
    };

    return [getter, resetter];
}
