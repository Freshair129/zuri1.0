import { getTenantId } from '@/lib/tenant'

// POST /api/ai/ask - Ask Gemini a question with streaming SSE response
export async function POST(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()
    const { question, systemContext } = body

    if (!question) {
      return new Response(JSON.stringify({ error: 'question is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // TODO: Build Gemini prompt (inject systemContext, tenant business profile, etc.)
    // TODO: const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    // TODO: const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Stream response as Server-Sent Events (SSE)
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        try {
          // TODO: const result = await model.generateContentStream(prompt)
          // TODO: for await (const chunk of result.stream) {
          //   const text = chunk.text()
          //   controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          // }

          // Placeholder until Gemini integration is wired up
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: '[AI response TODO]' })}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (streamError) {
          console.error('[AI/Ask] stream error', streamError)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[AI/Ask]', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
