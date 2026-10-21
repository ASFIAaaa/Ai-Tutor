import type { IncomingMessage, ServerResponse } from 'http';
import {
  generateExplanation,
  generateDiagramLesson,
  askTutor,
  askAboutDrawing
} from './geminiService';

async function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Safeguard against unbounded memory
      if (body.length > 10 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
): Promise<void> {
  const url = req.url || '';

  if (!url.startsWith('/api/')) {
    return next();
  }

  // Health check
  if (url === '/api/health' && req.method === 'GET') {
    sendJson(res, 200, {
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
    });
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await parseJsonBody(req);

    if (url === '/api/gemini/explain') {
      const { topic, level } = body;
      if (!topic || !level) {
        sendJson(res, 400, { error: 'topic and level are required' });
        return;
      }
      const data = await generateExplanation(topic, level);
      sendJson(res, 200, data);
      return;
    }

    if (url === '/api/gemini/visualize') {
      const { topic, level, explanation } = body;
      if (!topic || !level) {
        sendJson(res, 400, { error: 'topic and level are required' });
        return;
      }
      const data = await generateDiagramLesson(topic, level, explanation || topic);
      sendJson(res, 200, data);
      return;
    }

    if (url === '/api/gemini/tutor') {
      const data = await askTutor(body);
      sendJson(res, 200, data);
      return;
    }

    if (url === '/api/gemini/ask-drawing') {
      const { topic, level, imageBase64, question, currentStepCaption } = body;
      if (!imageBase64) {
        sendJson(res, 400, { error: 'imageBase64 is required' });
        return;
      }
      const text = await askAboutDrawing({
        topic,
        level,
        imageBase64,
        question,
        currentStepCaption
      });
      sendJson(res, 200, { text });
      return;
    }

    sendJson(res, 404, { error: `Not found: ${url}` });
  } catch (error: any) {
    console.error('API Error:', error);
    const message = error?.message || 'Internal server error';
    const isApiKeyError = message.includes('GEMINI_API_KEY_MISSING') || message.includes('API key');
    sendJson(res, isApiKeyError ? 401 : 500, {
      error: message,
      code: isApiKeyError ? 'MISSING_API_KEY' : 'SERVER_ERROR'
    });
  }
}
