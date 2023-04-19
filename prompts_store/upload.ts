import postgres from "https://deno.land/x/postgresjs/mod.js";
const url = "";
const sql = postgres(url + "?sslmode=require");
import { readline } from "https://deno.land/x/readline@v1.1.0/mod.ts";

// 这里修改对应的 位置即可上传
const f = await Deno.open(
    "./data/stable-diffusion-prompts-2.47M/temp/text.jsonl"
);
const typeCode = 1; // 0 midjourney 1 stable diffusion

let index = 0;
let cache = [];
for await (const line of readline(f)) {
    index++;
    let i = new TextDecoder().decode(line);
    if (!i) continue;
    cache.push(i);

    if (cache.length % 1000 === 0) {
        try {
            await sql`
            insert into prompts ${sql(
                cache.map((i) => ({ prompt: i, type: typeCode })),
                "prompt",
                "type"
            )}
                `;
        } catch (e) {
            console.log(index, e);
        }
        cache = [];
    }
    if (index % 10000 === 0) console.log(index);
}
