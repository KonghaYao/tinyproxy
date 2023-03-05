from flask import Flask
#给Flask一个实例化对象,其中__name__入参是你的模块名或者包名，Flask应用会根据这个来确定你的应用路径以及静态文件和模板文件夹的路径
app = Flask(__name__)
#路由
@app.route('/')
def hello_world():
   return 'Hello World!'
from transformers import AutoTokenizer, AutoModelForCausalLM
from transformers import pipeline, set_seed
tokenizer = AutoTokenizer.from_pretrained("Gustavosta/MagicPrompt-Stable-Diffusion")
model = AutoModelForCausalLM.from_pretrained("Gustavosta/MagicPrompt-Stable-Diffusion")
@app.route('/prompt')
def prompt():
    input = request.arg.get('input')
    generator = pipeline('text-generation', model='Gustavosta/MagicPrompt-Stable-Diffusion')
    set_seed(42)
    return generator(input, max_length=30, num_return_sequences=3)
#运行
if __name__ == '__main__':
    app.run()
