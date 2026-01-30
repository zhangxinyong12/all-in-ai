import {
  BaseChatModel,
  type BaseChatModelParams,
} from "@langchain/core/language_models/chat_models"
import { ChatGenerationChunk, type ChatResult } from "@langchain/core/outputs"
import {
  BaseMessage,
  HumanMessage,
  AIMessage,
  AIMessageChunk,
} from "@langchain/core/messages"
import type { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager"

interface XunfeiInput extends BaseChatModelParams {
  apiKey?: string
  apiUrl?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export class ChatXunfei extends BaseChatModel {
  apiKey: string
  apiUrl: string
  model: string
  temperature: number
  maxTokens: number

  constructor(fields: XunfeiInput = {}) {
    super(fields)

    this.apiKey = fields.apiKey ?? process.env.XUNFEI_API_KEY ?? ""
    this.apiUrl =
      fields.apiUrl ??
      process.env.XUNFEI_API_URL ??
      "https://maas-api.cn-huabei-1.xf-yun.com/v1"
    this.model = "xop3qwen1b7"
    this.temperature = fields.temperature ?? 0.7
    this.maxTokens = fields.maxTokens ?? 2048
  }

  _llmType(): string {
    return "xunfei"
  }

  async _stream(
    messages: BaseMessage[],
    _options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun,
  ): Promise<AsyncGenerator<ChatGenerationChunk>> {
    const messageText = messages
      .map((msg) => {
        if (msg instanceof HumanMessage)
          return { role: "user", content: msg.content }
        if (msg instanceof AIMessage)
          return { role: "assistant", content: msg.content }
        return null
      })
      .filter((msg): msg is { role: string; content: string } => msg !== null)

    const requestBody = {
      model: this.model,
      messages: messageText,
      stream: true,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
    }

    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Xunfei API error: ${response.status} - ${errorText}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    async function* streamGenerator(): AsyncGenerator<ChatGenerationChunk> {
      if (!reader) return

      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine || trimmedLine.startsWith("data: [DONE]")) continue

          if (trimmedLine.startsWith("data: ")) {
            const data = trimmedLine.slice(6)
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                const chunk = new ChatGenerationChunk({
                  message: new AIMessageChunk(content),
                  text: content,
                })
                yield chunk
              }
            } catch (e) {
              console.error("Parse error:", e)
            }
          }
        }
      }
    }

    return streamGenerator()
  }

  async _generate(
    messages: BaseMessage[],
    _options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun,
  ): Promise<ChatResult> {
    let fullContent = ""

    const stream = await this._stream(messages, {}, runManager)
    for await (const chunk of stream) {
      fullContent += chunk.text ?? ""
    }

    const generations = [
      {
        message: new AIMessage(fullContent),
        text: fullContent,
      },
    ]

    return { generations, llmOutput: {} }
  }
}
