# Civitai 爬取项目

> 我使用 deno 写的爬虫，不支持并发，按顺序单线程爬取（不要在峰值时刻爬取，速度非常慢。。。😂），支持手动断点 😂

1. 爬取所有模型列表：getList.ts
2. 爬取模型下面所有的 Gallery 信息：index.ts

数据标记：

1. index/index.jsonl 是爬取模型列表
2. index/index.filter.jsonl 是去重后的爬取模型列表
3. data 文件夹是模型下的 Gallery 列表，名称为 模型 id 对应文件
