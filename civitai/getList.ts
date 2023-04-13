// 爬取模型列表
const getModelList = (cursor: null | number = null) => {
    return fetch(
        `https://civitai.com/api/trpc/model.getAll?input=%7B%22json%22%3A%7B%22limit%22%3A100%2C%22sort%22%3A%22Most%20Downloaded%22%2C%22period%22%3A%22AllTime%22%2C%22authed%22%3Atrue%2C%22favorites%22%3Afalse%2C%22hidden%22%3Afalse%2C%22cursor%22%3A${cursor}%7D%2C%22meta%22%3A%7B%22values%22%3A%7B%22cursor%22%3A%5B%22${
            cursor === null ? "undefined" : "bigint"
        }%22%5D%7D%7D%7D`,
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
                referer: "https://civitai.com/",
                "user-agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
            },
        }
    ).then((res) => res.json());
};

const getIndex = async (cursor: number | null = null) => {
    let end = false;

    while (!end) {
        const data = await getModelList(cursor);
        console.log(data);
        const next = data?.result?.data?.json?.nextCursor;
        if (typeof next !== "number") end = true;
        console.log("=>", next, data.result.data.json.items.length);
        cursor = parseInt(next);
        await Deno.writeTextFile(
            `./index/index.jsonl`,
            data.result.data.json.items
                .map((i: any) => JSON.stringify(i))
                .join("\n") + "\n",
            {
                append: true,
            }
        );
    }
};
getIndex();
