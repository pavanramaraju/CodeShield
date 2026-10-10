import { UserRole } from '@/types';

const TOKEN_KEY = 'qshield_auth_token';
const ROLE_KEY = 'qshield_user_role';
const USERNAME_KEY = 'qshield_username';
const REMEMBER_KEY = 'qshield_remember_user';

export interface AuthSession {
  isAuthenticated: boolean;
  token: string | null;
  role: UserRole;
  username: string;
}

export const authStore = {
  getSession(): AuthSession {
    if (typeof window === 'undefined') {
      return {
        isAuthenticated: false,
        token: null,
        role: 'analyst',
        username: '',
      };
    }

    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    const role = (localStorage.getItem(ROLE_KEY) || sessionStorage.getItem(ROLE_KEY) || 'analyst') as UserRole;
    const username = localStorage.getItem(USERNAME_KEY) || sessionStorage.getItem(USERNAME_KEY) || '';

    return {
      isAuthenticated: Boolean(token),
      token,
      role,
      username,
    };
  },

  getRememberedUser(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(REMEMBER_KEY) || '';
  },

  login(username: string, role: UserRole, rememberMe: boolean): AuthSession {
    const fakeToken = `qs_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    // Always write to localStorage and sessionStorage to prevent dropped sessions
    localStorage.setItem(TOKEN_KEY, fakeToken);
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(USERNAME_KEY, username);
    sessionStorage.setItem(TOKEN_KEY, fakeToken);
    sessionStorage.setItem(ROLE_KEY, role);
    sessionStorage.setItem(USERNAME_KEY, username);

    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, username);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('qshield_auth_change'));
    }

    return {
      isAuthenticated: true,
      token: fakeToken,
      role,
      username,
    };
  },

  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USERNAME_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    sessionStorage.removeItem(USERNAME_KEY);

    window.dispatchEvent(new CustomEvent('qshield_auth_change'));
  },

  switchRole(role: UserRole): void {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(TOKEN_KEY)) {
      localStorage.setItem(ROLE_KEY, role);
    }
    if (sessionStorage.getItem(TOKEN_KEY)) {
      sessionStorage.setItem(ROLE_KEY, role);
    }
    window.dispatchEvent(new CustomEvent('qshield_auth_change'));
  },
};
