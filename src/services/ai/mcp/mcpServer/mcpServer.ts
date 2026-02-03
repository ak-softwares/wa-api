import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getIntegratedToolsRaw } from '../../tools/getTools';
import { ITool } from '@/models/Tool';
import { mapToolsToMcpTools } from '../../tools/mapToolsToMcpTools';
import { Types } from 'mongoose';

// Creates MCP server that exposes: integrated tools as MCP tools
interface Params {
 userId: Types.ObjectId;
}

export async function createMcpServer({ userId }: Params) {
  
  const server = new McpServer({
    name: 'whatsapp-agent',
    version: '1.0.0',
  });

  /* -----------------------------------------
     Load DB integrations (woocommerce/shopify)
  ----------------------------------------- */
  const integratedTools: ITool[] = await getIntegratedToolsRaw({ userId });
  mapToolsToMcpTools(server, integratedTools);

  return server;
}
