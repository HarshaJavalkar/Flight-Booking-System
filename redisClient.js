// 1. First install the Redis package
// npm install redis

// 2. Import and initialize properly
const { createClient } = require('redis'); // Correct import

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

(async () => {
  await client.connect(); // Must connect before use
})();

module.exports = client;