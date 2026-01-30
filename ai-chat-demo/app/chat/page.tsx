"use client"

import { useState, useRef } from "react"
import Link from "next/link"

interface Message {
  role: "user" | "assistant"
  content: string
  id: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messageIdRef = useRef(0)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input
    const userId = `msg-${messageIdRef.current++}`
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, id: userId },
    ])
    setInput("")
    setIsLoading(true)

    try {
      const history = messages.map(({ role, content }) => ({ role, content }))

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history }),
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      let assistantMessage = ""
      const assistantId = `msg-${messageIdRef.current++}`

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", id: assistantId },
      ])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)
                assistantMessage += parsed.content || ""

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, content: assistantMessage }
                      : msg,
                  ),
                )
              } catch (e) {
                console.error("Parse error:", e)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error)
      const errorId = `msg-${messageIdRef.current++}`
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "抱歉，发生了错误，请重试。",
          id: errorId,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="max-w-4xl mx-auto flex flex-col"
        style={{ height: "100vh" }}
      >
        <header className="bg-white border-b p-4">
          <Link href="/" className="text-gray-600 hover:text-gray-800">
            ← 返回首页
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-xl mb-2">💬 开始聊天</p>
              <p>输入消息开始对话</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 shadow"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t bg-white p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="输入消息..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
