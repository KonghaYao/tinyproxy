from flask import request, Flask, jsonify, make_response
from translatepy import Translator
from translatepy import Language
from flask_cors import CORS, cross_origin
app = Flask(__name__)
translator = Translator()
cors = CORS(app)


@app.route('/translate')
@cross_origin()
def prompt():
    try:
        text = request.values.get('text')
        source = request.values.get('source')
        target = request.values.get('target')
        data = translator.translate(
            text, source_language=source, destination_language=target)
        return data.as_json()
    except Exception as e:
        print(e)
        return jsonify({"error": 100})


@app.after_request
def after(resp):
    '''
    被after_request钩子函数装饰过的视图函数 
    ，会在请求得到响应后返回给用户前调用，也就是说，这个时候，
    请求已经被app.route装饰的函数响应过了，已经形成了response，这个时
    候我们可以对response进行一些列操作，我们在这个钩子函数中添加headers，所有的url跨域请求都会允许！！！
    '''
    resp = make_response(resp)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET,POST'
    resp.headers['Access-Control-Allow-Headers'] = 'x-requested-with,content-type'
    return resp


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=80)
