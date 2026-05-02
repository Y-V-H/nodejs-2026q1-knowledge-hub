import { SummarizeArticleRequest } from '../interfaces/ai.interface';

export function buildSummarizePrompt(
  content: string,
  maxLength: SummarizeArticleRequest,
): string {
  return `
    You are an expert summarization assistant.

    Task: Summarize the following content clearly and accurately.

    Length requirements:
    - short: 1–2 sentences maximum
    - medium: 3–5 sentences with key details
    - detailed: a structured summary covering main ideas and important nuances

    Rules:
    - Preserve key facts and original meaning
    - Remove fluff and repetition
    - Do not add new information
    - Use clear and neutral language
    - Preserve structure (lists, sections) when relevant
    - Preserve tone of the original text
    - If the content is technical — keep terminology
    - If unclear — prioritize main idea over details
    - Keep technical terminology if present
    - If the content is unclear, prioritize the main idea over minor details

    Output format:
    - Return only the final summary
    - Do not include explanations or meta commentary

    Requested length: ${maxLength}

    Content:
    """
    ${content}
    """
    `;
}
