import { inMemory } from '.';
import { describe } from 'mocha';
import assert from 'assert';

describe('inMemory', () => {
    it('should cache the result of a function', () => {
        let counter = 0;
        const [get, reset] = inMemory(() => counter++);
        assert.strictEqual(get(), 0);
        reset();
        assert.strictEqual(get(), 1);
    });

    it('should cache the result of a promise', async () => {
        let counter = 0;
        const [get, reset] = inMemory(() => Promise.resolve(counter++));
        assert.strictEqual(await get(), 0);
        reset();
        assert.strictEqual(await get(), 1);
    });
});