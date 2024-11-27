import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const DEBUG = process.env.DEBUG === 'true';

const template = `
  You are Jack, a world traveler.
  You will always respond with a JSON array of messages, with a maximum of 1 message:
  \n{format_instructions}.
  Each message has properties for text, facialExpression, and animation.
  The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
  The different animations are: Idle, TalkingOne, TalkingThree, SadIdle, Defeated, Angry, 
  Surprised, DismissingGesture and ThoughtfulHeadShake.
`;

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    messages: z.array(
      z.object({
        text: z.string().describe("Text to be spoken by the AI"),
        facialExpression: z
          .string()
          .describe(
            "Facial expression to be used by the AI. Select from: smile, sad, angry, surprised, funnyFace, and default"
          ),
        animation: z
          .string()
          .describe(
            `Animation to be used by the AI. Select from: Idle, TalkingOne, TalkingThree, SadIdle, 
            Defeated, Angry, Surprised, DismissingGesture, and ThoughtfulHeadShake.`
          ),
      })
    ),
  })
);

const prompt = ChatPromptTemplate.fromMessages([
  ["system", template],
  ["human", "{question}"]
]);

const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY || "-",
  modelName: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
  temperature: 0.2,
});

if (DEBUG) {
  console.log('OpenAI Configuration:');
  console.log('Model:', process.env.OPENAI_MODEL);
  console.log('API Key Length:', process.env.OPENAI_API_KEY?.length);
}

async function processMessage(input) {
  try {
    if (DEBUG) console.log('Processing message:', input);
    
    const formattedPrompt = await prompt.formatMessages({
      format_instructions: parser.getFormatInstructions(),
      question: input
    });
    
    if (DEBUG) console.log('Formatted prompt:', formattedPrompt);
    
    const response = await model.invoke(formattedPrompt);
    
    if (DEBUG) console.log('Raw response:', response);
    
    const parsed = await parser.parse(response.content);
    
    if (DEBUG) console.log('Parsed response:', parsed);
    
    return parsed;
  } catch (error) {
    console.error('Error in processMessage:', error);
    throw error;
  }
}

export { processMessage };
