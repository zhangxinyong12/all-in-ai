from email import message
from langchain_community.llms.tongyi import Tongyi
from dotenv import load_dotenv
from langchain_community.chat_models.tongyi import ChatTongyi
from langchain_community.chat_models.tongyi import HumanMessage
from langchain_community.chat_models.tongyi import SystemMessage
from langchain_community.chat_models.tongyi import AIMessage

load_dotenv()


chat=ChatTongyi(
    model="qwen3-max",
)

# messages=[
#     SystemMessage(content="你是一个专业的翻译"),
#     HumanMessage(content="你好"),
#     AIMessage(content="Hello"),
#     HumanMessage(content="你好,你的名字是？"),
# ]

messages=[
    {
        "role": "system",
        "content": "你是一个专业的翻译"
    },
    {
        "role": "user",
        "content": "你好"
    },
    {
        "role": "assistant",
        "content": "Hello"
    },
    {
        "role": "user",
        "content": "你好,你的名字是？"
    }
]

for chunk in chat.stream(input=messages):
    print(chunk.content ,end="",flush=True)