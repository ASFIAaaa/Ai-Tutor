import { GoogleGenAI, Type } from '@google/genai';
import { DiagramComponentType, DiagramLesson, LearnerLevel } from '../types';

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

const VALID_COMPONENT_TYPES = new Set<DiagramComponentType>([
  'computer',
  'phone',
  'router',
  'switch',
  'server',
  'cloud',
  'packet',
  'firewall',
  'cable',
  'arrow',
  'label'
]);

/**
 * Generates concise text explanation under 150 words with simple real-life analogy,
 * adapted to the learner age level.
 */
export async function generateExplanation(
  topic: string,
  level: LearnerLevel
): Promise<{ explanation: string; analogy: string; keyTerms: { term: string; definition: string }[] }> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const levelInstructions = {
    little: 'Audience: 6-10 year old kids. Use super cheerful, playful words, fun analogies (toys, playgrounds, puppies, mailboxes). Keep sentences short and warm. Under 100 words.',
    student: 'Audience: 11-17 year old students. Clear, engaging, relatable real-world tech terms. Explain key jargon simply. Under 130 words.',
    advanced: 'Audience: 18+ university or tech professional. Technically accurate, protocol-specific, concise and elegant. Under 150 words.'
  }[level];

  const prompt = `You are VisuaLearn, a world-class computer networking tutor.
Topic: "${topic}"
Target Level: ${level} (${levelInstructions})

Rules:
1. The explanation MUST be under 150 words total.
2. It MUST include a friendly, memorable real-life analogy (e.g. router is like a post office / traffic cop).
3. Plainly explain any technical jargon introduced.
4. Output strictly JSON matching the schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: {
            type: Type.STRING,
            description: 'Short, friendly text explanation under 150 words.'
          },
          analogy: {
            type: Type.STRING,
            description: 'Memorable real-life analogy.'
          },
          keyTerms: {
            type: Type.ARRAY,
            description: '1 to 3 key terms explained simply.',
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                definition: { type: Type.STRING }
              },
              required: ['term', 'definition']
            }
          }
        },
        required: ['explanation', 'analogy', 'keyTerms']
      }
    }
  });

  const text = response.text?.trim() || '{}';
  return JSON.parse(text);
}

/**
 * Validates and sanitizes diagram JSON returned by Gemini against strict rules.
 */
function validateAndSanitizeDiagram(raw: any, topic: string, level: LearnerLevel): DiagramLesson {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Diagram response is not an object');
  }

  const title = String(raw.title || topic);
  const summary = String(raw.summary || `Interactive animation of ${topic}`);
  const analogy = String(raw.analogy || 'Visual network flow');
  const rawSteps = Array.isArray(raw.steps) ? raw.steps : [];

  if (rawSteps.length === 0) {
    throw new Error('Diagram must have at least one step');
  }

  const sanitizedSteps = rawSteps.map((step: any, index: number) => {
    const stepNumber = typeof step.stepNumber === 'number' ? step.stepNumber : index + 1;
    const stepTitle = String(step.title || `Step ${stepNumber}`);
    const caption = String(step.caption || 'Observe the data moving across the network.');
    const narration = String(step.narration || caption);
    const highlightElementIds = Array.isArray(step.highlightElementIds)
      ? step.highlightElementIds.map(String)
      : [];

    const rawElements = Array.isArray(step.elements) ? step.elements : [];
    const elements = rawElements
      .filter((el: any) => el && typeof el === 'object')
      .map((el: any, elIdx: number) => {
        const id = String(el.id || `el-${stepNumber}-${elIdx}`);
        // Filter out unknown component types gracefully as requested
        const rawType = String(el.type).toLowerCase() as DiagramComponentType;
        const type: DiagramComponentType = VALID_COMPONENT_TYPES.has(rawType) ? rawType : 'label';

        const x = Math.max(20, Math.min(780, Number(el.x) || 100));
        const y = Math.max(20, Math.min(460, Number(el.y) || 100));

        return {
          id,
          type,
          x,
          y,
          width: el.width ? Number(el.width) : undefined,
          height: el.height ? Number(el.height) : undefined,
          label: el.label ? String(el.label).slice(0, 50) : undefined,
          sublabel: el.sublabel ? String(el.sublabel).slice(0, 50) : undefined,
          status: el.status || 'normal',
          fromId: el.fromId ? String(el.fromId) : undefined,
          toId: el.toId ? String(el.toId) : undefined
        };
      });

    return {
      stepNumber,
      title: stepTitle,
      caption,
      narration,
      highlightElementIds,
      elements,
      packet: step.packet ? {
        fromId: String(step.packet.fromId || ''),
        toId: String(step.packet.toId || ''),
        payload: String(step.packet.payload || 'Data'),
        status: step.packet.status || 'moving',
        progress: typeof step.packet.progress === 'number' ? step.packet.progress : 0.5
      } : undefined
    };
  });

  return {
    id: `diag-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    topic,
    level,
    summary,
    analogy,
    steps: sanitizedSteps
  };
}

/**
 * Generates animated diagram lesson JSON with retry logic.
 */
export async function generateDiagramLesson(
  topic: string,
  level: LearnerLevel,
  explanation: string
): Promise<DiagramLesson> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const prompt = `You are creating an animated, step-by-step interactive SVG diagram for VisuaLearn.
Topic: "${topic}"
Learner Level: "${level}"
Context Explanation: "${explanation}"

SVG Coordinate Space: 800 width by 500 height.
Available Reusable Components ONLY:
- 'computer' (client PC/laptop, typical x: 80-120, y: 180-300)
- 'phone' (mobile device, typical x: 80-120, y: 320-400)
- 'router' (traffic router / default gateway, typical x: 360-440, y: 200-260)
- 'switch' (local switch connecting LAN devices, typical x: 220-280, y: 220-280)
- 'server' (remote web/DNS server, typical x: 660-720, y: 180-260)
- 'cloud' (the Internet WAN, typical x: 500-600, y: 180-260)
- 'packet' (orange data envelope with payload, x/y positioned along path)
- 'firewall' (security filter wall, typical x: 380-480, y: 180-260)
- 'cable' (straight connection between nodes, requires fromId and toId)
- 'arrow' (flow directional arrow)
- 'label' (floating explanatory text badge)

Instructions:
1. Provide between 3 and 4 clear chronological steps showing the process in action.
2. In each step, specify the elements with their ids, labels, sublabels, and coordinates.
3. Include an active packet moving from one component to another in each step to visualize data flow.
4. Set 'highlightElementIds' to the elements currently being discussed in that step.
5. Provide a clear 1-2 sentence 'caption' and 'narration' for each step.
6. NEVER return arbitrary custom code or unknown component types. Only use the approved components.`;

  // Attempt 1 with retry on validation failure
  try {
    const res = await callGeminiDiagram(ai, prompt);
    return validateAndSanitizeDiagram(res, topic, level);
  } catch (err1) {
    console.warn('Diagram attempt 1 failed, retrying once...', err1);
    const retryPrompt = `${prompt}\n\nIMPORTANT: The previous output failed validation. Ensure strictly valid JSON adhering exactly to the schema.`;
    const res2 = await callGeminiDiagram(ai, retryPrompt);
    return validateAndSanitizeDiagram(res2, topic, level);
  }
}

async function callGeminiDiagram(ai: GoogleGenAI, prompt: string): Promise<any> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          analogy: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stepNumber: { type: Type.INTEGER },
                title: { type: Type.STRING },
                caption: { type: Type.STRING },
                narration: { type: Type.STRING },
                highlightElementIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                elements: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      type: {
                        type: Type.STRING,
                        description: 'Must be one of: computer, phone, router, switch, server, cloud, packet, firewall, cable, arrow, label'
                      },
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                      label: { type: Type.STRING },
                      sublabel: { type: Type.STRING },
                      status: { type: Type.STRING },
                      fromId: { type: Type.STRING },
                      toId: { type: Type.STRING }
                    },
                    required: ['id', 'type', 'x', 'y']
                  }
                },
                packet: {
                  type: Type.OBJECT,
                  properties: {
                    fromId: { type: Type.STRING },
                    toId: { type: Type.STRING },
                    payload: { type: Type.STRING },
                    status: { type: Type.STRING },
                    progress: { type: Type.NUMBER }
                  }
                }
              },
              required: ['stepNumber', 'title', 'caption', 'narration', 'highlightElementIds', 'elements']
            }
          }
        },
        required: ['title', 'summary', 'steps']
      }
    }
  });

  const rawText = response.text?.trim() || '{}';
  return JSON.parse(rawText);
}

/**
 * Tutor Mode: Answers student questions, breaks down concepts, creates simpler diagrams or analogies.
 */
export async function askTutor(params: {
  topic: string;
  level: LearnerLevel;
  elementId?: string;
  elementType?: string;
  elementLabel?: string;
  question?: string;
  actionType?: 'question' | 'breakdown' | 'simpler_diagram' | 'analogy' | 'everyday_example' | 'confusion_loop';
  lessonSummary?: string;
  history?: { role: string; text: string }[];
}): Promise<{
  text: string;
  simplerDiagram?: DiagramLesson;
  analogyStory?: string;
  suggestedFollowUps?: string[];
}> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const {
    topic,
    level,
    elementId,
    elementType,
    elementLabel,
    question,
    actionType = 'question',
    lessonSummary
  } = params;

  let promptDirective = '';
  if (actionType === 'breakdown') {
    promptDirective = `The student clicked "Break it down more". Break this concept into 3 ultra-clear numbered bullet points, each with a mini-example. Tone adapted for ${level}.`;
  } else if (actionType === 'everyday_example' || actionType === 'analogy') {
    promptDirective = `The student clicked "Give me an everyday example". Provide a vivid, fun real-life analogy (like a restaurant order, post office, or road intersection) explaining this exact networking step or component.`;
  } else if (actionType === 'confusion_loop') {
    promptDirective = `The student selected "Still confused". Explain this at an even simpler level (use the simplest vocabulary, warm encouraging encouragement, zero jargon).`;
  } else if (elementId) {
    promptDirective = `The student clicked on diagram element: ID "${elementId}", Type "${elementType || 'component'}", Label "${elementLabel || ''}".
Explain what this specific part does right now in the network, why it is needed, and how it connects to the other parts.`;
  } else {
    promptDirective = `Answer the student's question clearly and warmly: "${question}".`;
  }

  const systemInstruction = `You are a supportive, warm, expert computer networking tutor at the whiteboard.
Current Topic: "${topic}"
Target Learner Level: "${level}"
Context Summary: "${lessonSummary || ''}"

Adapt your vocabulary and tone to the learner level:
- little (6-10): friendly, enthusiastic, relatable toys/everyday things, under 90 words.
- student (11-17): engaging, clear mental models, practical tech intuition, under 120 words.
- advanced (18+): technically precise, RFC/protocol-aware, architectural, under 140 words.
Always end with an encouraging question or invitation to explore.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: promptDirective,
    config: {
      systemInstruction
    }
  });

  const replyText = response.text?.trim() || 'I am right here with you! Let us look at how the packet travels.';

  // If simpler diagram requested, generate a 2-step focused mini-diagram
  let simplerDiagram: DiagramLesson | undefined = undefined;
  if (actionType === 'simpler_diagram') {
    try {
      const diagPrompt = `Create a super simple 2-step mini diagram focused solely on the confusing component: "${elementLabel || elementType || topic}".
Keep coordinates within 800x500. Only use: computer, router, server, packet, cable, firewall. Output valid JSON.`;
      const rawDiag = await callGeminiDiagram(ai, diagPrompt);
      simplerDiagram = validateAndSanitizeDiagram(rawDiag, `${topic} (Simplified)`, level);
    } catch (e) {
      console.warn('Failed to generate simpler diagram, continuing with text reply', e);
    }
  }

  return {
    text: replyText,
    simplerDiagram
  };
}

/**
 * Ask About Drawing: Multimodal Gemini inspection of the student's whiteboard drawing.
 */
export async function askAboutDrawing(params: {
  topic: string;
  level: LearnerLevel;
  imageBase64: string;
  question?: string;
  currentStepCaption?: string;
}): Promise<string> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const { topic, level, imageBase64, question, currentStepCaption } = params;

  // Clean data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
      data: base64Data
    }
  };

  const textPart = {
    text: `The student drew or marked on the networking whiteboard diagram!
Lesson Topic: "${topic}"
Current Step: "${currentStepCaption || ''}"
Student Age Level: "${level}"
Student's Question or Note: "${question || 'Can you explain what I circled or drew here?'}"

Look at what the student has highlighted, circled, or written in the drawing.
Explain that specific element or area in the diagram, validate their curiosity, and clarify how it works in the network.`
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: {
      parts: [imagePart, textPart]
    },
    config: {
      systemInstruction: 'You are VisuaLearn Whiteboard AI tutor. Analyze the user visual markup and answer clearly and warmly at their age level.'
    }
  });

  return response.text?.trim() || 'Great drawing! You marked an important part of the network.';
}
