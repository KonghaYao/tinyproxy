FROM alpine
RUN apk upgrade
RUN pip install transformers flask
RUN pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cpu 
CMD ['python','main.py']
