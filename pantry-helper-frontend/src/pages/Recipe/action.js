"use server";

import { ChatOpenAI } from "@langchain/openai";

const chatModel = new ChatOpenAI({
  apiKey:
    "",
});

export async function generateRecipes(prompt) {
  prompt = `Generate one recipe for a ${prompt} dish. The output should be in JSON array and  each object should contain a recipe name field named 'name', description field named 'description', array of ingredients and their measurements (e.g. "Sugar: 1 Teaspoon") named 'ingredients', and array of step by step instructions with measurements named 'instructions'`;

  const response = await chatModel.invoke(prompt);

  return JSON.parse(response.content);
}
