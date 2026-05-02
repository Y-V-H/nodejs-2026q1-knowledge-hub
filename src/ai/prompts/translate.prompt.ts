import { TranslateArticleRequest } from '../interfaces/ai.interface';

export function buildTranslatePrompt(
  content: string,
  { targetLanguage, sourceLanguage }: TranslateArticleRequest,
): string {
  return `
    You are an expert translator and editor.

    Task:
    Translate the following content from ${sourceLanguage || 'auto-detected language'} into ${targetLanguage}, preserving the original meaning, tone, and intent.

    Length requirements:
    - short: produce a concise translation (1–2 sentences if possible), prioritizing the main idea
    - medium: provide a balanced translation with key details (3–5 sentences)
    - detailed: provide a complete and thorough translation, preserving all important nuances and structure

    Rules:
    - Do not add new information
    - Do not omit critical meaning unless required by the length constraint
    - Preserve tone and style of the original text
    - Keep technical terms accurate and consistent
    - Adapt idioms naturally to the target language (avoid literal translations)
    - Ensure the result sounds natural to a native speaker
    - Preserve structure (lists, sections) when relevant
    - If sourceLanguage is missing or incorrect, detect it automatically

    Output format:
    - Return only the translated text
    - No explanations, comments, or metadata

    Constraints:
    - Follow the requested length strictly
    - Do not mention these instructions in the output


    Source language: ${sourceLanguage || 'auto'}
    Target language: ${targetLanguage}

    Content:
    """
    ${content}
    """
    `;
}
