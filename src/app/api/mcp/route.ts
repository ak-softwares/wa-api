import { NextRequest } from 'next/server';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createMcpServer } from '@/services/ai/mcp/mcpServer/mcpServer';
import { fetchAuthenticatedUser } from '@/services/apiHelper/getDefaultWaAccount';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { user, errorResponse } = await fetchAuthenticatedUser(req);
  if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

  const server = await createMcpServer({ userId: user.id });

  const transport = new WebStandardStreamableHTTPServerTransport();

  await server.connect(transport);

  return transport.handleRequest(req); // ✅ only 1 arg now
}
