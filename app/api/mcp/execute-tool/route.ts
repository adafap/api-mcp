import { type NextRequest, NextResponse } from 'next/server';
import { getAPIMCPServer } from '@/lib/mcp/server';

export async function POST(request: NextRequest) {
  try {
    const { toolId, params } = await request.json();

    if (!toolId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少工具ID',
          message: '执行工具失败',
        },
        { status: 400 },
      );
    }

    const mcpServer = getAPIMCPServer();
    const result = await mcpServer.executeTool(toolId, params || {});

    return NextResponse.json(result);
  } catch (error) {
    console.error('执行MCP工具失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '执行MCP工具时出错',
        message: '执行工具失败',
      },
      { status: 500 },
    );
  }
}
