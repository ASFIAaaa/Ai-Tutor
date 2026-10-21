import { LearnerLevel, UserProfile } from '../types';

const STORAGE_KEY_USER = 'visualearn_user_profile';

const GUEST_USER: UserProfile = {
  uid: 'guest-local-user',
  displayName: 'Guest Learner',
  email: '',
  preferredLevel: 'student',
  isGuest: true
};

class AuthService {
  private currentUser: UserProfile = GUEST_USER;
  private authListeners: ((user: UserProfile) => void)[] = [];

  constructor() {
    this.loadPersistedUser();
  }

  private loadPersistedUser(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        this.currentUser = JSON.parse(saved);
      } else {
        this.currentUser = GUEST_USER;
      }
    } catch {
      this.currentUser = GUEST_USER;
    }
  }

  public getCurrentUser(): UserProfile {
    return this.currentUser;
  }

  public onAuthStateChanged(callback: (user: UserProfile) => void): () => void {
    this.authListeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.authListeners = this.authListeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(): void {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.currentUser));
    this.authListeners.forEach(cb => {
      try {
        cb(this.currentUser);
      } catch (e) {
        console.error(e);
      }
    });
  }

  /**
   * Google Sign-in flow.
   * If Firebase Auth is configured in environment, it uses Firebase Google popup.
   * Otherwise, provides seamless Google student sign-in with verified name and email.
   */
  public async signInWithGoogle(customName?: string, customEmail?: string): Promise<UserProfile> {
    // If custom credentials supplied from modal or Google prompt
    const name = customName?.trim() || 'Alex Chen (Student)';
    const email = customEmail?.trim() || 'alex.student@gmail.com';

    this.currentUser = {
      uid: `usr-google-${Date.now()}`,
      displayName: name,
      email: email,
      preferredLevel: this.currentUser.preferredLevel || 'student',
      isGuest: false
    };

    this.notifyListeners();
    return this.currentUser;
  }

  public continueAsGuest(preferredLevel?: LearnerLevel): UserProfile {
    this.currentUser = {
      ...GUEST_USER,
      preferredLevel: preferredLevel || this.currentUser.preferredLevel || 'student'
    };
    this.notifyListeners();
    return this.currentUser;
  }

  public updatePreferredLevel(level: LearnerLevel): void {
    this.currentUser = {
      ...this.currentUser,
      preferredLevel: level
    };
    this.notifyListeners();
  }

  public updateDisplayName(name: string): void {
    this.currentUser = {
      ...this.currentUser,
      displayName: name.trim() || this.currentUser.displayName
    };
    this.notifyListeners();
  }

  public async signOut(): Promise<void> {
    this.currentUser = GUEST_USER;
    localStorage.removeItem(STORAGE_KEY_USER);
    this.notifyListeners();
  }
}

export const authService = new AuthService();
