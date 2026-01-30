import { ChatXunfei } from "@/lib/xunfei-llm"
import { HumanMessage, AIMessage } from "@langchain/core/messages"

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json()

    const encoder = new TextEncoder()

    if (!process.env.XUNFEI_API_KEY || !process.env.XUNFEI_API_URL) {
      return new Response(
        JSON.stringify({ error: "Missing Xunfei API credentials" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const llm = new ChatXunfei({
      apiKey: process.env.XUNFEI_API_KEY,
      apiUrl: process.env.XUNFEI_API_URL,
      model: "xop3qwen1b7",
      temperature: 0.7,
      maxTokens: 2048,
    })

    const messages = (history || []).map(
      (msg: { role: string; content: string }) => {
        return msg.role === "user"
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      },
    )
    messages.push(new HumanMessage(message))

    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log("开始流式响应 (使用 _stream 方法)...")
          const streamResponse = await (llm as any)._stream(messages)

          let chunkCount = 0
          for await (const chunk of streamResponse) {
            const content = chunk.text ?? chunk.content ?? ""
            if (content) {
              chunkCount++
              console.log(`收到第 ${chunkCount} 个 chunk:`, content)
              const data = `data: ${JSON.stringify({ content })}\n\n`
              controller.enqueue(encoder.encode(data))
              console.log("已发送:", data.trim())
            }
          }

          console.log(`流式响应结束，共收到 ${chunkCount} 个 chunk`)
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (error) {
          console.error("流式响应错误:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
