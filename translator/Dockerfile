FROM python:3.6
WORKDIR /testflask/
COPY requirements.txt /testflask/
COPY gunicorn.conf.py /testflask/
RUN pip3 install -r requirements.txt
COPY run.py /testflask/
CMD ["gunicorn", "run:app", "-c", "gunicorn.conf.py"]