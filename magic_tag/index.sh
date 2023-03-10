curl -L -z https://huggingface.co/KonghaYao/MagicPrompt_SD_V1/resolve/main/v1.pdparams -o ./model/model.pdparams --create-dirs
gunicorn run:app -c gunicorn.conf.py