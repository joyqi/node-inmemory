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

    it('should wait for a promise to resolve', async () => {
        let counter = 0;
        const [get] = inMemory(() => new Promise((resolve) => {
            setTimeout(() => {
                counter += 1;
                resolve(1);
            }, 100)
        }));

        assert.deepStrictEqual(await Promise.all([get(), get(), get()]), [1, 1, 1]);
        assert.strictEqual(counter, 1);
    });

    it('should throw an error if the promise rejects', async () => {
        let counter = 0;
        const [get] = inMemory(() => new Promise((_, reject) => {
            setTimeout(() => {
                counter += 1;
                reject(new Error('test'));
            }, 100)
        }));

        get().catch(e => {
            assert.strictEqual(e.message, 'test');
        });

        try {
            await get();
            assert.fail('should have thrown');
        } catch (e) {
            if (e instanceof Error) {
                assert.strictEqual(e.message, 'test');
            } else {
                assert.fail('should have thrown an error');
            }
        }

        assert.strictEqual(counter, 1);
    });
});