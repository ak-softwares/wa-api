// import { generateText, stepCountIs, streamText, tool } from 'ai';
// import { createMCPClient } from '@ai-sdk/mcp';
// import { z } from 'zod';
// import { toolExecutors } from '../aiSDK/tools/executors';
// import { ITool } from '@/models/Tool';
// import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
// import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
// import { openai } from '@ai-sdk/openai';
// // Or use the AI SDK's stdio transport:
// // import { Experimental_StdioMCPTransport as StdioClientTransport } from '@ai-sdk/mcp/mcp-stdio';
// // Optional: Official transports if you prefer them
// // import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio';
// // import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse';
// // import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp';

// const url = new URL('https://your-server.com/mcp');
// const transport = new StreamableHTTPClientTransport(url, {
//   sessionId: 'session_123',
// });

// const mcpClient1 = await createMCPClient({
//   transport: new StdioClientTransport({
//     command: 'node',
//     args: ['src/stdio/dist/server.js'],
//   }),
// });

// const mcpClient = await createMCPClient({
//   // transport,
//   transport: {
//     type: 'http',
//     url: 'https://your-server.com/mcp',

//     // optional: configure HTTP headers
//     headers: { Authorization: 'Bearer my-api-key' },

//     // optional: provide an OAuth client provider for automatic authorization
//     // authProvider: myOAuthClientProvider,
//   },
// });

// const resources = await mcpClient.listResources();

// const templates = await mcpClient.listResourceTemplates();

// // Read the contents of a specific resource by its URI:
// const resourceData = await mcpClient.readResource({
//   uri: 'file:///example/document.txt',
// });

// // Listing Prompts
// const prompts = await mcpClient.experimental_listPrompts();

// // Retrieve prompt messages, optionally passing arguments defined by the server:
// const prompt = await mcpClient.experimental_getPrompt({
//   name: 'code_review',
//   arguments: { code: 'function add(a, b) { return a + b; }' },
// });

// const mcpTools = await mcpClient.tools();

// const tools = await mcpClient.tools({
//   schemas: {
//     'get-data': {
//       inputSchema: z.object({
//         query: z.string().describe('The data query'),
//         format: z.enum(['json', 'text']).optional(),
//       }),
//     },
//     // For tools with zero inputs, you should use an empty object:
//     'tool-with-no-args': {
//       inputSchema: z.object({}),
//     },
//   },
// });

// const tools1 = await mcpClient.tools({
//   schemas: {
//     'get-weather': {
//       inputSchema: z.object({
//         location: z.string(),
//       }),
//       // Define outputSchema for typed results
//       outputSchema: z.object({
//         temperature: z.number(),
//         conditions: z.string(),
//         humidity: z.number(),
//       }),
//     },
//   },
// });

// // const result = await streamText({
// //   model: openai("gpt-5.2-codex"),
// //   tools: mcpTools,
// //   // tools: tools1,
// //   prompt: 'What is the weather in Brooklyn, New York?',
// //   onFinish: async () => {
// //     await mcpClient.close();
// //   },
// // });

// //   const response = await generateText({
// //     model: 'openai/gpt-4o',
// //     tools,
// //     stopWhen: stepCountIs(5),
// //     messages: [
// //       {
// //         role: 'user',
// //         content: [{ type: 'text', text: 'Find products under $100' }],
// //       },
// //     ],
// //   });

//   // clientOne.close(),

// export function buildMcpTools(tools: ITool[]) {
//   return tools
//     .filter(t => t.active && t.status === 'connected')
//     .map((dbTool) =>
//       tool({
//         description: `${dbTool.name} integration`,
//         inputSchema: getSchemaForTool(dbTool.id),
//         execute: async (args) => {
//           const executor = toolExecutors[dbTool.id];
//           if (!executor) {
//             throw new Error(`No executor for tool: ${dbTool.id}`);
//           }
//           return executor(args, dbTool);
//         },
//       })
//     );
// }

// function getSchemaForTool(toolId: string) {
//   switch (toolId) {
//     case 'webhook':
//       return z.object({
//         payload: z.any().describe('Payload to send to webhook'),
//       });

//     case 'woocommerce':
//       return z.object({
//         orderId: z.string().describe('WooCommerce Order ID'),
//       });

//     default:
//       return z.object({});
//   }
// }
