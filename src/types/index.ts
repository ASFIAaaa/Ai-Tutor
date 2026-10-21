/**
 * VisuaLearn Core Types
 */

export type LearnerLevel = 'little' | 'student' | 'advanced';

export interface LevelConfig {
  id: LearnerLevel;
  label: string;
  ageRange: string;
  description: string;
  badgeColor: string;
}

export type DiagramComponentType =
  | 'computer'
  | 'phone'
  | 'router'
  | 'switch'
  | 'server'
  | 'cloud'
  | 'packet'
  | 'firewall'
  | 'cable'
  | 'arrow'
  | 'label';

export interface DiagramElement {
  id: string;
  type: DiagramComponentType;
  x: number; // 0 to 800 SVG coordinate
  y: number; // 0 to 500 SVG coordinate
  width?: number;
  height?: number;
  label?: string;
  sublabel?: string;
  status?: 'normal' | 'active' | 'success' | 'blocked' | 'warning' | 'transmitting';
  fromId?: string;
  toId?: string;
  progress?: number; // 0.0 to 1.0 along cable/arrow
  metadata?: Record<string, string | number | boolean>;
}

export interface PacketAnimation {
  fromId: string;
  toId: string;
  payload: string;
  status?: 'moving' | 'inspected' | 'delivered' | 'blocked';
  progress: number; // 0 to 1
}

export interface DiagramStep {
  stepNumber: number;
  title: string;
  caption: string;
  narration: string;
  highlightElementIds: string[];
  elements: DiagramElement[];
  packet?: PacketAnimation;
}

export interface DiagramLesson {
  id: string;
  title: string;
  topic: string;
  level: LearnerLevel;
  summary: string;
  analogy: string;
  steps: DiagramStep[];
}

export interface WhiteboardPoint {
  x: number;
  y: number;
}

export interface WhiteboardStroke {
  id: string;
  tool: 'pen' | 'highlighter' | 'eraser';
  color: string;
  size: number;
  points: WhiteboardPoint[];
}

export interface LessonHistoryItem {
  id: string;
  userId?: string;
  topic: string;
  level: LearnerLevel;
  explanationText: string;
  analogy: string;
  diagram: DiagramLesson;
  drawings: Record<number, WhiteboardStroke[]>; // stepIndex -> strokes
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  preferredLevel: LearnerLevel;
  isGuest: boolean;
}

export interface TutorMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: number;
  elementId?: string;
  drawingImage?: string;
  type?: 'explanation' | 'breakdown' | 'simpler_diagram' | 'analogy' | 'confusion_check';
}

export interface TopicPack {
  id: string;
  name: string;
  description: string;
  iconName: string;
  topics: {
    id: string;
    title: string;
    summary: string;
    category: string;
  }[];
}
