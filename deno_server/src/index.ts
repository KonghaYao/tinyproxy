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
export type Context = ReturnType<typeof createContext>;
export type Middleware = compose.Middleware<Context>;

const HandleToMiddleware: ServerPlugin<{ handle: Handle }> =
    ({ handle }) =>
    async (ctx, next) => {
        const res = await handle(ctx.req);
        // console.log(ctx.res);
        ctx.res = ServerResponse.assignResponse(ctx.res, res);
        // console.log(res);
        return next();
    };

const createContext = (req: Request) => {
    return {
        req,
        res: new Response(null, {
            status: 404,
            statusText: "It's an error of deno-server",
        }),
        get(name: string) {
            return this.req.headers.get(name);
        },
        set(name: string, value: string | null) {
            if (!this.res)
                throw new Error("'res' can't be found on server context");
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
        vary(str: string) {
            this.res.headers.set("vary", str);
        },
        get status() {
            return this.res?.status!;
        },
    };
};
export const createServer = (config: Record<string, Handle | HandleObj>) => {
    const handlesArr: ((ctx: Context) => Handle)[] = Object.entries(config).map(
        ([key, h]) => {
            const regexp = pathToRegexp(key);
            const obj = h instanceof Function ? ([h] as HandleObj) : h;
            const handle = obj[obj.length - 1] as Handle;
            const middlewares = obj.slice(0, obj.length - 1) as Middleware[];

            const composedFunc = compose([
                ...middlewares,
                HandleToMiddleware({ handle }),
            ]);
            return (ctx) => (req) =>
                new Promise<Response>((resolve) => {
                    const matched = regexp.exec(new URL(req.url).pathname);
                    if (matched) {
                        // const ctx = createContext(req);
                        composedFunc(ctx).then(() => {
                            resolve(ctx.res!);
                        });
                    } else {
                        /** @ts-ignore */
                        resolve(null);
                    }
                });
        }
    );
    return async (...args: Parameters<Handle>): Promise<Response> => {
        const ctx = createContext(args[0]);
        for (const iterator of handlesArr) {
            const res = await iterator(ctx)(...args);

            if (res instanceof Response) return res;
        }
        return ctx.res;
    };
};
