import { LessonHistoryItem, WhiteboardStroke } from '../types';
import { authService } from './authService';

function getStorageKey(userId?: string): string {
  const effectiveId = userId || authService.getCurrentUser().uid || 'guest-local-user';
  return `visualearn_lessons_${effectiveId}`;
}

class StorageService {
  /**
   * Retrieves all saved lessons for the active user.
   */
  public async getLessons(userId?: string): Promise<LessonHistoryItem[]> {
    try {
      const key = getStorageKey(userId);
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (e) {
      console.warn('Failed to read lessons from storage:', e);
      return [];
    }
  }

  /**
   * Saves or updates a lesson with its diagram and student drawings.
   */
  public async saveLesson(lesson: LessonHistoryItem): Promise<void> {
    try {
      const user = authService.getCurrentUser();
      const key = getStorageKey(lesson.userId || user.uid);
      const current = await this.getLessons(lesson.userId || user.uid);

      // Check if lesson already exists; if so, update it
      const existingIdx = current.findIndex(item => item.id === lesson.id);
      let updated: LessonHistoryItem[];

      const lessonToSave: LessonHistoryItem = {
        ...lesson,
        userId: user.uid
      };

      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = lessonToSave;
      } else {
        // Add to front of history
        updated = [lessonToSave, ...current];
      }

      // Limit to 50 most recent lessons
      if (updated.length > 50) {
        updated = updated.slice(0, 50);
      }

      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save lesson to storage:', e);
    }
  }

  /**
   * Updates only the student drawings for a specific step in a lesson.
   */
  public async saveStepDrawings(
    lessonId: string,
    stepIndex: number,
    strokes: WhiteboardStroke[]
  ): Promise<void> {
    try {
      const user = authService.getCurrentUser();
      const key = getStorageKey(user.uid);
      const current = await this.getLessons(user.uid);

      const existingIdx = current.findIndex(item => item.id === lessonId);
      if (existingIdx >= 0) {
        const item = current[existingIdx];
        const drawings = { ...item.drawings, [stepIndex]: strokes };
        current[existingIdx] = { ...item, drawings };
        localStorage.setItem(key, JSON.stringify(current));
      }
    } catch (e) {
      console.warn('Failed to update drawings:', e);
    }
  }

  /**
   * Deletes a lesson from history.
   */
  public async deleteLesson(lessonId: string): Promise<void> {
    try {
      const user = authService.getCurrentUser();
      const key = getStorageKey(user.uid);
      const current = await this.getLessons(user.uid);
      const filtered = current.filter(item => item.id !== lessonId);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Failed to delete lesson:', e);
    }
  }

  /**
   * Retrieves a specific lesson by ID.
   */
  public async getLessonById(lessonId: string): Promise<LessonHistoryItem | null> {
    const list = await this.getLessons();
    return list.find(item => item.id === lessonId) || null;
  }
}

export const storageService = new StorageService();
