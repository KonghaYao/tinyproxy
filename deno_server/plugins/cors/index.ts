import { Context, ServerPlugin } from "../../src/index.ts";
import vary from "https://esm.sh/vary@1.1.2";
export const cors: ServerPlugin<
    Partial<{
        exposeHeaders: string | string[];
        allowMethods: string[] | string;
        allowHeaders: string[] | string;
        keepHeadersOnError: boolean | undefined;
        origin: string | ((ctx: Context) => string);
        credentials: ((ctx: Context) => boolean) | true;
        secureContext: string | boolean;
        maxAge: string;
        privateNetworkAccess: string;
    }>
> = (options) => {
    const defaults = {
        allowMethods: "GET,HEAD,PUT,POST,DELETE,PATCH",
        secureContext: false,
    };

    options = {
        ...defaults,
        ...options,
    };

    if (Array.isArray(options.exposeHeaders)) {
        options.exposeHeaders = options.exposeHeaders.join(",");
    }

    if (Array.isArray(options.allowMethods)) {
        options.allowMethods = options.allowMethods.join(",");
    }

    if (Array.isArray(options.allowHeaders)) {
        options.allowHeaders = options.allowHeaders.join(",");
    }

    options.keepHeadersOnError =
        options.keepHeadersOnError === undefined ||
        !!options.keepHeadersOnError;

    return async function cors(ctx, next) {
        // If the Origin header is not present terminate this set of steps.
        // The request is outside the scope of this specification.
        const requestOrigin = ctx.get("Origin");

        // Always set Vary header
        // https://github.com/rs/cors/issues/10
        ctx.set("vary", "Origin");

        let origin;
        if (typeof options.origin === "function") {
            origin = await options.origin(ctx);
            if (!origin) return await next();
        } else {
            origin = options.origin || requestOrigin;
        }

        let credentials;
        if (typeof options.credentials === "function") {
            credentials = await options.credentials(ctx);
        } else {
            credentials = !!options.credentials;
        }

        if (credentials && origin === "*") {
            origin = requestOrigin;
        }

        const headersSet: Record<string, string | null> = {};

        function set(key: string, value: string | null) {
            ctx.set(key, value);
            headersSet[key] = value;
        }

        if (ctx.method !== "OPTIONS") {
            // Simple Cross-Origin Request, Actual Request, and Redirects
            set("Access-Control-Allow-Origin", origin);

            if (credentials === true) {
                set("Access-Control-Allow-Credentials", "true");
            }

            if (options.exposeHeaders) {
                set(
                    "Access-Control-Expose-Headers",
                    options.exposeHeaders as string
                );
            }

            if (options.secureContext) {
                set("Cross-Origin-Opener-Policy", "same-origin");
                set("Cross-Origin-Embedder-Policy", "require-corp");
            }

            if (!options.keepHeadersOnError) {
                return await next();
            }
            try {
                return await next();
            } catch (err) {
                const errHeadersSet = err.headers || {};
                const varyWithOrigin = vary.append(
                    errHeadersSet.vary || errHeadersSet.Vary || "",
                    "Origin"
                );
                delete errHeadersSet.Vary;

                err.headers = {
                    ...errHeadersSet,
                    ...headersSet,
                    ...{ vary: varyWithOrigin },
                };
                throw err;
            }
        } else {
            // Preflight Request

            // If there is no Access-Control-Request-Method header or if parsing failed,
            // do not set any additional headers and terminate this set of steps.
            // The request is outside the scope of this specification.
            // console.log(ctx, ctx.get("Access-Control-Request-Method"));
            if (!ctx.get("Access-Control-Request-Method")) {
                // this not preflight request, ignore it
                return await next();
            }

            ctx.set("Access-Control-Allow-Origin", origin);

            if (credentials === true) {
                ctx.set("Access-Control-Allow-Credentials", "true");
            }

            if (options.maxAge) {
                ctx.set("Access-Control-Max-Age", options.maxAge);
            }

            if (
                options.privateNetworkAccess &&
                ctx.get("Access-Control-Request-Private-Network")
            ) {
                ctx.set("Access-Control-Allow-Private-Network", "true");
            }

            if (options.allowMethods) {
                ctx.set(
                    "Access-Control-Allow-Methods",
                    options.allowMethods as string
                );
            }

            if (options.secureContext) {
                set("Cross-Origin-Opener-Policy", "same-origin");
                set("Cross-Origin-Embedder-Policy", "require-corp");
            }

            let allowHeaders = options.allowHeaders as string | null;
            if (!allowHeaders) {
                allowHeaders = ctx.get("Access-Control-Request-Headers");
            }
            if (allowHeaders) {
                ctx.set("Access-Control-Allow-Headers", allowHeaders);
            }

            ctx.status = 204;
        }
    };
};
