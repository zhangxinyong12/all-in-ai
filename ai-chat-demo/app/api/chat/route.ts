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
      model: "generalv3.5",
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
          const streamResponse = await llm.stream(messages)

          for await (const chunk of streamResponse) {
            const content = chunk.content ?? ""
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`),
              )
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
