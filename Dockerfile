FROM alpine
RUN apk upgrade
RUN pip3 install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cpu 
RUN pip install transformers flask
CMD ['python','main.py']
