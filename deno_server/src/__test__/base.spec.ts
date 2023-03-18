import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
// import { cors } from "../../plugins/cors/index.ts";
import { createServer, HandleArray, Middleware } from "../index.ts";
import { cors, logger } from "../plugins.ts";
const server = createServer(
    [
        ["/get/info", () => undefined],
        [
            ["/get/(.*)", "/get"],
            [
                cors({
                    origin: "*",
                }) as unknown as Middleware,

                (req: Request) => {
                    console.log(req.url);
                    return new Response("get");
                },
            ] as HandleArray,
        ],
        [
            "/",
            () => {
                return new Response("null");
            },
        ],
    ],

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
    const data1 = await server(baseURL("/get"));
    assertEquals(data1.headers.get("access-control-allow-origin"), "*");
});
Deno.test(async function middlewareTest() {
    const data = await server(baseURL("/get/info")).then((res) => {
        // console.log(res);
        return res.text();
    });
    assertEquals(data, "get");
});
