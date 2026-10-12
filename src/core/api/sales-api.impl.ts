import { createHttpClient, type HttpClient } from "./http-client.impl";

const SALES_API_BASE_PATH = "/api/sales";
const client = createHttpClient(SALES_API_BASE_PATH);

export const salesApi: HttpClient = client;
