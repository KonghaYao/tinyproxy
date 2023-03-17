import { assignHeaders, cloneHeaders } from "./utils/cloneHeaders.ts";
export class ServerResponse extends Response {
    constructor(...args: [body?: BodyInit | null, init?: ResponseInit]) {
        super(...args);
        const it = new Response(args[0], args[1]);
        this.body = it.body;
        this.type = it.type;
        this.headers = cloneHeaders(it.headers);
    }
    static cloneFrom(res: Response) {
        return new ServerResponse(res.body, res);
    }
    static assignResponse(res0: Response, res1: Response) {
        return new ServerResponse(res1.body ?? res0.body, {
            ...res0,
            ...res1,
            headers: assignHeaders(
                cloneHeaders(res0.headers),
                res1.headers,
                true
            ),
        });
    }
    headers: Headers;
    status = 200;
    statusText = "";
    type: ResponseType;

    private _body: ReadableStream<Uint8Array> | null = null;

    /** @ts-ignore */
    get body() {
        return this._body;
    }
    /** @ts-ignore */
    set body(input: ReadableStream<Uint8Array> | null) {
        this._body = input;
    }
    setBody(bodyInput: BodyInit | null) {
        const it = new Response(bodyInput);
        this._body = it.body;
        this.type = it.type;
    }
}
