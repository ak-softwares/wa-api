import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { createMCPClient } from '@ai-sdk/mcp';
import z from 'zod';

const urlString = 'http://localhost:3000/api/ai/mcp';
const url = new URL(urlString);
const transport = new StreamableHTTPClientTransport(url, {
  // sessionId: 'session_123',
  // headers: {
  //   Authorization: 'Bearer wa_agent_xxx',
  // },
});

const transport1 = new StdioClientTransport({
  command: 'node',
  args: ['src/stdio/dist/server.js'],
});

const transport2 = {
  type: 'http',
  url: urlString,

  // optional: configure HTTP headers
  headers: { Authorization: `Bearer ${process.env.WA_API_TOKEN}` },

  // optional: provide an OAuth client provider for automatic authorization
  // authProvider: myOAuthClientProvider,
} as const;

const mcpClient = await createMCPClient({
  transport: transport2,
});

const resources = await mcpClient.listResources();

// Read the contents of a specific resource by its URI:
const resourceData = await mcpClient.readResource({
  uri: 'file:///example/document.txt',
});


const templates = await mcpClient.listResourceTemplates();

// Listing Prompts
const prompts = await mcpClient.experimental_listPrompts();

// Retrieve prompt messages, optionally passing arguments defined by the server:
const prompt = await mcpClient.experimental_getPrompt({
  name: 'code_review',
  arguments: { code: 'function add(a, b) { return a + b; }' },
});


const mcpTools = await mcpClient.tools();
// console.log(mcpTools);

const tools = await mcpClient.tools({
  schemas: {
    'get-data': {
      inputSchema: z.object({
        query: z.string().describe('The data query'),
        format: z.enum(['json', 'text']).optional(),
      }),
    },
    // For tools with zero inputs, you should use an empty object:
    'tool-with-no-args': {
      inputSchema: z.object({}),
    },
  },
});

const tools1 = await mcpClient.tools({
  schemas: {
    'get-weather': {
      inputSchema: z.object({
        location: z.string(),
      }),
      // Define outputSchema for typed results
      outputSchema: z.object({
        temperature: z.number(),
        conditions: z.string(),
        humidity: z.number(),
      }),
    },
  },
});


//   const response = await generateText({
//     model: 'openai/gpt-4o',
//     tools,
//     stopWhen: stepCountIs(5),
//     messages: [
//       {
//         role: 'user',
//         content: [{ type: 'text', text: 'Find products under $100' }],
//       },
//     ],
//   });

  // clientOne.close(),


  

// await fetch('http://localhost:3000/api/ai/mcp', {
//   method: 'POST',
//   headers: {
//     Accept: 'application/json, text/event-stream',
//     'Content-Type': 'application/json',
//     Authorization: 'Bearer wa_agent_7827694a494613f80aacb4052e62f484dbbacffe9d22121c5b342c34547b69da',
//   },
//   body: '{}',
// });
// await fetch('http://localhost:3000/api/ai/mcp', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json, text/event-stream',
//     'Authorization': 'Bearer wa_agent_7827694a494613f80aacb4052e62f484dbbacffe9d22121c5b342c34547b69da'
//   },
//   body: JSON.stringify({
//     jsonrpc: '2.0',
//     id: '1',
//     method: 'tools/list',
//     params: {}
//   })
// }).then(r => r.text()).then(console.log);

// await fetch('http://localhost:3000/api/ai/mcp', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json, text/event-stream',
//     'Authorization': 'Bearer wa_agent_7827694a494613f80aacb4052e62f484dbbacffe9d22121c5b342c34547b69da'
//   },
//   body: JSON.stringify({
//     jsonrpc: '2.0',
//     id: '2',
//     method: 'tools/call',
//     params: {
//       name: 'get_order',
//       arguments: {
//         orderId: '57529'
//       }
//     }
//   })
// }).then(r => r.text()).then(console.log);


// await fetch('http://localhost:3000/api/ai/mcp', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json, text/event-stream',
//     'Authorization': 'Bearer wa_agent_7827694a494613f80aacb4052e62f484dbbacffe9d22121c5b342c34547b69da'
//   },
//   body: JSON.stringify({
//     jsonrpc: '2.0',
//     id: '3',
//     method: 'tools/call',
//     params: {
//       name: 'search_products',
//       arguments: {
//         query: 'soldering iron',
//         limit: 5
//       }
//     }
//   })
// }).then(r => r.text()).then(console.log);
