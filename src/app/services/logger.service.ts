import { Injectable } from '@angular/core';

export interface LogEvent {
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
  timestamp: Date;
  userAgent?: string;
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor() {}

  private createLogEvent(level: LogEvent['level'], message: string, data?: any): LogEvent {
    return {
      level,
      message,
      data,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }

  info(message: string, data?: any): void {
    const logEvent = this.createLogEvent('info', message, data);
    this.sendToRollbar(logEvent);
    console.info(`[INFO] ${message}`, data);
  }

  warn(message: string, data?: any): void {
    const logEvent = this.createLogEvent('warn', message, data);
    this.sendToRollbar(logEvent);
    console.warn(`[WARN] ${message}`, data);
  }

  error(message: string, error?: any): void {
    const logEvent = this.createLogEvent('error', message, error);
    this.sendToRollbar(logEvent);
    console.error(`[ERROR] ${message}`, error);
  }

  // Méthode spécifique pour les demandes de réinitialisation de mot de passe
  logPasswordResetRequest(email: string, success: boolean, error?: any): void {
    const message = success
      ? 'Password reset request successful'
      : 'Password reset request failed';

    const data = {
      email: email,
      success: success,
      error: error,
      action: 'password_reset_request'
    };

    if (success) {
      this.info(message, data);
    } else {
      this.error(message, data);
    }
  }

  // Méthode spécifique pour les réinitialisations de mot de passe
  logPasswordReset(success: boolean, error?: any): void {
    const message = success
      ? 'Password reset successful'
      : 'Password reset failed';

    const data = {
      success: success,
      error: error,
      action: 'password_reset'
    };

    if (success) {
      this.info(message, data);
    } else {
      this.error(message, data);
    }
  }

  private sendToRollbar(logEvent: LogEvent): void {
    // TODO: Intégrer avec Rollbar quand disponible
    // Pour l'instant, on peut envoyer vers une API de logging ou garder en local

    // Exemple d'intégration future avec Rollbar :
    // if (window.Rollbar) {
    //   if (logEvent.level === 'error') {
    //     window.Rollbar.error(logEvent.message, logEvent.data);
    //   } else if (logEvent.level === 'warn') {
    //     window.Rollbar.warning(logEvent.message, logEvent.data);
    //   } else {
    //     window.Rollbar.info(logEvent.message, logEvent.data);
    //   }
    // }

    // Pour l'instant, stocker dans localStorage pour debug (optionnel)
    if (logEvent.level === 'error' || logEvent.level === 'warn') {
      try {
        const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
        logs.push(logEvent);
        // Garder seulement les 50 derniers logs
        if (logs.length > 50) {
          logs.splice(0, logs.length - 50);
        }
        localStorage.setItem('app_logs', JSON.stringify(logs));
      } catch (e) {
        console.error('Failed to store log in localStorage', e);
      }
    }
  }
}