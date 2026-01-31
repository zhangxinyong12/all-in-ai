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


schema=['日期','股票名称','开盘价','收盘价','成交量']
# 给大模型的示例
example_data=[
    {
        "content": "【科技龙头股逆势上扬】2024年3月15日，科技创新板明星企业华兴科技表现突出。该股开盘报25.80元，上午时段震荡整理，午后在大单资金流入的推动下快速拉升，最终收于27.35元，涨幅5.98%。全日成交金额达2.8亿元，换手率超过8%，显示机构资金积极布局，市场对其在人工智能领域的突破性进展给予高度认可。",
        "schema": {
            "日期":"2024-03-15",
            "股票名称":"华兴科技",
            "开盘价":"25.80",
            "收盘价":"27.35",
            "成交量":"1085300"
        }
    },
    {
        "content": "【新能源汽车板块遇冷回调】2024年4月8日，绿能动力股价承压下行。该股以42.60元低开，盘中一度下探至40.20元，虽有小幅反弹，但最终收报40.85元，跌幅达4.09%。成交量萎缩至45万股，创下近一个月新低，表明市场情绪偏谨慎，投资者对行业政策变化持观望态度，短期抛压仍需时间消化。",
        "schema": {
            "日期":"2024-04-08",
            "股票名称":"绿能动力",
            "开盘价":"42.60",
            "收盘价":"40.85",
            "成交量":"450000"
        }
    },
]

questions=[
    # 用户提的问题 原始文本 新闻内容
    "【消费电子股震荡走高】2024年5月20日，蓝海电子表现不俗。该股以18.50元开盘，全天维持震荡上行态势，盘中最高触及19.80元，最终收于19.45元，涨幅5.14%。成交量达到88万股，市场交投活跃，机构投资者对其在新品研发方面的进展表示认可，看好未来业绩增长潜力。",
    "【银行板块整体回调】2024年6月3日，稳健银行股价出现调整。该股开盘价为8.75元，受市场整体情绪影响，早盘即承压下行，午后有所回升但力度有限成交量温和放大至210万股，显示部分资金选择离场观望，投资者关注后续政策导向变化。"
]



client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)

def extract_stock_info(text):
    system_prompt = f"""你是一个专业的股票信息提取助手。请从新闻稿中提取以下字段：{','.join(schema)}。
返回格式为JSON对象，如果原文没有提及值为空包，含上述字段。"""

    examples = ""
    for example in example_data:
        examples += f"\n输入：{example['content']}\n输出：{json.dumps(example['schema'], ensure_ascii=False)}\n"

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"以下是提取示例：{examples}\n\n请提取以下新闻的信息：{text}"}
    ]

    completion = client.chat.completions.create(
        model="qwen3-max",
        messages=messages,
        response_format={"type": "json_object"}
    )

    return json.loads(completion.choices[0].message.content)

for question in questions:
    result = extract_stock_info(question)
    print(f"原文：{question}\n提取结果：{result}\n{'='*80}\n")
    
    