import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { proxy } from "../index.ts";
import { createServer } from "../../../index.ts";
import { logger } from "../../logger/index.ts";

const server = createServer(
    {
        "/bin/(.*)": [
            proxy({
                host: "httpbin.org",
                rewrite(path) {
                    // console.log(path);
                    return path.replace("/bin", "");
                },
            }),
        ],
    },
    { plugins: [logger({})] }
);
const baseURL = (path: string, init?: RequestInit) => {
    return new Request("https://example.com" + path, init);
};
Deno.test(async function normal() {
    const data = await server(baseURL("/bin/get?a=2023")).then((res) => {
        // console.log(res);
        return res.json();
    });
    assertEquals(data.args, { a: "2023" });
});
