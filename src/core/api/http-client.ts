/**
 * Core HTTP Client for API communication.
 * Infrastructure layer — not business domain specific.
 */

export type { HttpClientConfig, HttpOptions, HttpResponse } from './types';
export { createHttpClient } from './http-client.impl';
