
if [ -e /app/paddle/model/model.pdparams]; then
  echo "文件存在"
else
  curl  -L https://huggingface.co/KonghaYao/MagicPrompt_SD_V1/resolve/main/v1.pdparams -o ./model/model.pdparams --create-dirs
fi
gunicorn run:app -c gunicorn.conf.py