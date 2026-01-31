# 学习langchain

## python-dotenv 使用说明

### 基本用法

`python-dotenv` 用于从 `.env` 文件中读取环境变量，避免将敏感信息（API Key、密码等）硬编码在代码中。

```python
from dotenv import load_dotenv
import os

load_dotenv()  # 加载 .env 文件
api_key = os.getenv("DASHSCOPE_API_KEY")  # 读取环境变量
```

### 多环境配置

#### 方法一：不同命名的 env 文件

```
py/
├── .env          # 默认环境
├── .env.dev      # 开发环境
├── .env.test     # 测试环境
└── .env.prod     # 生产环境
```

根据环境加载对应的文件：

```python
import os
from dotenv import load_dotenv

# 通过环境变量指定当前环境
env = os.getenv("ENV", "dev")
load_dotenv(dotenv_path=f".env.{env}")
```

#### 方法二：字典映射不同环境

```python
import os
from dotenv import load_dotenv

ENV_FILES = {
    "development": ".env.dev",
    "testing": ".env.test",
    "production": ".env.prod",
}

current_env = os.getenv("ENVIRONMENT", "development")
env_file = ENV_FILES.get(current_env, ".env")
load_dotenv(dotenv_path=env_file)
```

#### 运行命令

```bash
# Windows PowerShell
$env:ENV="dev"; python py/a.py

# Git Bash
ENV=dev python py/a.py
```

### .env 文件格式

```
# 注释
DASHSCOPE_API_KEY=sk-xxx
DEBUG=True
LOG_LEVEL=INFO
```

### load_dotenv 常用参数

```python
load_dotenv(
    dotenv_path=".env",           # 指定 .env 文件路径
    override=False,               # 是否覆盖已存在的环境变量
    verbose=True,                 # 显示调试信息
    encoding="utf-8"             # 文件编码
)
```

### 最佳实践

1. 将 `.env.example` 提交到代码仓库，作为模板
2. 将实际的 `.env.*` 文件添加到 `.gitignore`
3. 生产环境的 `.env.prod` 文件不要提交到代码仓库

.gitignore 示例：

```
.env
.env.*
!.env.example
```

.env.example 示例：

```
DASHSCOPE_API_KEY=your-api-key-here
DEBUG=False
LOG_LEVEL=INFO
```

## LangChain 组件自动读取环境变量

### Tongyi API Key 自动读取机制

LangChain 的 `Tongyi` 组件会自动从环境变量中读取 API Key，无需显式传入 `dashscope_api_key` 参数。

#### 推荐写法（自动读取）

```python
from langchain_community.llms.tongyi import Tongyi
from dotenv import load_dotenv

load_dotenv()

model = Tongyi(model="qwen-max")
```

**工作原理**：
- `Tongyi()` 组件内部会自动查找名为 `DASHSCOPE_API_KEY` 的环境变量
- 只要环境变量已设置，无需任何额外配置

#### 显式传入（可选）

如果需要自定义环境变量名或明确指定 API Key：

```python
from langchain_community.llms.tongyi import Tongyi
from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv("MY_CUSTOM_API_KEY")

model = Tongyi(
    model="qwen-max",
    dashscope_api_key=API_KEY,
)
```

#### 环境变量名称说明

| 组件 | 自动读取的环境变量名 |
|------|---------------------|
| Tongyi | `DASHSCOPE_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| Anthropic | `ANTHROPIC_API_KEY` |

**注意**：使用自动读取功能时，环境变量名称必须与组件要求的名称一致。
