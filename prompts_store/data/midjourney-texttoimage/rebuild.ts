const data = await Deno.readTextFile("./temp/mid.jsonl");
for (let i of data.split("\n")) {
    if (i) {
        const row = JSON.parse(i);
        const res = row.match(/(?<=\*\*)(.*)(?=\*\*)/);
        if (!res || !res[0]) continue;
        const text = res[0].replace(/\<(.*)\>/, "");
        if (text.length > 88)
            await Deno.writeTextFile(
                "./temp/text.jsonl",
                JSON.stringify(text) + "\n",
                { append: true }
            );
    }
}
