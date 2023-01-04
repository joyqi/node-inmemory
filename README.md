# node-inmemory

A simple in-memory cache for node.js. Create a new cache with a given ttl (time to live) and a callback function to be called when the cache expires.

## Installation

```bash
npm install inmemory
```

## Usage

```javascript
const { inMemory } = require('inmemory');

const [get, reset] = inMemory(() => {
  console.log('Cache initialized');
  return 'Hello World';
}, 1000);

console.log(get()); // Cache initialized \n Hello World
reset();
console.log(get()); // Cache initialized \n Hello World

setTimeout(() => {
  console.log(get()); // Cache initialized \n Hello World
}, 2000);
```

Async functions are also supported:

```javascript
const { inMemory } = require('inmemory');

const [get, reset] = inMemory(async () => {
  console.log('Cache initialized');
  return 'Hello World';
}, 1000);

console.log(await get()); // Cache initialized \n Hello World
```

Set ttl to 0 (default) to disable the expiration:

```javascript
const { inMemory } = require('inmemory');

const [get, reset] = inMemory(() => {
  console.log('Cache initialized');
  return 'Hello World';
});

console.log(get()); // Cache initialized \n Hello World

setTimeout(() => {
  console.log(get()); // Hello World
}, 2000);
```