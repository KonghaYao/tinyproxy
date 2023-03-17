import { pathToRegexp } from "https://esm.sh/path-to-regexp@6.2.1";
import compose from "https://esm.sh/koa-compose@4.1.0";
export interface Handle {
    (req: Request): Response | Promise<Response>;
}
export type HandleObj = [Middleware[], Handle];
interface Context {
    req: Request;
    res?: Response;
}
export type Middleware = compose.Middleware<Context>;

export const createServer = (config: Record<string, Handle | HandleObj>) => {
    const handlesArr: Handle[] = Object.entries(config).map(([key, h]) => {
        const regexp = pathToRegexp(key);
        const obj = h instanceof Function ? ([[], h] as HandleObj) : h;
        const final: Middleware = async (ctx, next) => {
            const res = await obj[1](ctx.req);
            ctx.res = res;
            return next();
        };
        const composedFunc = compose([...obj[0], final]);
        return (req) =>
            new Promise<Response>((res) => {
                const matched = regexp.exec(new URL(req.url).pathname);

                if (matched) {
                    const ctx: Context = {
                        req,
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

            if (res instanceof Response) {
                return res;
            }
        }
        return new Response(null, { status: 404 });
    };
};
