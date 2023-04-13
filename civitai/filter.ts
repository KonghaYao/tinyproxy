const text = await Deno.readTextFile("./index/index.jsonl");
const map = new Map();

for (const iterator of text.split("\n")) {
    if (iterator) {
        map.set(JSON.parse(iterator).id, iterator);
    }
}
console.log(text.split("\n").length, map.size);
Deno.writeTextFile("./index/index.filter.jsonl", [...map.values()].join("\n"));
