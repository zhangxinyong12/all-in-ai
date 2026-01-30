# AI应用开发学习路线图

## 目标

**从10年前端开发者 → AI应用工程师**

**核心定位：** 使用大模型API开发智能应用，不涉及模型训练和微调

---

## 学习周期：6个月

```
第1月：大模型基础 + 提示词工程
第2月：LangChain框架
第3月：RAG技术 + 向量数据库
第4月：AI Agent开发
第5月：完整项目实战
第6月：部署优化 + 求职准备
```

---

## 第1月：大模型基础 + 提示词工程

### 目标
- 理解大模型基本概念
- 掌握提示词工程核心技巧
- 能独立调用API实现简单功能

---

### 学习内容

#### 1.1 大模型基础（1周）

**核心概念**
- 什么是大语言模型（LLM）
- GPT、Claude、Qwen等主流模型
- Token机制（输入/输出计费）
- API调用基础

**动手实践**
```bash
# 申请API Key
# OpenAI: https://platform.openai.com
# Anthropic: https://console.anthropic.com
# 阿里云通义千问: https://dashscope.aliyun.com
```

**第一个API调用**
```javascript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: 'your-api-key',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
})

async function main() {
  const completion = await openai.chat.completions.create({
    model: 'qwen-plus',
    messages: [{ role: 'user', content: '你好' }]
  })

  console.log(completion.choices[0].message.content)
}

main()
```

**学习资源**
- [OpenAI官方文档](https://platform.openai.com/docs)
- [阿里云通义千问文档](https://help.aliyun.com/zh/dashscope/)
- 文档：`提示词工程详解.md`

---

#### 1.2 提示词工程（2周）

**6要素框架**
```
Role（角色）
Task（任务）
Context（上下文）
Format（格式）
Constraints（约束）
Examples（示例）
```

**核心技巧**
- Zero-Shot（零样本）
- Few-Shot（少样本）
- Chain-of-Thought（思维链）
- Self-Consistency（自一致性）

**实战案例**
```javascript
// 案例1：智能客服
const prompt = `
你是一位专业的客服代表（Role）
请回答用户问题，要求友好、专业、简洁（Task）
公司产品：智能手表、手环、耳机（Context）
回答格式：直接回答问题 + 推荐相关产品（Format）
字数限制：100字以内（Constraints）

示例：
用户：有红色手表吗？
回答：有！我们提供多种颜色的手表，包括红色。推荐查看新款智能手表系列。
`

// 案例2：代码生成
const codePrompt = `
你是一位前端开发专家（Role）
请根据需求生成React组件代码（Task）
技术栈：React + TypeScript + Tailwind CSS（Context）
输出格式：完整可运行的代码（Format）
要求：使用函数组件 + Hooks（Constraints）

需求：创建一个带搜索功能的商品列表组件
`

// 案例3：思维链推理
const cotPrompt = `
请一步步思考并回答以下问题：

某公司3个月销售额分别为：1月100万，2月120万，3月108万。
问题：哪个月环比增长率最高？

思考步骤：
1. 计算2月环比增长率
2. 计算3月环比增长率
3. 对比结果
4. 给出结论
`
```

**学习资源**
- 文档：`提示词工程详解.md`
- [OpenAI提示词指南](https://platform.openai.com/docs/guides/prompt-engineering)

---

#### 1.3 第1月项目（1周）

**项目1：智能对话机器人**
```javascript
// 功能要求
- 支持多轮对话
- 角色扮演（客服、老师、翻译等）
- 上下文记忆
- 流式输出

// 技术栈
- 前端：React + TypeScript
- 后端：Node.js + Express
- AI：OpenAI API
```

**核心代码**
```javascript
// server.js
import express from 'express'
import OpenAI from 'openai'

const app = express()
const openai = new OpenAI()

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body

  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    stream: true
  })

  res.setHeader('Content-Type', 'text/event-stream')

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) {
      res.write(`data: ${JSON.stringify({ content })}\n\n`)
    }
  }

  res.end()
})

app.listen(3000)
```

---

## 第2月：LangChain框架

### 目标
- 掌握LangChain核心模块
- 理解LCEL表达式语言
- 能构建复杂AI应用

---

### 学习内容

#### 2.1 LangChain基础（1周）

**核心模块**
```
Models（模型）
├── LLM（文本生成）
└── Embeddings（向量嵌入）

Prompts（提示词）
├── PromptTemplate
└── ChatPromptTemplate

Chains（链）
├── LLMChain
├── SimpleSequentialChain
└── SequentialChain

Memory（记忆）
├── BufferMemory
├── ConversationBufferWindowMemory
└── ConversationTokenBufferMemory
```

**快速上手**
```javascript
import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { LLMChain } from 'langchain/chains'

const llm = new ChatOpenAI({ model: 'gpt-4' })

const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你是一位{role}'],
  ['user', '{question}']
])

const chain = new LLMChain({
  llm,
  prompt,
  memory: new BufferMemory()
})

const result = await chain.call({
  role: '前端开发专家',
  question: 'React的useEffect如何使用？'
})
```

---

#### 2.2 LCEL表达式语言（1周）

**什么是LCEL**
- LangChain Expression Language
- 声明式编程风格
- 类似函数式编程

**核心操作符**
```javascript
// 1. 管道操作符（.pipe()）
import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { StrOutputParser } from '@langchain/core/output_parsers'

const llm = new ChatOpenAI({ model: 'gpt-4' })
const prompt = PromptTemplate.fromTemplate('回答：{question}')
const parser = new StrOutputParser()

const chain = prompt.pipe(llm).pipe(parser)

const result = await chain.invoke({ question: '什么是AI？' })

// 2. 并行执行（RunnableParallel）
import { RunnableParallel } from '@langchain/core/runnables'

const chain = RunnableParallel.from({
  summary: prompt.pipe(llm).pipe(parser),
  keywords: PromptTemplate.fromTemplate('提取关键词：{question}').pipe(llm).pipe(parser)
})

const result = await chain.invoke({ question: 'React是什么？' })

// 3. 路由选择（RunnableRouter）
import { RunnableBranch } from '@langchain/core/runnables'

const chain = RunnableBranch.from([
  [
    (input) => input.topic === '技术',
    PromptTemplate.fromTemplate('技术回答：{question}').pipe(llm).pipe(parser)
  ],
  [
    (input) => input.topic === '生活',
    PromptTemplate.fromTemplate('生活建议：{question}').pipe(llm).pipe(parser)
  ],
  PromptTemplate.fromTemplate('通用回答：{question}').pipe(llm).pipe(parser)
])

const result = await chain.invoke({ topic: '技术', question: '什么是React？' })
```

---

#### 2.3 高级功能（1周）

**Memory（记忆）**
```javascript
import {
  BufferMemory,
  ConversationBufferWindowMemory,
  ConversationTokenBufferMemory
} from 'langchain/memory'

// 1. BufferMemory（保存所有对话）
const memory = new BufferMemory()

// 2. ConversationBufferWindowMemory（只保留最近N轮）
const windowMemory = new ConversationBufferWindowMemory({ k: 5 })

// 3. ConversationTokenBufferMemory（按token数量限制）
const tokenMemory = new ConversationTokenBufferMemory({
  llm,
  maxTokenLimit: 1000
})

// 使用
const chain = new ConversationChain({ llm, memory: windowMemory })
```

**Callbacks（回调）**
```javascript
import { ConsoleCallbackHandler } from 'langchain/callbacks'

const chain = prompt.pipe(llm).pipe(parser)

const result = await chain.invoke(
  { question: '什么是AI？' },
  { callbacks: [new ConsoleCallbackHandler()] }
)
```

**自定义工具**
```javascript
import { Tool } from '@langchain/core/tools'

class CustomTool extends Tool {
  name = 'custom_tool'
  description = '自定义工具描述'

  async _call(input) {
    return `处理结果：${input}`
  }
}

const tool = new CustomTool()
```

---

#### 2.4 第2月项目（1周）

**项目2：智能文档分析器**
```javascript
// 功能要求
- 上传文档（PDF、Word、TXT）
- 提取文档内容
- 生成摘要
- 提取关键信息
- 问答交互

// 技术栈
- 前端：React + TypeScript
- 后端：Node.js + LangChain
- AI：OpenAI API
```

**核心代码**
```javascript
import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'

const llm = new ChatOpenAI({ model: 'gpt-4' })

// 摘要生成链
const summaryChain = RunnableSequence.from([
  PromptTemplate.fromTemplate('请为以下内容生成摘要：\n{content}'),
  llm,
  new StringOutputParser()
])

// 关键信息提取链
const extractChain = RunnableSequence.from([
  PromptTemplate.fromTemplate('提取关键信息（人名、时间、地点、事件）：\n{content}'),
  llm,
  new StringOutputParser()
])

// 使用
const content = await readDocument('document.pdf')
const summary = await summaryChain.invoke({ content })
const keyInfo = await extractChain.invoke({ content })
```

**学习资源**
- 文档：`LangChain框架详解.md`
- [LangChain.js官方文档](https://js.langchain.com)

---

## 第3月：RAG技术 + 向量数据库

### 目标
- 理解向量数据库原理
- 掌握Embedding技术
- 能构建RAG问答系统

---

### 学习内容

#### 3.1 向量数据库基础（1周）

**核心概念**
- Embedding（向量化）
- 相似度搜索
- 向量索引
- CRUD操作

**类比理解**
```
传统数据库：精确匹配
- SELECT * FROM users WHERE name = '张三'

向量数据库：语义相似
- 搜索"苹果" → 找到"水果"、"iPhone"、"水果公司"
```

**向量数据库选型**
| 数据库 | 优势 | 适用场景 |
|--------|------|----------|
| ChromaDB | 轻量、易用 | 本地开发、小项目 |
| PostgreSQL+pgvector | 成熟、集成 | 生产环境、已有PostgreSQL |
| Milvus | 高性能、分布式 | 大规模生产环境 |
| Pinecone | 云服务 | 无运维需求 |

---

#### 3.2 RAG原理（1周）

**什么是RAG**
- Retrieval Augmented Generation
- 检索增强生成
- 结合外部知识库

**RAG工作流程**
```
1. 用户提问
   ↓
2. 问题向量化
   ↓
3. 向量数据库检索相关文档
   ↓
4. 组合问题+文档
   ↓
5. LLM生成答案
```

**RAG vs 纯LLM**
| 对比项 | 纯LLM | RAG |
|--------|-------|-----|
| 知识时效性 | 训练后固定 | 实时更新 |
| 答案准确性 | 可能幻觉 | 有据可查 |
| 成本 | 高（长上下文） | 低（精准检索） |
| 适用场景 | 通用问答 | 领域问答 |

---

#### 3.3 RAG实战（1周）

**使用ChromaDB**
```javascript
import { Chroma } from '@langchain/community/vectorstores/chroma'
import { OpenAIEmbeddings } from '@langchain/openai'
import { ChatOpenAI } from '@langchain/openai'
import { RetrievalQA } from 'langchain/chains'

// 1. 创建向量存储
const vectorStore = await Chroma.fromTexts(
  [
    'React是由Facebook开发的JavaScript库',
    'Vue是由尤雨溪创建的渐进式框架',
    'Angular是由Google维护的企业级框架'
  ],
  [{ source: 'doc1' }, { source: 'doc2' }, { source: 'doc3' }],
  new OpenAIEmbeddings(),
  {
    collectionName: 'frontend-docs'
  }
)

// 2. 创建RAG链
const llm = new ChatOpenAI({ model: 'gpt-4' })
const chain = RetrievalQA.fromChainType({
  llm,
  retriever: vectorStore.asRetriever(3),
  returnSourceDocuments: true,
  chainType: 'stuff'
})

// 3. 问答
const result = await chain.invoke({
  query: 'React是谁开发的？'
})

console.log(result.result)
console.log(result.sourceDocuments)
```

**使用PostgreSQL+pgvector**
```javascript
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector'

const vectorStore = await PGVectorStore.initialize(
  new OpenAIEmbeddings(),
  {
    postgresConnectionOptions: {
      connectionString: 'postgresql://user:pass@localhost:5432/mydb'
    }
  }
)

// 添加文档
await vectorStore.addDocuments([
  { pageContent: '文档内容', metadata: { source: 'doc1' } }
])

// 相似度搜索
const results = await vectorStore.similaritySearch('搜索查询', 3)
```

---

#### 3.4 第3月项目（1周）

**项目3：企业知识库问答系统**
```javascript
// 功能要求
- 上传企业文档（PDF、Word、PPT）
- 自动分块向量化
- 智能问答
- 显示答案来源
- 支持多文档

// 技术栈
- 前端：React + TypeScript
- 后端：Node.js + LangChain
- 向量库：ChromaDB
- AI：OpenAI API
```

**核心代码**
```javascript
import { Chroma } from '@langchain/community/vectorstores/chroma'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { RetrievalQA } from 'langchain/chains'

// 文档处理
async function processDocument(filePath) {
  const text = await readDocument(filePath)

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  })

  const chunks = await splitter.splitText(text)

  const vectorStore = await Chroma.fromTexts(
    chunks,
    [{ source: filePath }],
    new OpenAIEmbeddings(),
    { collectionName: 'knowledge-base' }
  )

  return vectorStore
}

// 问答
async function askQuestion(question, vectorStore) {
  const chain = RetrievalQA.fromChainType({
    llm: new ChatOpenAI({ model: 'gpt-4' }),
    retriever: vectorStore.asRetriever(5),
    returnSourceDocuments: true
  })

  const result = await chain.invoke({ query: question })
  return {
    answer: result.result,
    sources: result.sourceDocuments.map(doc => doc.metadata.source)
  }
}
```

**学习资源**
- 文档：`向量数据库详解.md`
- [LangChain RAG教程](https://js.langchain.com/docs/tutorials/rag)

---

## 第4月：AI Agent开发

### 目标
- 理解Agent原理
- 掌握工具调用
- 能构建自主智能体

---

### 学习内容

#### 4.1 Agent基础（1周）

**什么是Agent**
- 自主决策的AI系统
- 能使用工具完成任务
- 规划、执行、反思

**Agent vs Chain**
| 对比项 | Chain | Agent |
|--------|-------|-------|
| 执行方式 | 固定步骤 | 动态决策 |
| 能力 | 预定义逻辑 | 自主推理 |
| 复杂度 | 简单 | 复杂 |
| 适用场景 | 流程化任务 | 开放式任务 |

**Agent类型**
```
ReAct Agent（推理+行动）
- Reasoning：分析问题
- Acting：选择工具执行
- Observation：观察结果
- 重复直到完成

Zero-Shot Agent（零样本）
- 无需示例
- 直接使用工具描述

Few-Shot Agent（少样本）
- 提供示例
- 更准确
```

---

#### 4.2 工具开发（1周）

**内置工具**
```javascript
import { SerpAPI } from 'langchain/tools'
import { Calculator } from 'langchain/tools/math'

// 搜索工具
const searchTool = new SerpAPI({
  apiKey: 'your-serpapi-key'
})

// 计算工具
const calculator = new Calculator()
```

**自定义工具**
```javascript
import { Tool } from '@langchain/core/tools'

class WeatherTool extends Tool {
  name = 'weather'
  description = '查询指定城市的天气，输入格式：城市名称'

  async _call(city) {
    const response = await fetch(
      `https://api.weather.com/v1/weather?q=${city}`
    )
    const data = await response.json()
    return JSON.stringify(data)
  }
}

class CodeTool extends Tool {
  name = 'code_executor'
  description = '执行JavaScript代码，输入格式：有效JS代码'

  async _call(code) {
    try {
      const result = eval(code)
      return String(result)
    } catch (error) {
      return `错误：${error.message}`
    }
  }
}
```

**LangChain内置工具库**
- SerpAPI（搜索）
- Calculator（计算）
- Requests（HTTP请求）
- Shell（Shell命令）
- PythonREPL（Python执行）
- Zapier（API集成）

---

#### 4.3 Agent实战（1周）

**ReAct Agent**
```javascript
import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import { ChatOpenAI } from '@langchain/openai'

const llm = new ChatOpenAI({ model: 'gpt-4' })

const tools = [
  new SerpAPI({ apiKey: process.env.SERPAPI_KEY }),
  new Calculator(),
  new WeatherTool(),
  new CodeTool()
]

const executor = await initializeAgentExecutorWithOptions(
  tools,
  llm,
  {
    agentType: 'zero-shot-react-description',
    verbose: true
  }
)

const result = await executor.invoke({
  input: '北京今天的天气怎么样？如果下雨，我需要准备什么？'
})

console.log(result.output)
```

**执行过程**
```
Thought: 用户想知道北京今天的天气，我需要使用天气工具查询
Action: weather
Action Input: 北京
Observation: {"temp": 15, "condition": "晴", "humidity": 60%}
Thought: 天气是晴天，不需要准备雨具。但温度只有15度，建议穿厚一点的衣服。
Final Answer: 北京今天天气晴朗，温度15度，湿度60%。建议穿厚一点的衣服，不需要带雨具。
```

---

#### 4.4 第4月项目（1周）

**项目4：AI助手智能体**
```javascript
// 功能要求
- 多工具协作（搜索、计算、天气、代码执行）
- 任务拆解
- 多步推理
- 记忆管理

// 技术栈
- 前端：React + TypeScript
- 后端：Node.js + LangChain
- AI：OpenAI API
```

**核心代码**
```javascript
import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import { ConversationBufferMemory } from 'langchain/memory'

const tools = [
  new SerpAPI(),
  new Calculator(),
  new WeatherTool(),
  new CodeTool()
]

const executor = await initializeAgentExecutorWithOptions(
  tools,
  llm,
  {
    agentType: 'zero-shot-react-description',
    memory: new ConversationBufferMemory({
      memoryKey: 'chat_history',
      returnMessages: true
    }),
    verbose: true
  }
)

// 使用
const result = await executor.invoke({
  input: '帮我查询一下2024年最流行的编程语言，然后告诉我Python和Java的薪资差距是多少？'
})
```

---

## 第5月：完整项目实战

### 目标
- 完成一个端到端AI应用
- 掌握项目架构
- 积累实战经验

---

### 项目选择

**项目A：智能客服系统**
```
功能：
- 多轮对话
- 知识库问答
- 意图识别
- 工单转接

技术栈：
- 前端：React + TypeScript + Vite
- 后端：Node.js + Express + LangChain
- 向量库：ChromaDB
- AI：OpenAI API

难度：⭐⭐⭐
```

**项目B：代码助手**
```
功能：
- 代码生成
- 代码审查
- 代码解释
- 单元测试生成

技术栈：
- 前端：React + Monaco Editor
- 后端：Node.js + LangChain
- AI：OpenAI API

难度：⭐⭐⭐⭐
```

**项目C：个人知识库**
```
功能：
- 文档管理
- 智能搜索
- 问答交互
- 笔记整理

技术栈：
- 前端：React + Tiptap
- 后端：Node.js + LangChain
- 向量库：PostgreSQL+pgvector
- AI：OpenAI API

难度：⭐⭐⭐
```

---

### 完整项目架构

```
ai-project/
├── frontend/              # 前端应用
│   ├── src/
│   │   ├── components/   # React组件
│   │   ├── hooks/        # 自定义Hooks
│   │   ├── services/     # API调用
│   │   └── types/        # TypeScript类型
│   ├── package.json
│   └── vite.config.ts
├── backend/              # 后端服务
│   ├── src/
│   │   ├── routes/       # 路由
│   │   ├── controllers/  # 控制器
│   │   ├── services/     # 业务逻辑
│   │   ├── chains/       # LangChain链
│   │   ├── agents/       # Agent定义
│   │   └── utils/        # 工具函数
│   ├── package.json
│   └── tsconfig.json
├── vector-db/            # 向量数据库
│   └── chroma/           # ChromaDB数据
└── README.md
```

---

### 后端核心代码示例

```javascript
// backend/src/services/ragService.js
import { ChatOpenAI } from '@langchain/openai'
import { Chroma } from '@langchain/community/vectorstores/chroma'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RetrievalQA } from 'langchain/chains'

class RAGService {
  constructor() {
    this.llm = new ChatOpenAI({ model: 'gpt-4' })
    this.embeddings = new OpenAIEmbeddings()
    this.vectorStore = null
  }

  async init() {
    this.vectorStore = await Chroma.fromTexts(
      [],
      [],
      this.embeddings,
      { collectionName: 'knowledge-base' }
    )
  }

  async addDocument(text, metadata) {
    await this.vectorStore.addDocuments([
      { pageContent: text, metadata }
    ])
  }

  async query(question) {
    const chain = RetrievalQA.fromChainType({
      llm: this.llm,
      retriever: this.vectorStore.asRetriever(3),
      returnSourceDocuments: true
    })

    const result = await chain.invoke({ query: question })
    return result
  }
}

export default new RAGService()
```

```javascript
// backend/src/routes/chat.js
import express from 'express'
import RAGService from '../services/ragService.js'

const router = express.Router()

router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body
    const result = await RAGService.query(question)

    res.json({
      answer: result.result,
      sources: result.sourceDocuments.map(d => d.metadata)
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
```

---

### 前端核心代码示例

```typescript
// frontend/src/hooks/useChat.ts
import { useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  const sendMessage = async (content: string) => {
    setLoading(true)

    const userMessage: Message = { role: 'user', content }
    setMessages(prev => [...prev, userMessage])

    try {
      const response = await fetch('/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: content })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return { messages, sendMessage, loading }
}
```

---

## 第6月：部署优化 + 求职准备

### 目标
- 掌握AI应用部署
- 优化性能和成本
- 准备求职面试

---

### 学习内容

#### 6.1 部署（1周）

**本地部署**
```bash
# 使用Ollama本地运行模型
ollama run qwen2.5:7b

# API调用
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5:7b",
  "prompt": "你好"
}'
```

**云部署**
```
Vercel（推荐）
- 自动部署
- Serverless
- 免费额度充足

Railway
- 支持Docker
- 数据库托管
- 简单易用

阿里云/腾讯云
- 国内访问快
- 成本可控
- 服务稳定
```

**部署示例（Vercel）**
```javascript
// api/chat.js
import { ChatOpenAI } from '@langchain/openai'

const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export default async function handler(req, res) {
  const { message } = req.body

  const response = await llm.invoke(message)

  res.json({ message: response.content })
}
```

---

#### 6.2 性能优化（1周）

**缓存策略**
```javascript
import { Redis } from 'ioredis'

const redis = new Redis()

async function getCachedResponse(key) {
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)

  const response = await llm.invoke(prompt)
  await redis.setex(key, 3600, JSON.stringify(response))

  return response
}
```

**流式输出**
```javascript
import { ChatOpenAI } from '@langchain/openai'

const llm = new ChatOpenAI({ streaming: true })

const stream = await llm.stream('你好')

for await (const chunk of stream) {
  console.log(chunk.content)
}
```

**批处理**
```javascript
const questions = ['问题1', '问题2', '问题3']

const responses = await Promise.all(
  questions.map(q => llm.invoke(q))
)
```

**成本优化**
```
1. 使用更便宜的模型
   - GPT-3.5 → GPT-4o-mini
   - Qwen-Turbo → Qwen-Plus

2. 优化提示词
   - 减少不必要的内容
   - 使用System消息替代User消息

3. 启用缓存
   - 相似问题复用答案
   - 减少重复调用

4. 批量处理
   - 合并多个请求
   - 减少API调用次数
```

---

#### 6.3 求职准备（2周）

**简历优化**
```
重点突出：
- 前端经验（10年）
- Node.js经验
- AI应用开发经验
- 完整项目经验

技术栈：
- React + TypeScript
- Node.js + Express
- LangChain.js
- OpenAI API
- 向量数据库（ChromaDB/PGVector）

项目经验：
- 智能客服系统
- 企业知识库
- AI助手
```

**面试准备**

**技术问题**
```
1. 什么是RAG？有什么优势？
2. LangChain的LCEL是什么？如何使用？
3. 向量数据库和传统数据库的区别？
4. 如何优化AI应用的性能？
5. 什么是AI Agent？和Chain的区别？
6. 如何处理AI应用的错误？
7. 如何降低AI应用成本？
```

**实战问题**
```
1. 设计一个智能客服系统
2. 如何实现代码审查助手？
3. 如何构建个人知识库？
4. 如何优化长对话的性能？
```

**作品集**
```
GitHub仓库：
- 完整项目代码
- README文档
- 在线演示

部署展示：
- Vercel/Railway部署
- 真实可用的应用

技术博客：
- 学习笔记
- 技术分享
- 项目复盘
```

---

## 学习资源汇总

### 官方文档
- [OpenAI API](https://platform.openai.com/docs)
- [LangChain.js](https://js.langchain.com)
- [阿里云通义千问](https://help.aliyun.com/zh/dashscope/)
- [ChromaDB](https://docs.trychroma.com)
- [Vercel AI SDK](https://sdk.vercel.ai)

### 推荐课程
- [LangChain官方教程](https://js.langchain.com/docs/tutorials/)
- [DeepLearning.AI](https://www.deeplearning.ai/short-courses/)
- [吴恩达AI课程](https://www.coursera.org/learn/ai-for-everyone)

### 实战项目
- [LangChain Templates](https://github.com/langchain-ai/langchain/tree/master/templates)
- [Vercel AI SDK Examples](https://sdk.vercel.ai/examples)
- [Awesome LangChain](https://github.com/ai-yanyishui/awesome-langchain)

### 社区资源
- [LangChain Discord](https://discord.gg/6rMcTkZp)
- [Reddit r/LangChain](https://reddit.com/r/LangChain)
- [知乎AI话题](https://www.zhihu.com/topic/19550501)

---

## 学习建议

### 每周安排
```
周一：理论学习（2小时）
- 阅读文档
- 观看视频
- 记录笔记

周二：代码练习（3小时）
- 跟着文档写代码
- 调试运行
- 理解原理

周三：功能扩展（2小时）
- 修改示例代码
- 尝试新功能
- 记录问题

周四：项目实战（3小时）
- 开发项目功能
- 解决实际问题
- 代码优化

周五：总结复盘（1小时）
- 整理本周内容
- 记录心得
- 计划下周

周末：自由安排
- 技术分享
- 参与社区
- 休息放松
```

### 学习技巧
1. **动手为主，理论为辅**
   - 先跑通代码
   - 再理解原理

2. **项目驱动学习**
   - 每个阶段完成一个项目
   - 积累实战经验

3. **记录学习过程**
   - 写技术博客
   - GitHub提交代码
   - 整理笔记

4. **参与社区交流**
   - 提问和回答
   - 分享经验
   - 拓展人脉

5. **关注行业动态**
   - 订阅技术周刊
   - 关注大公司动态
   - 了解最新技术

---

## 常见问题

### Q1：需要学习Python吗？
**A：不需要。** 使用LangChain.js可以完成所有功能，而且你对Node.js更熟悉。

### Q2：数学基础要求高吗？
**A：不高。** 应用开发不需要深入数学，理解基本概念即可。

### Q3：需要买GPU吗？
**A：不需要。** 使用云服务API即可，不需要本地训练模型。

### Q4：学习周期太长怎么办？
**A：可以压缩到3个月。** 重点学习提示词工程、LangChain、RAG三个核心模块。

### Q5：可以边工作边学习吗？
**A：完全可以。** 每天投入2-3小时，6个月可以掌握核心技能。

### Q6：求职时没有经验怎么办？
**A：多做项目。** 完整的项目经验比理论更重要，GitHub上的开源项目是很好的证明。

---

## 总结

**核心目标：** 从前端开发者 → AI应用工程师

**学习重点：**
1. 提示词工程（第1月）
2. LangChain框架（第2月）
3. RAG技术（第3月）
4. AI Agent（第4月）
5. 完整项目（第5月）
6. 部署求职（第6月）

**关键技能：**
- API调用
- LangChain.js
- 向量数据库
- RAG系统
- AI Agent

**不学习：**
- 模型训练
- 模型微调
- 深度学习算法
- 高级数学

---

## 下一步行动

**本周任务：**
1. 注册OpenAI/阿里云账号，获取API Key
2. 完成第一个API调用
3. 阅读提示词工程文档
4. 开始第1月项目开发

**需要帮助：**
- 遇到问题随时提问
- 技术方案可以讨论
- 项目代码可以review

**加油！** 6个月后，你将成为一名合格的AI应用工程师！🚀
