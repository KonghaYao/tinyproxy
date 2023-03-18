import { match } from "https://esm.sh/path-to-regexp@6.2.1";
import compose from "https://esm.sh/koa-compose@4.1.0";
import { cloneHeaders } from "./utils/cloneHeaders.ts";
import { ServerResponse } from "./ServerResponse.ts";
import { Context } from "./createContext.ts";

export { cloneHeaders, Context };

export type MatchedPath<T = Record<string, unknown>> = {
    path: string;
    index: number;
    params: T;
};

export type ServerPlugin<Config> = (config: Config) => Middleware;
export type HandlePlugin<Config> = (config: Config) => Handle;
export interface Handle {
    (req: Request): Response | Promise<Response> | void | Promise<void>;
}
export type HandleArray = [...Middleware[], Handle];
export type Middleware = compose.Middleware<Context>;

/** 服务数组的最后一项为 Handle，直接处理 Response */
export const HandleToMiddleware: ServerPlugin<{ handle: Handle }> =
    ({ handle }) =>
    async (ctx, next) => {
        const res = await handle(ctx.req);
        // 提前结束
        if (!res) {
            /** @ts-ignore */
            ctx.res = null;
            return next();
        }
        // console.log(ctx.res);
        ctx.res = ServerResponse.assignResponse(ctx.res, res);
        // console.log(res);
        return next();
    };

export type RouterEntry = [string | string[], Handle | HandleArray];
export type ServerInit = Record<string, Handle | HandleArray> | ServerEntries;
export type ServerEntries = RouterEntry[];
export const createServer = (
    config: ServerInit,
    opts: Partial<{
        plugins: Middleware[];
    }> = {}
) => {
    type Entry = [string, Handle | HandleArray];
    const entries: Entry[] =
        config instanceof Array
            ? config.flatMap(([key, val]) => {
                  if (key instanceof Array) {
                      return key.map((i) => [i, val] as Entry);
                  } else {
                      return [[key, val] as Entry];
                  }
              })
            : Object.entries(config);
    const handlesArr: ((ctx: Context) => Handle)[] = entries.map(([key, h]) => {
        let getParams: (str: string) => boolean;
        try {
            // deno-lint-ignore no-explicit-any
            getParams = match(key, { decode: decodeURIComponent }) as any;
        } catch (e) {
            console.error(e);
            throw new Error(`path regexp compile error: ${key}`);
        }
        const obj = h instanceof Function ? ([h] as HandleArray) : h;
        const handle = obj[obj.length - 1] as Handle;
        const middleware = obj.slice(0, obj.length - 1) as Middleware[];

        const composedFunc = compose([
            ...(opts?.plugins ?? []),
            ...middleware,
            HandleToMiddleware({ handle }),
        ]);
        return (ctx) => (req) =>
            new Promise<Response>((resolve) => {
                const matched = getParams(
                    new URL(req.url).pathname
                ) as unknown as MatchedPath;
                // console.log(matched);

                if (matched) {
                    ctx._setPathParams(matched);
                    // const ctx = createContext(req);
                    composedFunc(ctx).then(() => {
                        resolve(ctx.res!);
                    });
                } else {
                    /** @ts-ignore */
                    resolve(null);
                }
            });
    });
    return async (...args: Parameters<Handle>): Promise<Response> => {
        try {
            for (const iterator of handlesArr) {
                const ctx = new Context(args[0]);
                const res = await iterator(ctx)(...args);

                if (res instanceof Response) return res;
            }
        } catch (e) {
            console.error(e);
        }
        return new ServerResponse(null, {
            status: 404,
            statusText: "Deno not found",
        });
    };
};
