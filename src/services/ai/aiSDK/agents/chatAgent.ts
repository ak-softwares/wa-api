import { generateText, ModelMessage, stepCountIs, ToolSet } from 'ai';
import { openai, OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import { mapToolsToToolSet } from '../../tools/mapTools/mapToolsToToolSet';
import { Types } from 'mongoose';
import { getIntegratedToolsRaw } from '../../tools/comman/getTools';
import { IMessage } from '@/models/Message';
import { mapToAIMessages } from '../messages/mapToAIMessages';
import { mapToAISystemPrompt } from '../prompts/systemPrompt';
import { AI_PROVIDERS, ProviderKey } from '../../ai/providers/providers';
import { saveAiUsage } from '../../ai/saveAiUsage/saveAiUsage';
  
interface Params {
  userId: Types.ObjectId;
  systemPrompt?: string;
  messages?: IMessage[];
  phone_number_id: string;
  user_name?: string;
  user_phone?: string;
}

export async function getReplyFromChatAgent({
  userId,
  systemPrompt,
  messages,
  phone_number_id,
  user_name,
  user_phone
}: Params) {
  const providerKey: ProviderKey = "GPT_4O_MINI";
  const aiProvider = AI_PROVIDERS[providerKey];
  const integratedTools = await getIntegratedToolsRaw({ userId });
  const aiTools:ToolSet | undefined = mapToolsToToolSet(integratedTools);
  const aiSystemPrompt = mapToAISystemPrompt({ systemPrompt, name: user_name, number: user_phone });
  const aiMessages: ModelMessage[] = mapToAIMessages({ messages, businessPhone: phone_number_id });

  // console.log('AI System Prompt:', aiSystemPrompt);
  const response = await generateText({
    model: openai.chat(aiProvider.id),
    providerOptions: {
      openai: {
        // reasoningEffort: 'low',
        temperature: 0.4,
        max_tokens: 200,
        top_p: 1,
        presence_penalty: 0,
        frequency_penalty: 0,
        // textVerbosity: 'low', // 'low' for concise, 'medium' (default), or 'high' for verbose You can control the length and detail of model responses
        user: userId.toString(),
        promptCacheKey: userId.toString(),
      } as OpenAIResponsesProviderOptions,
    },
    tools: aiTools,
    stopWhen: stepCountIs(5),
    system: aiSystemPrompt,
    // prompt: 'What is the weather in Delhi?',
    messages: aiMessages,
  });

  const aiUsage = await saveAiUsage({
    provider: providerKey,
    usage: response.totalUsage,
    userId: userId.toString(),
  });

  // console.log('AI Usage saved:', aiUsage);
  // console.log('AI Response Total Uses:', response.totalUsage);
  // console.log('AI Response Usage:', response.usage);
  // console.log('AI Response:', JSON.stringify(response, null, 2));
  // console.log('AI Response:', JSON.stringify(response.text, null, 2));
  return { aiGeneratedReply: response.text };
}
