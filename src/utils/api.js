// Improved api.js with better error handling, retry logic, timeout, and logging

// =====================
// Custom Error Classes
// =====================
class RateLimitError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'RateLimitError';
    this.status = status;
  }
}

class ServerError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ServerError';
    this.status = status;
  }
}

class ClientError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ClientError';
    this.status = status;
  }
}

// =====================
// Utility Functions
// =====================
const delay = (retryCount) => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
  const randomization = Math.random() * 1000; // Add up to 1 second of random jitter
  return exponentialDelay + randomization;
};

const parseErrorResponse = async (response) => {
  try {
    const errorData = await response.json();
    return errorData.error || 'Unknown error';
  } catch {
    return 'Failed to parse error response';
  }
};

const fetchWithTimeout = async (url, options, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
};

// =====================
// Fetch with Retry
// =====================
/**
 * Fetch with retry and exponential backoff
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {Function} shouldRetry - Function to determine if error is retryable
 * @param {number} timeout - Timeout in ms (default: 10000)
 * @returns {Promise<Response>} - The fetch response
 */
const fetchWithRetry = async (url, options = {}, maxRetries = 3, shouldRetry = (error) => !error.status || (error.status >= 500 && error.status < 600), timeout = 10000) => {
  let lastError;
  for (let retryCount = 0; retryCount <= maxRetries; retryCount++) {
    try {
      const response = await fetchWithTimeout(url, options, timeout);

      if (response.status === 429) {
        const message = await parseErrorResponse(response);
        throw new RateLimitError(message, response.status);
      }

      if (response.status >= 400 && response.status < 500) {
        const message = await parseErrorResponse(response);
        throw new ClientError(message, response.status);
      }

      if (!response.ok) {
        const message = await parseErrorResponse(response);
        throw new ServerError(message, response.status);
      }

      return response;
    } catch (error) {
      lastError = error;
      if (retryCount === maxRetries || !shouldRetry(error)) {
        break;
      }
      console.info(`[${new Date().toISOString()}] Retrying request (${retryCount + 1}/${maxRetries}) after error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay(retryCount)));
    }
  }
  throw lastError;
};

// =====================
// Handle Response
// =====================
const handleResponse = async (response) => {
  return response.json();
};

// =====================
// Exported Function
// =====================
export const fetchWithRateLimit = async (url, options = {}) => {
  try {
    const response = await fetchWithRetry(url, options);
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof RateLimitError) {
      console.error('Rate limit exceeded:', error.message);
    } else {
      console.error('Request failed:', error.message);
    }
    throw error;
  }
};
