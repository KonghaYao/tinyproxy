// 这是全局对data 文件夹下的项目成果进行 filter 的函数
const dir = Deno.readDir("./data/");
for await (const i of dir) {
}
