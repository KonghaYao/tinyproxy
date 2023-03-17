import { cloneHeaders } from "./utils/cloneHeaders.ts";
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
    headers: Headers;
    status = 200;
    statusText = "";
    type: ResponseType;

    body: ReadableStream<Uint8Array> | null;

    setBody(bodyInput: BodyInit | null) {
        const it = new Response(bodyInput);
        this.body = it.body;
        this.type = it.type;
    }
}
