import { ServerPlugin } from "../../index.ts";
import chalk from "https://deno.land/x/chalkin@v0.1.3/mod.ts";

export const logStatus = (code: number) => {
    if (code >= 500) {
        return chalk.white.bgRed(code);
    } else if (code >= 400) {
        return chalk.white.bgRedBright(code);
    } else if (code >= 300) {
        return chalk.white.bgYellow(code);
    } else if (code >= 200) {
        return chalk.white.bgGreen(code);
    } else {
        return chalk.white.bgBlack(code);
    }
};
export const logMethod = (str: string) => {
    switch (str.toUpperCase()) {
        case "POST":
            return chalk.green(str);
        case "DELETE":
            return chalk.red(str);
        case "OPTIONS":
            return chalk.yellow(str);
        case "PATCH":
            return chalk.cyan(str);
        case "HEAD":
            return chalk.magenta(str);
        case "PUT":
            return chalk.yellow(str);
        default:
            return chalk.blue(str);
    }
};
export const logger: ServerPlugin<{}> = (opt) => {
    return async (ctx, next) => {
        console.log(
            chalk.bold(
                `==>  `,
                chalk.blue(ctx.req.url),
                logMethod(ctx.req.method)
            )
        );
        console.log(ctx);
        await next();
        console.log(
            chalk.bold(
                `<==  `,
                chalk.blue(ctx.req.url),
                logMethod(ctx.req.method),
                logStatus(ctx.status)
            )
        );
    };
};
