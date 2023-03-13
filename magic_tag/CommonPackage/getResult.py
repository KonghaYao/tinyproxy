import paddle
import datetime


def getResult(inputs, config, poetry, vocab, tokenizer):
    start_time = datetime.datetime.now()   # 记录开始时间
    results = tokenizer.convert_tokens_to_ids(
        tokenizer.tokenize(inputs['inputs']))

    t_t = 15

    if (inputs['threshold']):
        t_t = inputs['threshold']

    memory = 5
    if (inputs['memory']):
        t_t = inputs['memory']

    # 生成的大致次数
    runtime = inputs['times']
    input = paddle.to_tensor(vocab("<CLS>")).reshape([1, 1])
    hidden = None

    # 开始真正生成诗句
    # 否则，input就是风格前缀的最后一个词语，hidden也是生成出来的
    all = [i for i in results]
    for i in all:
        output, hidden = poetry(input, hidden)
        input = paddle.to_tensor(i).reshape([1, 1])

    for i in range(runtime - len(results)):
        output, hidden = poetry(input, hidden)

        _, top_indexes = paddle.topk(output[0], k=t_t)
        checked = False

        for top_index in top_indexes.numpy():
            if top_index == vocab('<SEP>'):
                continue
            if top_index in all:
                continue
            # 只有不是前面出现过的单词的概率会大，所以搞个排除法
            all.append(top_index)
            if (len(all) > memory):
                all = all[(len(all) - memory):]

            results.append(top_index)
            input = paddle.to_tensor(top_index).reshape([1, 1])
            checked = True
            break
        # 如果没有，那么直接送第一个
        if checked == False:
            # print('全是重复词汇')
            top_index = top_indexes[0]
            results.append(top_index)
            input = paddle.to_tensor(top_index).reshape([1, 1])
        # print(i, tokenizer.convert_tokens_to_string(tokenizer.convert_ids_to_tokens(top_indexes.numpy())))

    print('生成完毕, 长度:' + str(len(results)) + ' times:' + str(runtime))

    # 这里是需要记录时间段的代码
    end_time = datetime.datetime.now()    # 记录结束时间

    time_delta = end_time - start_time    # 计算时间差

    return tokenizer.convert_ids_to_tokens(results), int(time_delta.total_seconds() * 1000)
