const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export interface TutorStreamInput {
  messages: { role: 'user' | 'assistant'; content: string }[];
  word?: string;
  action?: string;
}

/**
 * POST to the tutor SSE endpoint and invoke `onToken` for each streamed token.
 * Uses fetch streaming (EventSource can't set the Authorization header).
 */
export async function streamTutor(
  input: TutorStreamInput,
  token: string,
  onToken: (token: string) => void,
): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/v1/tutor/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Tutor request failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() ?? '';

    for (const block of blocks) {
      const line = block.trim();
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data) as { token?: string };
        if (parsed.token) onToken(parsed.token);
      } catch {
        // ignore malformed chunk
      }
    }
  }
}
