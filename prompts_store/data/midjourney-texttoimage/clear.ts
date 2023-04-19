// 从 json 中抽取文本，并放置在 temp/mid.jsonl 中
const files = Deno.readDir("./.data");
for await (const iterator of files) {
    const text = await Deno.readTextFile("./.data/" + iterator.name);
    const json = await JSON.parse(text);
    const data = json.messages
        .flatMap((i: any) => i.flatMap((ii: any) => ii.content))
        .map((i: any) => JSON.stringify(i));

    await Deno.writeTextFile("./temp/mid.jsonl", data.join("\n") + "\n", {
        append: true,
    });
}
