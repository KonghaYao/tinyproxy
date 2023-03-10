FROM  paddlepaddle/paddle:2.4.0-cpu
WORKDIR /app/paddle
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY . /app/paddle/
RUN curl  -L https://huggingface.co/KonghaYao/MagicPrompt_SD_V1/resolve/main/v1.pdparams -o ./model/model.pdparams --create-dirs
CMD ["gunicorn", "run:app", "-c", "gunicorn.conf.py"]