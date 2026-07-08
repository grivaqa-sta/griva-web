/**
 * Simple In-Memory Cache Utility
 * Saves database query results and serves them instantly for subsequent requests.
 * Prevents database connection pool exhaustion under high traffic load.
 */

const cacheStore = new Map();

/**
 * Get cached item if it exists and is not expired
 * @param {string} key 
 * @returns {any|null}
 */
const get = (key) => {
  const item = cacheStore.get(key);
  if (!item) return null;

  if (Date.now() > item.expiry) {
    cacheStore.delete(key);
    return null;
  }

  return item.value;
};

/**
 * Save item in cache
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttlMs Time to live in milliseconds (default 5 minutes)
 */
const set = (key, value, ttlMs = 300000) => {
  cacheStore.set(key, {
    value,
    expiry: Date.now() + ttlMs,
  });
};

/**
 * Clear all cache entries (e.g., when an admin modifies catalog)
 */
const clear = () => {
  cacheStore.clear();
  console.log("🧹 [CACHE]: In-memory cache cleared successfully.");
};

/**
 * Delete a specific key from cache
 * @param {string} key 
 */
const deleteKey = (key) => {
  cacheStore.delete(key);
};

module.exports = {
  get,
  set,
  clear,
  deleteKey,
};
