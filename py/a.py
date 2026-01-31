import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    # 若没有配置环境变量，请用百炼API Key将下行替换为：api_key="sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)
completion = client.chat.completions.create(
    model="qwen3-max",
    messages=[
        {"role": "system", "content": "AI助理,简洁回答"},
        {"role": "user", "content": "我有100元"},
        {"role": "assistant", "content": "ok"},
        {"role": "user", "content": "买苹果花了20"},
        {"role": "assistant", "content": "ok"},
        {"role": "user", "content": "买了一个苹果"},
        {"role": "assistant", "content": "ok"},
        {"role": "user", "content": "还有多少，买了哈？"},
    ],
    stream=True
)

for chunk in completion:
  print(chunk.choices[0].delta.content, end="", flush=True)
    
    