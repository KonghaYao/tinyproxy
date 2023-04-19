const allMap = new Map();
for await (const i of Deno.readDir("./data")) {
    const file = await Deno.readTextFile("./data/" + i.name);
    file.split("\n").forEach((i) => {
        if (i) {
            const { postId } = JSON.parse(i);
            allMap.set(postId, i);
        }
    });
}
for await (const i of allMap.values()) {
    await Deno.writeTextFile("./index/info.jsonl", i + "\n", { append: true });
}
