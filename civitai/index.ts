// 爬取模型下面的 Gallery 列表
const getGalleryFromModel = (modelId: number, cursor: null | number = null) => {
    return fetch(
        "https://civitai.com/api/trpc/image.getImagesAsPostsInfinite?input=" +
            encodeURIComponent(
                JSON.stringify({
                    json: {
                        period: "AllTime",
                        authed: true,
                        sort: "Most Reactions",
                        modelId: modelId,
                        limit: 50,
                        cursor: cursor,
                    },
                    meta: {
                        values: {
                            cursor: [cursor === null ? "undefined" : "bigint"],
                        },
                    },
                })
            ),
        {
            headers: {
                accept: "*/*",
                "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                "content-type": "application/json",
                "sec-ch-ua":
                    '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                referer: "https://civitai.com/models/4823/deliberate",
                "user-agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
            },
        }
    ).then((res) => res.json());
};

const getPostUnderModel = async (
    modelId: number,
    cursor: number | null = null
) => {
    let end = false;
    while (!end) {
        const data = await getGalleryFromModel(modelId, cursor);
        const next = data?.result?.data?.json?.nextCursor;
        if (typeof next !== "string") end = true;
        console.log(modelId, "=>", next, data.result.data.json.items.length);
        cursor = parseInt(next);
        await Deno.writeTextFile(
            `./data/${modelId}.jsonl`,
            data.result.data.json.items
                .map((i: any) => JSON.stringify(i))
                .join("\n") + "\n",
            {
                append: true,
            }
        );
    }
};

const text = await Deno.readTextFile("./index/index.filter.jsonl");
const array = text.split("\n");

// 修改 cursor 和 index 可以进行断点重传
let cursor: null | number = 1991;
for (let index = 0; index < array.length; index++) {
    const element = array[index];
    console.log(index);
    await getPostUnderModel(JSON.parse(element).id, cursor);
    cursor = null;
}
