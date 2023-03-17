import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { cors } from "../../plugins/cors/index.ts";
import { createServer } from "../index.ts";

const server = createServer({
    "/": () => {
        return new Response("null");
    },
    "/get": [
        cors({
            origin: "*",
        }),

        () => {
            console.log("进入2");
            return new Response("get");
        },
    ],
});
const baseURL = (path: string) => {
    return new Request("https://example.com" + path);
};
Deno.test(async function normal() {
    const data = await server(baseURL("/")).then((res) => res.text());
    assertEquals(data, "null");
});
Deno.test(async function middlewareTest() {
    const data = await server(baseURL("/get"));
    console.log([...data.headers.entries()]);
    assertEquals(data.headers.get("access-allow-control-origin"), "*");
});
