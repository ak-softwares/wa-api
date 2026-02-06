import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getIntegratedToolsRaw } from '../../tools/getTools';
import { ITool } from '@/models/Tool';
import { mapToolsToMcpTools } from '../../tools/mapToolsToMcpTools';
import { Types } from 'mongoose';
import z from 'zod';

// Creates MCP server that exposes: integrated tools as MCP tools
interface Params {
 userId: Types.ObjectId;
}

export async function createMcpServer({ userId }: Params) {
  
  const server = new McpServer({
    name: 'wa-api-agent',
    version: '1.0.0',
  });

  /* -----------------------------------------
     Load DB integrations (woocommerce/shopify)
  ----------------------------------------- */
  const integratedTools: ITool[] = await getIntegratedToolsRaw({ userId });
  mapToolsToMcpTools(server, integratedTools);

  server.registerPrompt(
    "order-tracking",
    {
      title: "Track an order",
      description: "Guide through order tracking process",

      argsSchema: {
        orderId: z.string(),
      },
    },

    async (args, _extra) => {
      const { orderId } = args;

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text", // ✅ required
              text: `
  Track order ${orderId}
              `,
            },
          },
        ],
      };
    }
  );

  return server;
}
