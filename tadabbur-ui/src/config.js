let apiBaseUrl = process.env.REACT_APP_API_URL || 'https://tadabbur-api.onrender.com';

// Clean trailing slash
apiBaseUrl = apiBaseUrl.replace(/\/+$/, '');

// Prevent Mixed Content errors in production: upgrade http to https (unless localhost/127.0.0.1)
if (
  window.location.protocol === 'https:' &&
  apiBaseUrl.startsWith('http://') &&
  !apiBaseUrl.includes('localhost') &&
  !apiBaseUrl.includes('127.0.0.1')
) {
  apiBaseUrl = apiBaseUrl.replace('http://', 'https://');
}

export const API_BASE = apiBaseUrl;
