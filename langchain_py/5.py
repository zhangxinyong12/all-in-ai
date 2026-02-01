from langchain_community.embeddings import DashScopeEmbeddings

from dotenv import load_dotenv

load_dotenv()

embeddings = DashScopeEmbeddings(
  model="text-embedding-v3"
)

s1= embeddings.embed_query("你好")
s2= embeddings.embed_query("你好,你的名字是？")

print(s1)
# print(s2)

# a1= embeddings.embed_documents([
#     "你好",
#     "你好,你的名字是？"
# ])

# print(a1)

