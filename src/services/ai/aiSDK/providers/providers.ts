// import { openai } from '@ai-sdk/openai';
// import type { GenerateTextOptions } from 'ai';

// export type ProviderKey =
//   | 'cheap'       // default whatsapp
//   | 'balanced'    // better quality
//   | 'smart';      // heavy reasoning

// export const AI_PROVIDERS: Record<ProviderKey, Partial<GenerateTextOptions>> = {
//   /*
//    * 💸 Cheapest + fastest (recommended for WhatsApp)
//    */
//   cheap: {
//     model: openai.chat('gpt-4o-mini'),

//     temperature: 0.3,
//     maxTokens: 120,
//     topP: 0.9,
//     frequencyPenalty: 0.2,

//     stopWhen: undefined, // set later if needed

//     providerOptions: {
//       openai: {
//         user: '',
//       },
//     },
//   },

//   /*
//    * ⚖️ Better language quality
//    */
//   balanced: {
//     model: openai.chat('gpt-4o'),

//     temperature: 0.4,
//     maxTokens: 200,
//     topP: 0.95,
//   },

//   /*
//    * 🧠 Heavy reasoning (analytics, complex tasks)
//    */
//   smart: {
//     model: openai.chat('o3-mini'),

//     temperature: 0.2,
//     maxTokens: 500,
//   },
// };
