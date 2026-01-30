# LangChain 框架详解 - 面向前端开发者

> 大模型应用开发的"React"框架
> LangChain.js：用你熟悉的 Node.js 构建AI应用

---

## 一、LangChain 是什么？

### 1.1 基本定义

**LangChain** = 开发大模型应用的框架

**类比理解：**

| 概念 | 前端开发 | LangChain |
|------|---------|-----------|
| 框架 | React / Vue | LangChain |
| 组件化 | UI组件 | Chain组件 |
| 状态管理 | Redux / Zustand | Memory |
| 数据流 | Props / Context | Prompt + Output |
| 中间件 | useEffect / middleware | Callbacks |

---

### 1.2 为什么需要 LangChain？

**不用 LangChain：**

```typescript
// 直接调用 API
import OpenAI from 'openai'

const client = new OpenAI()

// 简单对话
const response = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: '你好' }]
})

// 但如果要实现：
// - 对话记忆？需要自己管理
// - RAG？需要自己写检索逻辑
// - Agent？需要自己写工具调用
// - 多链组合？需要自己写流程控制
```

**用 LangChain：**

```typescript
// 对话记忆
const memory = new BufferMemory()
const chain = new ConversationChain({ llm, memory })

// RAG
const chain = RetrievalQA.fromChainType({
  retriever: vectorStore.asRetriever()
})

// Agent
const agent = new ZeroShotAgent({
  llm,
  tools: [searchTool, calculatorTool]
})
```

---

### 1.3 LangChain.js vs LangChain Python

| 特性 | LangChain.js | LangChain Python |
|------|--------------|------------------|
| 语言 | TypeScript | Python |
| 生态 | Vercel AI SDK | 更成熟 |
| 学习曲线 | 前端开发者友好 | 需要Python基础 |
| 部署 | Vercel / Node.js | Docker / Python服务 |
| 适用场景 | 全栈AI应用 | 后端AI服务 |

**推荐：** 前端开发者用 LangChain.js

---

## 二、核心概念

### 2.1 核心模块总览

```
LangChain
├── Models（模型）
├── Prompts（提示词）
├── Chains（链）
├── Memory（记忆）
├── Agents（智能体）
├── Tools（工具）
├── Retrievers（检索器）
└── Callbacks（回调）
```

---

### 2.2 Models（模型）

**LLM（大语言模型）**

```typescript
import { ChatOpenAI } from '@langchain/openai'

const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
  temperature: 0.7
})

// 调用
const response = await llm.invoke('你好')
console.log(response.content)
```

**Embeddings（嵌入模型）**

```typescript
import { OpenAIEmbeddings } from '@langchain/openai'

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  model: 'text-embedding-3-small'
})

// 生成向量
const vector = await embeddings.embedQuery('苹果')
console.log(vector) // [0.123, -0.456, 0.789, ...]
```

---

### 2.3 Prompts（提示词）

**PromptTemplate（提示词模板）**

```typescript
import { PromptTemplate } from '@langchain/core/prompts'

const template = `
你是一位{role}专家。

任务：{task}

输入：
{input}

请提供详细的{output_type}。
`

const prompt = new PromptTemplate({
  template,
  inputVariables: ['role', 'task', 'input', 'output_type']
})

// 使用
const formattedPrompt = await prompt.format({
  role: 'React',
  task: '代码审查',
  input: 'const [count, setCount] = useState()',
  output_type: '改进建议'
})

console.log(formattedPrompt)
```

**ChatPromptTemplate（对话提示词）**

```typescript
import { ChatPromptTemplate } from '@langchain/core/prompts'

const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你是一位{role}专家'],
  ['human', '{input}'],
  ['ai', '{ai_response}'],
  ['human', '请详细说明']
])

const formatted = await prompt.format({
  role: '前端',
  input: 'React是什么？',
  ai_response: 'React是一个前端框架'
})
```

---

### 2.4 Chains（链）

**最简单的链：LLMChain**

```typescript
import { LLMChain } from 'langchain/chains'
import { PromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'

const llm = new ChatOpenAI({ model: 'gpt-4' })

const prompt = PromptTemplate.fromTemplate(`
你是一位代码审查专家，请审查以下代码：

{code}

请指出问题和改进建议。
`)

const chain = new LLMChain({
  llm,
  prompt
})

// 运行
const result = await chain.call({
  code: 'const [count, setCount] = useState()'
})

console.log(result.text)
```

**SequentialChain（顺序链）**

```typescript
import { SequentialChain } from 'langchain/chains'

// 链1：生成摘要
const summaryChain = new LLMChain({
  llm,
  prompt: PromptTemplate.fromTemplate('摘要：{text}'),
  outputKey: 'summary'
})

// 链2：生成标题
const titleChain = new LLMChain({
  llm,
  prompt: PromptTemplate.fromTemplate('基于摘要生成标题：{summary}'),
  outputKey: 'title'
})

// 组合链
const overallChain = new SequentialChain({
  chains: [summaryChain, titleChain],
  inputVariables: ['text'],
  outputVariables: ['summary', 'title']
})

const result = await overallChain.call({
  text: '长文本内容...'
})

console.log(result)
// { summary: '...', title: '...' }
```

---

### 2.5 Memory（记忆）

**BufferMemory（简单记忆）**

```typescript
import { ConversationChain } from 'langchain/chains'
import { BufferMemory } from 'langchain/memory'

const memory = new BufferMemory()

const chain = new ConversationChain({
  llm,
  memory
})

// 第一轮对话
await chain.call({ input: '我叫张三' })

// 第二轮对话（能记住第一轮）
await chain.call({ input: '我叫什么名字？' })
// 输出：你叫张三
```

**ConversationBufferWindowMemory（窗口记忆）**

```typescript
import { ConversationBufferWindowMemory } from 'langchain/memory'

const memory = new ConversationBufferWindowMemory({
  k: 5  // 只保留最近5轮对话
})
```

**VectorStoreMemory（向量记忆）**

```typescript
import { VectorStoreRetrieverMemory } from 'langchain/memory'

const memory = new VectorStoreRetrieverMemory({
  retriever: vectorStore.asRetriever(5)  // 检索最相关的5条
})
```

---

### 2.6 Agents（智能体）

**概念：**

Agent = 大模型 + 工具调用 + 自主决策

**ZeroShotAgent（零样本智能体）**

```typescript
import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import { SerpAPI } from 'langchain/tools'

// 定义工具
const tools = [
  new SerpAPI(process.env.SERP_API_KEY),  // 搜索工具
  new CalculatorTool()                     // 计算工具
]

// 创建Agent
const executor = await initializeAgentExecutorWithOptions(
  tools,
  llm,
  {
    agentType: 'zero-shot-react-description',
    verbose: true
  }
)

// 使用
const result = await executor.invoke({
  input: '2024年苹果公司的股价是多少？'
})

console.log(result.output)
// Agent会自动：
// 1. 思考：需要搜索股价
// 2. 调用搜索工具
// 3. 获取结果
// 4. 返回答案
```

**自定义工具**

```typescript
import { Tool } from '@langchain/core/tools'

class MyTool extends Tool {
  name = 'my_custom_tool'
  description = '执行自定义任务'

  async _call(input: string): Promise<string> {
    // 自定义逻辑
    return `处理结果：${input}`
  }
}

const tool = new MyTool()
const executor = await initializeAgentExecutorWithOptions(
  [tool],
  llm,
  { agentType: 'zero-shot-react-description' }
)
```

---

### 2.7 Retrievers（检索器）

**概念：** 从向量数据库检索相关文档

```typescript
import { Chroma } from '@langchain/community/vectorstores/chroma'
import { OpenAIEmbeddings } from '@langchain/openai'

// 创建向量存储
const vectorStore = await Chroma.fromTexts(
  ['文档1', '文档2', '文档3'],
  [{ id: 1 }, { id: 2 }, { id: 3 }],
  new OpenAIEmbeddings()
)

// 创建检索器
const retriever = vectorStore.asRetriever({
  k: 3  // 返回最相关的3条
})

// 检索
const results = await retriever.invoke('搜索关键词')
console.log(results)
// [Document { pageContent: '文档1', metadata: { id: 1 } }, ...]
```

**RAG 链**

```typescript
import { RetrievalQA } from 'langchain/chains'

const chain = RetrievalQA.fromChainType({
  llm,
  retriever: vectorStore.asRetriever(),
  returnSourceDocuments: true
})

const result = await chain.invoke({
  query: '用户问题'
})

console.log(result.result)           // 答案
console.log(result.sourceDocuments)  // 来源文档
```

---

### 2.8 Callbacks（回调）

**概念：** 监听链的执行过程

```typescript
import { CallbackHandler } from 'langchain/callbacks'

class MyCallbackHandler extends CallbackHandler {
  name = 'my_handler'

  async handleLLMNewToken(token: string) {
    console.log('生成token:', token)
  }

  async handleChainEnd(outputs) {
    console.log('链结束:', outputs)
  }

  async handleAgentAction(action) {
    console.log('Agent执行:', action.tool)
  }
}

const chain = new LLMChain({
  llm,
  prompt,
  callbacks: [new MyCallbackHandler()]
})

await chain.call({ input: '测试' })
```

---

## 三、实战案例

### 案例1：智能客服

```typescript
import { ChatOpenAI } from '@langchain/openai'
import { ConversationChain } from 'langchain/chains'
import { BufferMemory } from 'langchain/memory'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'

// 1. 初始化
const llm = new ChatOpenAI({ model: 'gpt-4' })

const prompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(`
你是一位专业的客服代表，职责是：
1. 友好地回答用户问题
2. 如果无法解决，引导用户联系人工客服
3. 保持专业和耐心

产品信息：
{product_info}
  `),
  ['human', '{input}']
])

const memory = new BufferMemory({
  returnMessages: true
})

const chain = new ConversationChain({
  llm,
  memory,
  prompt
})

// 2. 使用
async function handleCustomerMessage(message: string) {
  const result = await chain.call({
    input: message,
    product_info: `
产品名称：智能手表
功能：心率监测、运动追踪、消息提醒
价格：¥999
`
  })
  return result.response
}

// 测试
console.log(await handleCustomerMessage('这个手表有什么功能？'))
console.log(await handleCustomerMessage('价格是多少？'))
console.log(await handleCustomerMessage('能防水吗？'))
```

---

### 案例2：代码审查助手

```typescript
import { ChatOpenAI } from '@langchain/openai'
import { LLMChain } from 'langchain/chains'
import { PromptTemplate } from '@langchain/core/prompts'

const llm = new ChatOpenAI({ model: 'gpt-4' })

const prompt = PromptTemplate.fromTemplate(`
你是一位资深的React代码审查专家。

任务：审查以下代码，找出所有问题并提供改进建议

代码：
\`\`\`tsx
{code}
\`\`\`

请按以下JSON格式输出：
\`\`\`json
{{
  "summary": "代码整体评价",
  "score": "评分(0-100)",
  "issues": [
    {{
      "type": "问题类型",
      "severity": "high/medium/low",
      "description": "问题描述",
      "fix": "修复建议"
    }}
  ]
}}
\`\`\`
`)

const chain = new LLMChain({ llm, prompt })

async function reviewCode(code: string) {
  const result = await chain.call({ code })
  return JSON.parse(result.text)
}

// 使用
const code = `
const [count, setCount] = useState()
useEffect(() => {
  setCount(count + 1)
})
`

const review = await reviewCode(code)
console.log(review)
```

---

### 案例3：RAG 知识库问答

```typescript
import { ChatOpenAI } from '@langchain/openai'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Chroma } from '@langchain/community/vectorstores/chroma'
import { RetrievalQA } from 'langchain/chains'
import { PromptTemplate } from '@langchain/core/prompts'

// 1. 准备文档
const documents = [
  'React是由Facebook开发的前端框架，用于构建用户界面。',
  'Vue是由尤雨溪开发的前端框架，特点是渐进式、易上手。',
  'Angular是由Google开发的前端框架，特点是功能完整、适合大型项目。'
]

// 2. 创建向量存储
const embeddings = new OpenAIEmbeddings()
const vectorStore = await Chroma.fromTexts(
  documents,
  [{}, {}, {}],
  embeddings
)

// 3. 创建RAG链
const prompt = PromptTemplate.fromTemplate(`
基于以下文档回答问题：

{context}

问题：{question}

如果文档中没有答案，请明确说明。
`)

const chain = RetrievalQA.fromChainType({
  llm: new ChatOpenAI({ model: 'gpt-4' }),
  retriever: vectorStore.asRetriever(2),
  returnSourceDocuments: true,
  chainType: 'stuff',
  prompt
})

// 4. 查询
async function query(question: string) {
  const result = await chain.invoke({ query: question })
  return {
    answer: result.result,
    sources: result.sourceDocuments.map(doc => doc.pageContent)
  }
}

// 测试
console.log(await query('Vue是谁开发的？'))
console.log(await query('Angular适合什么项目？'))
```

---

### 案例4：AI Agent - 自动研究

```typescript
import { ChatOpenAI } from '@langchain/openai'
import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'

// 1. 定义工具
const searchTool = new DynamicStructuredTool({
  name: 'web_search',
  description: '搜索互联网信息',
  schema: z.object({
    query: z.string().describe('搜索关键词')
  }),
  func: async ({ query }) => {
    // 实际项目中调用搜索API
    return `搜索结果：${query} 相关信息...`
  }
})

const summarizeTool = new DynamicStructuredTool({
  name: 'summarize',
  description: '总结文本内容',
  schema: z.object({
    text: z.string().describe('要总结的文本')
  }),
  func: async ({ text }) => {
    const llm = new ChatOpenAI({ model: 'gpt-4' })
    const response = await llm.invoke(`总结以下内容：${text}`)
    return response.content as string
  }
})

// 2. 创建Agent
const llm = new ChatOpenAI({ model: 'gpt-4' })
const executor = await initializeAgentExecutorWithOptions(
  [searchTool, summarizeTool],
  llm,
  {
    agentType: 'zero-shot-react-description',
    verbose: true
  }
)

// 3. 使用
async function research(topic: string) {
  const result = await executor.invoke({
    input: `研究${topic}，并总结关键信息`
  })
  return result.output
}

// 测试
console.log(await research('React 19的新特性'))
```

---

## 四、高级功能

### 4.1 自定义链

```typescript
import { Chain } from 'langchain/chains'

class CustomChain extends Chain {
  inputVariables = ['input']
  outputVariables = ['output']

  llm: BaseChatModel
  prompt: PromptTemplate

  constructor(llm: BaseChatModel, prompt: PromptTemplate) {
    super()
    this.llm = llm
    this.prompt = prompt
  }

  async _call(values: ChainValues) {
    const promptValue = await this.prompt.format(values)
    const response = await this.llm.invoke(promptValue)
    return { output: response.content }
  }
}

// 使用
const customChain = new CustomChain(llm, prompt)
const result = await customChain.call({ input: '测试' })
```

---

### 4.2 流式输出

```typescript
const stream = await llm.stream('写一首诗')

for await (const chunk of stream) {
  process.stdout.write(chunk.content)
}
```

---

### 4.3 错误处理

```typescript
import { RunnableSequence } from '@langchain/core/runnables'

const chain = RunnableSequence.from([
  prompt,
  llm,
  {
    // 错误处理
    parse: async (output) => {
      try {
        return JSON.parse(output.content as string)
      } catch (e) {
        return { error: '解析失败', raw: output }
      }
    }
  }
])

try {
  const result = await chain.invoke({ input: '测试' })
} catch (e) {
  console.error('链执行失败:', e)
}
```

---

## 五、LangChain 表达式语言（LCEL）

### 5.1 什么是 LCEL？

LCEL = LangChain Expression Language

**优势：**
- 声明式，更易理解
- 支持流式处理
- 内置并行
- 易于调试

---

### 5.2 基本用法

**简单链**

```typescript
import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { RunnableSequence } from '@langchain/core/runnables'

const prompt = PromptTemplate.fromTemplate('你是一位{role}专家，回答：{input}')
const llm = new ChatOpenAI({ model: 'gpt-4' })

// LCEL方式
const chain = RunnableSequence.from([
  prompt,
  llm
])

// 使用
const result = await chain.invoke({
  role: '前端',
  input: 'React是什么？'
})
```

---

### 5.3 复杂组合

```typescript
const chain = RunnableSequence.from([
  {
    // 并行处理
    question: (input: { question: string }) => input.question,
    context: retriever.pipe(docs => docs.map(d => d.pageContent).join('\n'))
  },
  prompt,
  llm,
  new StringOutputParser()
])
```

---

## 六、最佳实践

### 6.1 提示词管理

```typescript
// prompts/code-review.ts
export const CODE_REVIEW_PROMPT = PromptTemplate.fromTemplate(`
你是一位代码审查专家。

代码：
\`\`\`
{code}
\`\`\`

要求：
- 检查React Hooks使用
- 检查性能问题
- 检查代码规范

输出格式：JSON
`)

// 使用
import { CODE_REVIEW_PROMPT } from './prompts/code-review'
const chain = new LLMChain({ llm, prompt: CODE_REVIEW_PROMPT })
```

---

### 6.2 配置管理

```typescript
// config/llm.ts
export const createLLM = () => {
  return new ChatOpenAI({
    model: process.env.OPENAI_MODEL || 'gpt-4',
    temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.MAX_TOKENS || '2000'),
    openAIApiKey: process.env.OPENAI_API_KEY
  })
}
```

---

### 6.3 错误重试

```typescript
import { RetryError } from 'langchain/commands'

const chain = new LLMChain({
  llm,
  prompt,
  callbacks: [
    {
      handleLLMError: async (error) => {
        if (error instanceof RetryError) {
          console.log('重试中...')
        }
      }
    }
  ]
})
```

---

### 6.4 性能优化

```typescript
// 1. 使用缓存
import { ChatOpenAI } from '@langchain/openai'
import { InMemoryCache } from 'langchain/cache'

const cache = new InMemoryCache()
const llm = new ChatOpenAI({ cache })

// 2. 流式输出
const stream = await chain.stream(input)

// 3. 并行处理
const results = await Promise.all([
  chain1.invoke(input),
  chain2.invoke(input)
])
```

---

## 七、学习路径

### 第1周：基础概念

- Models（LLM、Embeddings）
- Prompts（PromptTemplate）
- Chains（LLMChain）
- Memory（BufferMemory）

**实践：**
- 创建简单的对话链
- 实现带记忆的聊天机器人

---

### 第2周：进阶功能

- Retrievers（向量检索）
- RAG（检索增强生成）
- Agents（智能体）
- Tools（自定义工具）

**实践：**
- 构建知识库问答系统
- 开发代码审查Agent

---

### 第3周：高级应用

- LCEL（表达式语言）
- 自定义链
- Callbacks（回调）
- 错误处理

**实践：**
- 开发完整的AI应用
- 实现流式输出

---

### 第4周：项目实战

- 项目架构设计
- 性能优化
- 部署上线

**实践：**
- 完成一个完整的AI应用项目

---

## 八、常用资源

### 官方文档
- LangChain.js: https://js.langchain.com
- LangChain Python: https://python.langchain.com

### 示例项目
- LangChain Templates: https://github.com/langchain-ai/langchain/tree/master/templates
- Vercel AI SDK Examples: https://sdk.vercel.ai/examples

### 社区
- Discord: https://discord.gg/langchain
- GitHub: https://github.com/langchain-ai/langchainjs

---

## 九、常见问题

### Q1: LangChain vs 直接调用API？

**A:** LangChain的优势：
- ✅ 简化复杂逻辑
- ✅ 提供组件化能力
- ✅ 内置最佳实践
- ✅ 生态丰富

**直接调用API适合：**
- 简单的对话场景
- 需要极致性能
- 定制化需求高

---

### Q2: LangChain.js 性能如何？

**A:**
- 对于简单应用，性能足够
- 复杂链可能有开销
- 可以用LCEL优化
- 生产环境需要压测

---

### Q3: 如何选择模型？

**A:**
- GPT-4：复杂任务，质量优先
- GPT-3.5：一般任务，成本优先
- Claude：长文本，特定场景

---

### Q4: 如何控制成本？

**A:**
1. 使用缓存
2. 限制Token数量
3. 选择合适的模型
4. 优化提示词

---

## 十、总结

### 核心要点

1. **LangChain = 大模型应用框架**
   - 组件化开发
   - 简化复杂逻辑
   - 丰富的生态系统

2. **核心模块**
   - Models（模型）
   - Prompts（提示词）
   - Chains（链）
   - Memory（记忆）
   - Agents（智能体）
   - Retrievers（检索器）

3. **最佳实践**
   - 提示词模板化
   - 配置管理
   - 错误处理
   - 性能优化

4. **学习建议**
   - 从简单链开始
   - 逐步学习高级功能
   - 多做实战项目
   - 参考官方示例

---

*文档版本：v1.0*
*最后更新：2026-01-30*
