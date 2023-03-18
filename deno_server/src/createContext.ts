import { parse } from "https://esm.sh/qs";
import { MatchedPath } from "./index.ts";
import { ServerResponse } from "./ServerResponse.ts";
import Cookies from "https://esm.sh/cookies@0.8.0";
const COOKIES = Symbol("context#cookies");
export class Context {
    constructor(public req: Request) {}
    res = new ServerResponse(null, {
        status: 404,
        statusText: "It's an error of deno-server",
    });
    get request() {
        return this.req;
    }
    get(name: string) {
        return this.req.headers.get(name);
    }
    set(name: string, value: string | null) {
        if (!this.res)
            throw new Error("'res' can't be found on server context");
        return this.res?.headers.set(name, value as string);
    }
    get method() {
        return this.req.method;
    }
    set status(num: number) {
        if (this.res?.status) {
            // @ts-ignore ignore: 头部可以被改写
            this.res.status = num;
        }
    }
    vary(str: string) {
        this.res.headers.set("vary", str);
    }
    // deno-lint-ignore adjacent-overload-signatures
    get status() {
        return this.res?.status!;
    }

    // 路由解析的参数
    protected path = "";
    // deno-lint-ignore no-explicit-any
    protected params: any;
    _setPathParams(matched: MatchedPath) {
        matched;
        this.path = matched.path;
        this.params = matched.params;
    }
    get query() {
        return parse(new URL(this.req.url).search.replace("?", ""));
    }
    set body(body: BodyInit) {
        this.res.setBody(body);
    }
    throw(status: number, statusText: string, opts?: ResponseInit) {
        this.res = new ServerResponse(null, { status, statusText, ...opts });
    }

    [COOKIES]!: Cookies;
    get cookies() {
        if (!this[COOKIES]) {
            // Cookie 的写入未解决
            // this[COOKIES] = new Cookies(this.req as any, this.res, {
            //     keys: this.app.keys,
            //     secure: this.request.secure,
            // });
        }
        return this[COOKIES];
    }

    set cookies(_cookies) {
        this[COOKIES] = _cookies;
    }
}
