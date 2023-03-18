import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createServer } from "https://esm.sh/deno-server@1.1.0/src/index.ts";
import {
    cors,
    proxy,
    logger,
} from "https://esm.sh/deno-server@1.1.0/src/plugins.ts";
serve(
    createServer(
        {
            // 全站代理
            "/(.*)": proxy({ host: "nitter.it" }),
        },
        {
            plugins: [
                logger({}),
                cors({
                    origin: "*",
                }),
            ],
        }
    )
);
