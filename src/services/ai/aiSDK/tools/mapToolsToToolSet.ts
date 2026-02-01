import { tool, ToolSet } from 'ai';
import { ACTION_REGISTRY } from './actionRegistry';
import { ITool } from '@/models/Tool';

export function mapToolsToToolSet(tools: ITool[]): ToolSet {
  return tools
    .filter((t) => t.active && t.status === 'connected')
    .reduce<ToolSet>((acc, dbTool) => {
      const actions = ACTION_REGISTRY[dbTool.id];

      if (!actions) return acc;

      Object.entries(actions).forEach(([actionId, config]) => {
        acc[actionId] = tool({
          description: `${actionId.replaceAll('_', ' ')} (${dbTool.id})`,
          inputSchema: config.schema,

          execute: async (args) => {
            return config.execute(args, dbTool); // pass integration
          },
        });
      });

      return acc;
    }, {});
}
