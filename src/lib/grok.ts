export async function callGrokAPI(messages: { role: string; content: string }[], systemPrompt?: string) {
  try {
    const response = await fetch('/api/grok', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, systemPrompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to communicate with Grok AI');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('Grok Error:', error);
    throw error;
  }
}
