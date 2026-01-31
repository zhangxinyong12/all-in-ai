import json
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


# 几段来自网上的股票信息 日期 股票名称 开盘价 收盘价 成交量 文本
stock_info = """
【股票A市场表现强劲】2023年8月1日，股票A在今日交易中表现亮眼。该股票以10.00元开盘，随后价格稳步上涨，最终以10.50元收盘，全天涨幅达5%。成交量方面，股票A交投活跃，累计成交量为100万股，市场关注度较高，显示投资者对该股票未来走势持乐观态度。

【股票B延续上涨势头】2023年8月2日，股票B延续了前一交易日的强势表现。该股票开盘价为11.00元，盘中表现稳健，收盘价达到11.50元，涨幅为4.55%。市场交易活跃度持续提升，全日成交量达到120万股，创下近期新高，反映出市场对该股票的强烈兴趣和积极预期。

【股票C引领市场行情】2023年8月3日，股票C成为市场关注的焦点。该股票开盘价报12.00元，在强劲买盘推动下，收盘价攀升至12.50元，单日涨幅为4.17%。市场交易热情高涨，成交量放大至130万股，显示出投资者对该股票的青睐和看好后市表现的信心。
"""

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
    
    