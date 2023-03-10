from paddle.io import Dataset
import paddle.fluid as fluid
import numpy as np
import paddle
import paddle.nn
from paddlenlp.embeddings import TokenEmbedding
from paddlenlp.data import JiebaTokenizer,Vocab
from paddlenlp.transformers import AutoTokenizer

# tokenizer = AutoTokenizer.from_pretrained('bert')
import visualdl
def LoadTags(path):
    # 通过字典构造词汇表vocab
    # 每一个char都是一个词汇
    dic = {'[PAD]':0,'<start>':1,'<end>':2,'[UNK]':3,',':4}# 分别是 补齐，开始，结束，未知字符
    cnt=5
    for i in path:
        with open (i) as fp:
            for line in fp.readlines():
                for char in line.replace("\n",'').split(','):
                    tag = char
                    if tag not in dic:
                        if tag:
                            dic[tag] = cnt
                            cnt+=1
    print('词汇数目',cnt)
    return Vocab.from_dict(dic,unk_token='[UNK]')