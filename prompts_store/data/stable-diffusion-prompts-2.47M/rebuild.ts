import { readline } from "https://deno.land/x/readline@v1.1.0/mod.ts";

const f = await Deno.open("./all_prompts.txt");
for await (const line of readline(f)) {
    let i = new TextDecoder().decode(line);
    if (i) {
        let row: string;
        try {
            row = JSON.parse(i);
        } catch (e) {
            row = i;
        }

        if (row.length > 88)
            await Deno.writeTextFile(
                "./temp/text.jsonl",
                JSON.stringify(row) + "\n",
                { append: true }
            );
    }
}
f.close();
