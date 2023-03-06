from flask import request,Flask,jsonify
from translatepy import Translator
from translatepy import Language
app = Flask(__name__)
translator = Translator()

@app.route('/translate')
def prompt():
    text = request.values.get('text')
    source = request.values.get('source')
    target = request.values.get('target')
    data =  translator.translate(text, source_language=source, destination_language=target)
    return jsonify(data.as_json())

if __name__ == '__main__':
    app.run(host='127.0.0.1',port=80)
