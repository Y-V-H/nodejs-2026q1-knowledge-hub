import { AnalyzeArticleType } from '../interfaces/ai.interface';

export function buildAnalyzeArticlePrompt(
  content: string,
  task: AnalyzeArticleType,
) {
  return `
    You are an expert content analyst and reviewer.

    Task:
    Analyze the following article and provide insights based on the requested task.

    Analysis type:
    ${task}

    Guidelines:
    - Focus only on the requested analysis type
    - Base all conclusions strictly on the provided content
    - Do not add external information or assumptions
    - Be objective, precise, and structured
    - Highlight the most important points, avoid redundancy

    If the task involves:
    - review:
      - Provide an overall evaluation of the content/code
      - Highlight strengths and weaknesses
      - Assess clarity, structure, and maintainability
      - Suggest high-level improvements

    - bugs:
      - Identify potential errors, edge cases, or incorrect logic
      - Explain why each issue is a problem
      - Point to the exact part of the content/code when possible
      - Suggest how to fix each issue

    - optimize:
      - Identify inefficiencies or suboptimal patterns
      - Suggest improvements for performance, readability, or scalability
      - Provide better alternatives when applicable
      - Keep suggestions practical and actionable

    - explain:
      - Clearly explain the content/code in simple terms
      - Break down complex parts step by step
      - Preserve technical accuracy while simplifying
      - Use examples if helpful

    Output format:
      Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
      {
        "analysis": "string with detailed analysis",
        "suggestions": ["array", "of", "improvement", "suggestions"],
        "severity": "info" | "warning" | "error"
      }

    Rules for severity:
    - "info": no critical issues, just observations
    - "warning": notable issues that should be addressed
    - "error": serious problems requiring immediate attention

    Content:
    """
    ${content}
    """
    `;
}
