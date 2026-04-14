// Utility functions to handle Database Compaction and Parallel Write edge-cases

/**
 * Executes a database write operation safely by catching compaction/lock errors
 * and retrying with exponential backoff.
 * 
 * @param {Function} fn - The asynchronous function to execute
 * @param {number} retries - Number of retry attempts (default: 3)
 * @param {number} delay - Base delay in milliseconds (default: 100)
 */
export async function safeWrite(fn, retries = 3, delay = 100) {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, delay));
      return safeWrite(fn, retries - 1, delay * 2); // Exponential backoff
    }
    throw err;
  }
}

/**
 * Executes a database read operation safely by catching lock errors
 * and retrying. Useful in high-concurrency environments like Next.js Server Components.
 * 
 * @param {Function} fn - The asynchronous function to execute
 * @param {number} retries - Number of retry attempts (default: 3)
 * @param {number} delay - Base delay in milliseconds (default: 50)
 */
export async function safeQuery(fn, retries = 3, delay = 50) {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, delay));
      return safeQuery(fn, retries - 1, delay * 2); // Exponential backoff
    }
    throw err;
  }
}
