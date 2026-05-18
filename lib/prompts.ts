interface ConversationEntry {
  question: string
  answer: string
}

export function intakeConductorPrompt(params: {
  businessName: string
  questions: string[]
  triggerKeywords: string[]
  conversationLog?: ConversationEntry[]
}): string {
  const conversation = (params.conversationLog ?? [])
    .map((e) => `Q: ${e.question}\nA: ${e.answer}`)
    .join('\n\n')

  return `You are a professional intake assistant for ${params.businessName}.
The following questions were asked and answered during a prospect intake:

Questions configured:
${params.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Conversation transcript:
${conversation || '(no answers recorded)'}

Based on the transcript above, output only valid JSON with this exact structure:
{
  "answers": { "<question>": "<answer>" },
  "decisionKey": "<one value from: ${params.triggerKeywords.join(', ')}>",
  "urgencyFlag": "HIGH or LOW",
  "prospectName": "<full name extracted from answers>",
  "prospectEmail": "<email address extracted from answers>"
}

Rules:
- decisionKey MUST be exactly one of: ${params.triggerKeywords.join(', ')}
- urgencyFlag is HIGH if any answer implies a timeline under 2 weeks, otherwise LOW
- Extract prospectName and prospectEmail from the answers (they are always provided)
- Output nothing else. No explanation. No markdown. No backticks.`
}

export function leadSummarizerPrompt(params: {
  businessName: string
  answers: Record<string, string>
}): string {
  const answersText = Object.entries(params.answers)
    .map(([q, a]) => `Q: ${q}\nA: ${a}`)
    .join('\n\n')

  return `You are writing an internal lead brief for the owner of ${params.businessName}. Given these intake answers:
${answersText}

Write exactly 3 sentences:
1. What the prospect needs (specific, not generic).
2. Estimated scope complexity and any risk flags.
3. One concrete recommended next action for the owner.
Tone: direct, professional, no filler phrases.
Output plain text only. No bullet points. No headers. No markdown. No backticks.`
}
