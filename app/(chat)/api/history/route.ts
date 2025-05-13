import { getChatsByUserId } from '@/lib/db/queries';

export async function GET() {
  try {
    // 尝试获取聊天历史
    const chats = await getChatsByUserId({ id: 'demo-user' });
    return Response.json(chats);
  } catch (error) {
    console.error('获取聊天历史失败:', error);
    // 返回空数组，而不是让请求失败
    return Response.json([], { status: 200 });
  }
}
