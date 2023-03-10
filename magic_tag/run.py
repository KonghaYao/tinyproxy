import paddle
from flask import request, Flask, jsonify, make_response
from translatepy import Translator
# 加载模型
from paddlenlp.transformers import BertTokenizer
from CommonPackage.Poetry import Poetry
from flask_cors import CORS, cross_origin
app = Flask(__name__)
translator = Translator()
cors = CORS(app)

# 定义超参数


class Config(object):

    version = 'full/v1'  # 保存模型的名字
    # filepath = ["data/data179258/dark_magics.txt"] # 涩涩魔咒
    batch_size = 64
    num_workers = 16
    epochs = 100
    embedding_dim = 300
    hidden_dim = 512
    num_layers = 3
    learning_rate = 0.001  # 在此任务中，经验表明，不建议设置太高，

    maxl = 120  # 截断or padding的长度
    plot_interval = 1000  # 每间隔plot_interval输出一次
    max_gen_len = 40  # 生成长度

    prefix = '',


config = Config()
print('Bert 下载开始')
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
print('下载 Bert 完毕')
vocab = tokenizer.vocab
paddle.set_device('cpu')  # 可以使用 CPU 进行推断
print('cpu 运行中')
# 加载神经网络及模型
poetry = Poetry(len(vocab), config.embedding_dim,
                config.hidden_dim, config.num_layers)
poetry.set_state_dict(paddle.load(
    './model/model.pdparams'))
print('模型加载完毕')
from CommonPackage.getResult import getResult


@app.route('/magic_prompt')
@cross_origin()
def prompt():
    try:
        text = request.values.get('text')
        length = int(request.values.get('length') or '70')
        threshold = int(request.values.get('threshold') or "15")
        memory = int(request.values.get('memory') or "15")

        arr, time_delta = getResult({
            "inputs": text,
            "dev": False,  # dev 模式会显示重复
            "times": length,
            "threshold": threshold,  # top 15 的数据都会被保留，当发生重复时，采取下一位替代
            "memory": memory  # 记忆力，指当前数据和前面的n个数据不会重复
        }, config, poetry, vocab, tokenizer)
        print(time_delta, 'ms')
        
        return jsonify({"text": tokenizer.convert_tokens_to_string(arr), "time": time_delta})
    except Exception as e:
        print(e)
        return jsonify({"error": 100})


@app.after_request
def after(resp):
    resp = make_response(resp)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET,POST'
    resp.headers['Access-Control-Allow-Headers'] = 'x-requested-with,content-type'
    return resp


if __name__ == '__main__':
    # app.debug = True
    
    app.run(host='127.0.0.1', port=8080)
