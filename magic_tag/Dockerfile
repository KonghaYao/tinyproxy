FROM  paddlepaddle/paddle:2.4.0-cpu
WORKDIR /app/paddle
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY . /app/paddle/
CMD ["sh","index.sh"]