FROM  paddlepaddle/paddle:2.4.0-cpu
WORKDIR /app/paddle
COPY . /app/paddle/
RUN pip install -r requirements.txt
RUN mkdir ./model && sudo curl -L https://huggingface.co/KonghaYao/MagicPrompt_SD_V1/resolve/main/v1.pdparams -o ./model/model.pdparams
CMD ["gunicorn", "run:app", "-c", "gunicorn.conf.py"]