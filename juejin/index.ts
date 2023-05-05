
function getToken() {
    return fetch("https://api.juejin.cn/user_api/v1/sys/token", {
        "headers": {
            "accept": "*/*",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            "sec-ch-ua": `\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"`,
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "x-secsdk-csrf-request": "1",
            "x-secsdk-csrf-version": "1.2.10",
            "Referer": "https://juejin.cn/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "HEAD"
    }).then(res => res.headers).then(res => {
        console.log('token 头部信息',res)
        return {
            id: res.get('X-Tt-Logid'),
            token: res.get('X-Ware-Csrf-Token')?.split(',')[1]
        }
    })
}
globalThis.store = await getToken()

function getPage(index:number) {
    const message = {
        "id_type": 2,
        "client_type": 2608,
        "sort_type": 300,
        // 这个用于无限加载中指定位置
        "cursor": btoa(
            `{"v":"7229388804611932217","i":${index*20}}`
        ),
        "limit": 20
    }
    // aid 好像是标记查询方式的
    // spider 标记自己是爬虫
    // uuid 字段好像不太重要，没有也可以
    return fetch("https://api.juejin.cn/recommend_api/v1/article/recommend_all_feed?aid=2608&spider=1", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0",
            "Accept": "*/*",
            "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
            "Content-Type": "application/json",
            "x-secsdk-csrf-token": globalThis.store.token,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site"
        },
        "referrer": "https://juejin.cn/",
        "body": JSON.stringify(message),
        "method": "POST",
    }).then(res=>res.json())
}

async function main(){
    let index= 0//大致到 18000
    let keep=true
    while(keep){
        const data = await getPage(index)
        keep = data.has_more
        // 每100份进行存储
        await Deno.writeTextFile(`./data/index_${Math.floor(index/100)}.jsonl`,JSON.stringify(data)+'\n',{append:true})
        index++
        if(index%10===0) console.log(index)
    }
}
main()

