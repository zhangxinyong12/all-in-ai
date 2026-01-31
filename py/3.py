from langchain_community.llms.tongyi import Tongyi
import os
from dotenv import load_dotenv

load_dotenv()

# API_KEY = os.getenv("DASHSCOPE_API_KEY")

model=Tongyi(
    model="qwen-max",
    # temperature=0.5,
    # top_p=0.5,
    # dashscope_api_key=API_KEY,  # Tongyi 会自动从环境变量 DASHSCOPE_API_KEY 中读取 key，无需显式传入
)
# res= model.invoke(input="你好")
# print(res)

res = model.stream(input="你好")
for chunk in res:
    print(chunk ,end="",flush=True)