# deno-server

It's a very easy plugin to create a server in Deno

```ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
    createServer,
    middleware,
} from "https://esm.sh/deno-server/src/index.ts";
import cors from "https://esm.sh/@koa/cors@4.0.0"; // some koa plugin can just to use in the system
const S = createServer({
    "/": () => {
        return new Response("null");
    },
    "/get": [
        cors({
            origin: "*",
        }) as unknown as Middleware,
        // the final function to create the response, above functions are plugins
        () => {
            return new Response("get");
        },
    ],
});

serve(S);
```
