import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ACTION_REGISTRY } from './actionRegistry';
import { ITool } from '@/models/Tool';
import { ActionConfig } from '@/types/Tool';

export function mapToolsToMcpTools(server: McpServer, tools: ITool[]) {
  for (const dbTool of tools) {
    // only connected tools
    if (!dbTool.active || dbTool.status !== 'connected') continue;
    const actions: Record<string, ActionConfig> | undefined = ACTION_REGISTRY[dbTool.id];
    if (!actions) continue;

    for (const [actionId, config] of Object.entries(actions)) {
      const toolName = `${dbTool.id}_${actionId}`;
      server.registerTool(
        toolName,
        {
          title: config.title ?? toolName,
          description:
            config.description ??
            `Action "${actionId}" for ${dbTool.name}`,
          inputSchema: config.schema,
        },

        // ✅ handler
        async (args: any) => {
          const result = await config.execute(args, dbTool);

          return {
            content: [
              {
                type: 'text',
                text:
                  typeof result === 'string'
                    ? result
                    : JSON.stringify(result, null, 2),
              },
            ],
          };
        }
      );
    }
  }
}


// server.registerTool(
//     "get-forecast",
//     {
//       title: "Get Weather Forecast",
//       description: "Returns demo weather data (mock forecast)",
//       inputSchema: {
//         latitude: z.number().describe("Latitude"),
//         longitude: z.number().describe("Longitude"),
//       },
//     },
//     async ({ latitude, longitude }) => {
//       // ✅ Fake demo data (no API request)
//       const forecast = {
//         temperature: 28,
//         condition: "Sunny",
//         humidity: 62,
//         windSpeed: 12,
//       };

//       return {
//         content: [
//           {
//             type: "text",
//             text: `📍 Location: ${latitude}, ${longitude}
//   🌡 Temperature: ${forecast.temperature}°C
//   ☀️ Condition: ${forecast.condition}
//   💧 Humidity: ${forecast.humidity}%
//   🌬 Wind Speed: ${forecast.windSpeed} km/h

//   (This is demo/mock data)`,
//           },
//         ],
//       };
//     }
//   );