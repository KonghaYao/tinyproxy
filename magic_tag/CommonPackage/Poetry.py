# 导入相关依赖
import paddle
import random
import paddle.nn # neuron network
class Poetry(paddle.nn.Layer):
    def __init__(self,vocab_size,embedding_dim,hidden_dim,num_layers):
        super().__init__()
        self.embeddings = paddle.nn.Embedding(vocab_size,embedding_dim)
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.lstm = paddle.nn.LSTM(
            input_size=embedding_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            dropout=random.random()
        )
        self.linear = paddle.nn.Linear(in_features=hidden_dim,out_features=vocab_size)

    def forward(self,input,hidden=None):
        batch_size, seq_len = paddle.shape(input)
        embeds = self.embeddings(input)
        if hidden is None:
            output,hidden = self.lstm(embeds)
        else:
            output,hidden = self.lstm(embeds,hidden)
        output = paddle.reshape(output,[seq_len*batch_size,self.hidden_dim])
        output = self.linear(output)
        return output,hidden
