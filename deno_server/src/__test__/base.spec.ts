import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
// import { cors } from "../../plugins/cors/index.ts";
import { createServer, Middleware } from "../index.ts";
import { cors, logger } from "../plugins.ts";
const server = createServer(
    {
        "/": () => {
            return new Response("null");
        },
        "/get/(.*)": [
            cors({
                origin: "*",
            }) as unknown as Middleware,

            () => {
                return new Response("get");
            },
        ],
        "/get/info": () => undefined,
    },
    { plugins: [logger({})] }
);
const baseURL = (path: string, init?: RequestInit) => {
    return new Request("https://example.com" + path, init);
};
Deno.test(async function normal() {
    const data = await server(baseURL("/")).then((res) => res.text());
    assertEquals(data, "null");
});
Deno.test(async function middlewareTest() {
    const data = await server(baseURL("/get/"));
    assertEquals(data.headers.get("access-control-allow-origin"), "*");
});
Deno.test(async function middlewareTest() {
    const data = await server(baseURL("/get/info")).then((res) => res.text());
    assertEquals(data, "get");
});
