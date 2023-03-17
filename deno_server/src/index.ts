import { pathToRegexp } from "https://esm.sh/path-to-regexp@6.2.1";
import compose from "https://esm.sh/koa-compose@4.1.0";
import { cloneHeaders } from "./utils/cloneHeaders.ts";
import { ServerResponse } from "./ServerResponse.ts";
export { cloneHeaders };
export type ServerPlugin<Config> = (config: Config) => Middleware;
export interface Handle {
    (req: Request): Response | Promise<Response>;
}
export type HandleObj = [...Middleware[], Handle];
export interface Context {
    req: Request;
    get: (name: string) => string | null;
    set: (name: string, val: string | null) => void;
    res?: Response;
    readonly method: string;
    status: number;
}
export type Middleware = compose.Middleware<Context>;

export const createServer = (config: Record<string, Handle | HandleObj>) => {
    const handlesArr: Handle[] = Object.entries(config).map(([key, h]) => {
        const regexp = pathToRegexp(key);
        const obj = h instanceof Function ? ([h] as HandleObj) : h;
        const handle = obj[obj.length - 1] as Handle;
        const middlewares = obj.slice(0, obj.length - 1) as Middleware[];
        const final: Middleware = async (ctx, next) => {
            const res = await handle(ctx.req);
            ctx.res = ServerResponse.cloneFrom(res);

            return next();
        };
        // console.log(handle, middlewares);
        const composedFunc = compose([...middlewares, final]);
        return (req) =>
            new Promise<Response>((res) => {
                const matched = regexp.exec(new URL(req.url).pathname);

                if (matched) {
                    const ctx: Context = {
                        req,
                        get(name) {
                            return this.req.headers.get(name);
                        },
                        set(name, value) {
                            return this.res?.headers.set(name, value as string);
                        },
                        get method() {
                            return this.req.method;
                        },
                        set status(num: number) {
                            if (this.res?.status) {
                                // @ts-ignore ignore: 头部可以被改写
                                this.res.status = num;
                            }
                        },
                        get status() {
                            return this.res?.status!;
                        },
                    };
                    composedFunc(ctx).then(() => {
                        res(ctx.res!);
                    });
                } else {
                    /** @ts-ignore */
                    res(null);
                }
            });
    });
    return async (...args: Parameters<Handle>): Promise<Response> => {
        for (const iterator of handlesArr) {
            const res = await iterator(...args);

            if (res instanceof Response) return res;
        }
        return new Response(null, {
            status: 404,
            statusText: "It's an error of deno-server",
        });
    };
};
