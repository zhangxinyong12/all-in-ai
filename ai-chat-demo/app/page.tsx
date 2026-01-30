import Link from "next/link"

export default function Home() {
  const apps = [
    {
      id: "chat",
      name: "AI聊天",
      description: "与AI进行对话交流",
      icon: "💬",
      path: "/chat",
    },
    {
      id: "code",
      name: "代码助手",
      description: "代码编写和优化建议",
      icon: "💻",
      path: "/chat?app=code",
    },
    {
      id: "translation",
      name: "翻译助手",
      description: "多语言翻译服务",
      icon: "🌐",
      path: "/chat?app=translation",
    },
  ]

  return (
    <main
      className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
      suppressHydrationWarning
    >
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">AI 应用中心</h1>
          <p className="text-gray-600 text-lg">选择一个应用开始体验</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Link
              key={app.id}
              href={app.path}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-6 cursor-pointer border border-gray-100 block"
            >
              <div className="text-5xl mb-4">{app.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {app.name}
              </h3>
              <p className="text-gray-600">{app.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
