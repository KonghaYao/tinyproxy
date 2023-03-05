FROM pytorch/pytorch
RUN pip install transformers flask
# RUN pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cpu 
COPY index.sh /app/run/index.sh
COPY main.py /app/run/main.py
CMD ['/app/run/index.sh']
