FROM python:3.10.10
WORKDIR /app/paddle
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
RUN apt-get update && apt-get install curl -y
RUN apt-get install libgomp1 -y
COPY . /app/paddle/
RUN curl  -L https://huggingface.co/KonghaYao/MagicPrompt_SD_V1/resolve/main/v1.pdparams -o ./model/model.pdparams --create-dirs
CMD ["gunicorn","run:app","-c","gunicorn.conf.py"]