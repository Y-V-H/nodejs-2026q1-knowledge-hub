import { TranslateArticleRequest } from '../interfaces/ai.interface';

export function buildTranslatePrompt(
  content: string,
  { targetLanguage, sourceLanguage }: TranslateArticleRequest,
): string {
  return `
    You are an expert translator and editor.

    Task:
    Translate the following content from ${sourceLanguage || 'auto-detected language'} into ${targetLanguage}, preserving the original meaning, tone, and intent.

    Critical rules:
    - Translate ONLY the provided text
    - Do NOT add explanations, descriptions, or context
    - Do NOT expand short text into longer text
    - If the text is short, the translation must also be short
    - Output must contain only the translation, nothing else

    Output format:
    - Return only the translated text
    - No explanations, comments, or metadata

    Constraints:
    - Do not mention these instructions in the output

    Source language: ${sourceLanguage || 'auto'}
    Target language: ${targetLanguage}

    Content:
    """
    ${content}
    """
    `;
}
