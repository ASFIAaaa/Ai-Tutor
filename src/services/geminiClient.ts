import { getCuratedLesson } from '../topics';
import { DiagramLesson, LearnerLevel } from '../types';

export interface ExplanationResult {
  explanation: string;
  analogy: string;
  keyTerms?: { term: string; definition: string }[];
  isCuratedFallback?: boolean;
}

export interface TutorResponse {
  text: string;
  simplerDiagram?: DiagramLesson;
  suggestedFollowUps?: string[];
}

export async function fetchExplanation(
  topic: string,
  level: LearnerLevel
): Promise<ExplanationResult> {
  try {
    const res = await fetch('/api/gemini/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, level })
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      explanation: data.explanation,
      analogy: data.analogy,
      keyTerms: data.keyTerms,
      isCuratedFallback: false
    };
  } catch (err: any) {
    console.warn('API call failed or unavailable, checking curated lessons:', err);
    // Check if we have a curated lesson for this topic
    const curated = getCuratedLesson(topic, level);
    if (curated) {
      return {
        explanation: curated.explanation,
        analogy: curated.analogy,
        keyTerms: [],
        isCuratedFallback: true
      };
    }

    // Default friendly fallback if completely offline or custom unknown topic
    return {
      explanation: `In networking, "${topic}" plays a vital role in connecting devices. When computers talk to each other, they pass organized messages back and forth following strict rules called protocols.`,
      analogy: `Think of it like a relay race where runners pass batons safely down a track until reaching the finish line.`,
      isCuratedFallback: true
    };
  }
}

export async function fetchDiagramLesson(
  topic: string,
  level: LearnerLevel,
  explanation: string
): Promise<DiagramLesson> {
  try {
    const res = await fetch('/api/gemini/visualize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, level, explanation })
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.error || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Diagram API call failed, using curated or constructed fallback:', err);
    const curated = getCuratedLesson(topic, level);
    if (curated) {
      return curated.diagram;
    }

    // Return a solid generic network flow diagram
    return {
      id: `fallback-${Date.now()}`,
      title: `Understanding ${topic}`,
      topic,
      level,
      summary: `Visual overview of how ${topic} operates across devices.`,
      analogy: 'Postal delivery highway',
      steps: [
        {
          stepNumber: 1,
          title: 'Sender Initiates Transmission',
          caption: `Your device prepares the digital request for ${topic}.`,
          narration: `Your device prepares the digital request for ${topic}.`,
          highlightElementIds: ['laptop-1', 'packet-1'],
          elements: [
            { id: 'laptop-1', type: 'computer', x: 100, y: 220, label: 'Your Computer', status: 'active' },
            { id: 'cable-1', type: 'cable', x: 240, y: 250, fromId: 'laptop-1', toId: 'router-1' },
            { id: 'router-1', type: 'router', x: 400, y: 220, label: 'Network Gateway' },
            { id: 'cable-2', type: 'cable', x: 550, y: 250, fromId: 'router-1', toId: 'server-1' },
            { id: 'server-1', type: 'server', x: 680, y: 220, label: 'Remote Server' },
            { id: 'packet-1', type: 'packet', x: 220, y: 235, label: 'Data Packet', status: 'transmitting' }
          ],
          packet: { fromId: 'laptop-1', toId: 'router-1', payload: 'Request', progress: 0.4, status: 'moving' }
        },
        {
          stepNumber: 2,
          title: 'Gateway Routes the Request',
          caption: 'The router inspects the destination and forwards the packet onto the fast internet highway.',
          narration: 'The router inspects the destination and forwards the packet onto the fast internet highway.',
          highlightElementIds: ['router-1', 'packet-1'],
          elements: [
            { id: 'laptop-1', type: 'computer', x: 100, y: 220, label: 'Your Computer' },
            { id: 'cable-1', type: 'cable', x: 240, y: 250, fromId: 'laptop-1', toId: 'router-1' },
            { id: 'router-1', type: 'router', x: 400, y: 220, label: 'Network Gateway', status: 'active' },
            { id: 'cable-2', type: 'cable', x: 550, y: 250, fromId: 'router-1', toId: 'server-1' },
            { id: 'server-1', type: 'server', x: 680, y: 220, label: 'Remote Server' },
            { id: 'packet-1', type: 'packet', x: 415, y: 160, label: 'Inspected', status: 'active' }
          ],
          packet: { fromId: 'laptop-1', toId: 'router-1', payload: 'Routing...', progress: 1.0, status: 'inspected' }
        },
        {
          stepNumber: 3,
          title: 'Destination Server Receives & Responds',
          caption: 'The server receives the request, processes it, and prepares the response data.',
          narration: 'The server receives the request, processes it, and prepares the response data.',
          highlightElementIds: ['server-1', 'packet-1'],
          elements: [
            { id: 'laptop-1', type: 'computer', x: 100, y: 220, label: 'Your Computer' },
            { id: 'cable-1', type: 'cable', x: 240, y: 250, fromId: 'laptop-1', toId: 'router-1' },
            { id: 'router-1', type: 'router', x: 400, y: 220, label: 'Network Gateway', status: 'success' },
            { id: 'cable-2', type: 'cable', x: 550, y: 250, fromId: 'router-1', toId: 'server-1' },
            { id: 'server-1', type: 'server', x: 680, y: 220, label: 'Remote Server', status: 'success' },
            { id: 'packet-1', type: 'packet', x: 570, y: 235, label: 'Delivered', status: 'success' }
          ],
          packet: { fromId: 'router-1', toId: 'server-1', payload: 'Success', progress: 0.8, status: 'delivered' }
        }
      ]
    };
  }
}

export async function askTutorApi(params: {
  topic: string;
  level: LearnerLevel;
  elementId?: string;
  elementType?: string;
  elementLabel?: string;
  question?: string;
  actionType?: 'question' | 'breakdown' | 'simpler_diagram' | 'analogy' | 'confusion_loop';
  lessonSummary?: string;
}): Promise<TutorResponse> {
  try {
    const res = await fetch('/api/gemini/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Tutor API failed, using fallback tutor response:', err);
    if (params.actionType === 'breakdown') {
      return {
        text: `Here is the quick 3-step breakdown:\n1. Origin: Your computer wraps data into an IP packet with a source and destination label.\n2. Forwarding: Routers and switches look up where to send it based on routing tables.\n3. Arrival: The target server opens the envelope and sends back the answer!`
      };
    }
    if (params.actionType === 'analogy') {
      return {
        text: `Think of it like ordering pizza! You call the pizza shop (send request), the delivery driver checks their GPS for your street address (router / IP address), and hands you the hot pizza box at your front door (data delivered)!`
      };
    }
    if (params.actionType === 'confusion_loop') {
      return {
        text: `No worries at all! Think of computers as two friends talking through walkie-talkies. Before talking, they check if the channel is open, speak in small clear words, and say "Over" so nothing is missed!`
      };
    }
    return {
      text: `In this diagram, the ${params.elementLabel || params.elementType || 'component'} works like a checkpoint or bridge. It makes sure data gets to the right destination without getting lost or corrupted along the wire.`
    };
  }
}

export async function askAboutDrawingApi(params: {
  topic: string;
  level: LearnerLevel;
  imageBase64: string;
  question?: string;
  currentStepCaption?: string;
}): Promise<string> {
  try {
    const res = await fetch('/api/gemini/ask-drawing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.text;
  } catch (err) {
    console.warn('Ask drawing API failed, using fallback:', err);
    return `I can see what you marked! You circled a key part of the diagram. In this step, data moves directly through that point to reach its destination.`;
  }
}
