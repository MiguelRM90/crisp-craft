import { Injectable, computed, inject, signal } from '@angular/core';
import { PwaToastService } from 'pwa-ui-core/services';
import { ActionTriggerType } from '../models/recipe-taxonomy.model';
import { CompensatedActionTrigger } from '../models/personal-fork.model';

export interface ActiveTimerTriggerState {
  readonly id: string;
  readonly type: ActionTriggerType;
  readonly label: string;
  readonly triggerAtElapsedSec: number;
  readonly triggerEpochMs: number;
  readonly fired: boolean;
  readonly acknowledged: boolean;
}

export interface ActiveCookingTimerSession {
  readonly recipeId: string;
  readonly recipeSlug: string;
  readonly recipeTitle: string;
  readonly targetTempC: number;
  readonly totalDurationSec: number;
  readonly startedAtEpochMs: number;
  readonly targetEndEpochMs: number;
  readonly isPaused: boolean;
  readonly remainingWhenPausedSec: number | null;
  readonly triggers: readonly ActiveTimerTriggerState[];
}

const SESSION_STORAGE_KEY = 'crisp_craft_active_timer_v1';

@Injectable({
  providedIn: 'root',
})
export class CookingTimerService {
  private readonly toast = inject(PwaToastService);

  private readonly sessionSignal = signal<ActiveCookingTimerSession | null>(null);
  private readonly nowEpochMsSignal = signal<number>(Date.now());
  private readonly wakeLockActiveSignal = signal<boolean>(false);
  private readonly activeAlertTriggerSignal = signal<ActiveTimerTriggerState | null>(null);

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private wakeLockSentinel: WakeLockSentinel | null = null;
  private audioCtx: AudioContext | null = null;

  readonly session = this.sessionSignal.asReadonly();
  readonly isWakeLockActive = this.wakeLockActiveSignal.asReadonly();
  readonly activeAlertTrigger = this.activeAlertTriggerSignal.asReadonly();

  readonly remainingSeconds = computed<number>(() => {
    const current = this.sessionSignal();
    if (!current) return 0;
    if (current.isPaused && current.remainingWhenPausedSec !== null) {
      return current.remainingWhenPausedSec;
    }
    const deltaMs = current.targetEndEpochMs - this.nowEpochMsSignal();
    return Math.max(0, Math.ceil(deltaMs / 1000));
  });

  readonly elapsedSeconds = computed<number>(() => {
    const current = this.sessionSignal();
    if (!current) return 0;
    return Math.max(0, current.totalDurationSec - this.remainingSeconds());
  });

  readonly progressPct = computed<number>(() => {
    const current = this.sessionSignal();
    if (!current || current.totalDurationSec <= 0) return 0;
    return Math.min(100, Math.round((this.elapsedSeconds() / current.totalDurationSec) * 100));
  });

  readonly isFinished = computed<boolean>(() => {
    const current = this.sessionSignal();
    return current !== null && !current.isPaused && this.remainingSeconds() === 0;
  });

  constructor() {
    this.restoreSessionIfPresent();
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.onForegroundResume();
        }
      });
    }
  }

  async startTimer(params: {
    readonly recipeId: string;
    readonly recipeSlug: string;
    readonly recipeTitle: string;
    readonly targetTempC: number;
    readonly totalDurationSec: number;
    readonly triggers: readonly CompensatedActionTrigger[];
  }): Promise<void> {
    await this.requestNotificationPermissionIfSupported();

    const nowMs = Date.now();
    const totalSec = Math.max(10, params.totalDurationSec);
    const targetEndEpochMs = nowMs + totalSec * 1000;

    const triggerStates: ActiveTimerTriggerState[] = params.triggers
      .filter((t) => !t.suppressedByDualElement)
      .map((t, index) => ({
        id: `${t.type}_${index}`,
        type: t.type,
        label: t.label,
        triggerAtElapsedSec: t.compensatedSecondMark,
        triggerEpochMs: nowMs + t.compensatedSecondMark * 1000,
        fired: false,
        acknowledged: false,
      }));

    const nextSession: ActiveCookingTimerSession = {
      recipeId: params.recipeId,
      recipeSlug: params.recipeSlug,
      recipeTitle: params.recipeTitle,
      targetTempC: params.targetTempC,
      totalDurationSec: totalSec,
      startedAtEpochMs: nowMs,
      targetEndEpochMs,
      isPaused: false,
      remainingWhenPausedSec: null,
      triggers: triggerStates,
    };

    this.activeAlertTriggerSignal.set(null);
    this.sessionSignal.set(nextSession);
    this.nowEpochMsSignal.set(nowMs);
    this.persistSession(nextSession);
    this.ensureTickLoop();
    await this.acquireWakeLock();

    this.toast.info(
      'Temporizador en marcha',
      `${params.recipeTitle} · ${params.targetTempC} °C (${Math.round(totalSec / 60)} min)`
    );
  }

  pauseTimer(): void {
    const current = this.sessionSignal();
    if (!current || current.isPaused) return;

    const remSec = this.remainingSeconds();
    const updated: ActiveCookingTimerSession = {
      ...current,
      isPaused: true,
      remainingWhenPausedSec: remSec,
    };
    this.sessionSignal.set(updated);
    this.persistSession(updated);
    this.stopTickLoop();
    void this.releaseWakeLock();
  }

  async resumeTimer(): Promise<void> {
    const current = this.sessionSignal();
    if (!current || !current.isPaused || current.remainingWhenPausedSec === null) return;

    const nowMs = Date.now();
    const elapsedAlreadySec = current.totalDurationSec - current.remainingWhenPausedSec;
    const newStartMs = nowMs - elapsedAlreadySec * 1000;
    const newTargetEndMs = nowMs + current.remainingWhenPausedSec * 1000;

    const updatedTriggers = current.triggers.map((t) => ({
      ...t,
      triggerEpochMs: newStartMs + t.triggerAtElapsedSec * 1000,
    }));

    const updated: ActiveCookingTimerSession = {
      ...current,
      startedAtEpochMs: newStartMs,
      targetEndEpochMs: newTargetEndMs,
      isPaused: false,
      remainingWhenPausedSec: null,
      triggers: updatedTriggers,
    };

    this.nowEpochMsSignal.set(nowMs);
    this.sessionSignal.set(updated);
    this.persistSession(updated);
    this.ensureTickLoop();
    await this.acquireWakeLock();
  }

  acknowledgeActiveAlert(): void {
    const alert = this.activeAlertTriggerSignal();
    const current = this.sessionSignal();
    if (!alert || !current) {
      this.activeAlertTriggerSignal.set(null);
      return;
    }

    const updatedTriggers = current.triggers.map((t) =>
      t.id === alert.id ? { ...t, acknowledged: true } : t
    );
    const updatedSession: ActiveCookingTimerSession = {
      ...current,
      triggers: updatedTriggers,
    };
    this.sessionSignal.set(updatedSession);
    this.persistSession(updatedSession);
    this.activeAlertTriggerSignal.set(null);
  }

  stopAndClearTimer(): void {
    this.stopTickLoop();
    this.sessionSignal.set(null);
    this.activeAlertTriggerSignal.set(null);
    this.persistSession(null);
    void this.releaseWakeLock();
  }

  private ensureTickLoop(): void {
    this.stopTickLoop();
    this.intervalId = setInterval(() => {
      this.evaluateTick(false);
    }, 500);
  }

  private stopTickLoop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private onForegroundResume(): void {
    const current = this.sessionSignal();
    if (!current || current.isPaused) return;

    void this.acquireWakeLock();
    this.evaluateTick(true);
  }

  private evaluateTick(isCatchUpFromBackground: boolean): void {
    const nowMs = Date.now();
    this.nowEpochMsSignal.set(nowMs);

    const current = this.sessionSignal();
    if (!current || current.isPaused) return;

    let triggersMutated = false;
    const updatedTriggers = current.triggers.map((trigger) => {
      if (!trigger.fired && nowMs >= trigger.triggerEpochMs) {
        triggersMutated = true;
        const overdueSec = Math.max(0, Math.round((nowMs - trigger.triggerEpochMs) / 1000));
        this.emitTriggerNotification(current.recipeTitle, trigger, isCatchUpFromBackground ? overdueSec : 0);
        return {
          ...trigger,
          fired: true,
        };
      }
      return trigger;
    });

    if (triggersMutated) {
      const updatedSession: ActiveCookingTimerSession = {
        ...current,
        triggers: updatedTriggers,
      };
      this.sessionSignal.set(updatedSession);
      this.persistSession(updatedSession);
    }

    if (nowMs >= current.targetEndEpochMs) {
      this.stopTickLoop();
      this.playKitchenChime('complete');
      this.toast.success(
        '¡Cocción finalizada!',
        `${current.recipeTitle} está lista para retirar de la cesta.`
      );
      void this.dispatchBrowserNotification(
        `🔥 ¡Lista! — ${current.recipeTitle}`,
        'El ciclo de cocción en la freidora de aire ha terminado.'
      );
      void this.releaseWakeLock();
    }
  }

  private emitTriggerNotification(
    recipeTitle: string,
    trigger: ActiveTimerTriggerState,
    overdueSec: number
  ): void {
    this.activeAlertTriggerSignal.set(trigger);
    this.playKitchenChime('shake');

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([300, 120, 300, 120, 450]);
    }

    const prefix =
      overdueSec > 8 ? `(Hace ${overdueSec} s) ¡Acción en cesta!` : '¡Acción en cesta Air Fryer!';
    this.toast.warning(prefix, trigger.label);

    void this.dispatchBrowserNotification(`🔔 ${prefix} — ${recipeTitle}`, trigger.label);
  }

  private async requestNotificationPermissionIfSupported(): Promise<void> {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch {
        // Ignore permission prompt dismissal
      }
    }
  }

  private async dispatchBrowserNotification(title: string, body: string): Promise<void> {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.showNotification(title, {
            body,
            tag: 'crisp-craft-cooking-timer',
            icon: 'favicon.ico',
          });
          return;
        }
      }
      new Notification(title, { body, tag: 'crisp-craft-cooking-timer' });
    } catch {
      // Fallback to in-app toast already shown
    }
  }

  private playKitchenChime(pattern: 'shake' | 'complete'): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextCtor =
        window.AudioContext ||
        (window as unknown as { readonly webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextCtor) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextCtor();
      }
      const ctx = this.audioCtx;
      const notes = pattern === 'complete' ? [880, 1108.73, 1318.51, 1760] : [880, 1318.51, 880];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.16);

        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.16 + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.16);
        osc.stop(ctx.currentTime + idx * 0.16 + 0.15);
      });
    } catch {
      // AudioContext blocked or unavailable
    }
  }

  private async acquireWakeLock(): Promise<void> {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    try {
      this.wakeLockSentinel = await navigator.wakeLock.request('screen');
      this.wakeLockActiveSignal.set(true);
      this.wakeLockSentinel.addEventListener('release', () => {
        this.wakeLockActiveSignal.set(false);
      });
    } catch {
      this.wakeLockActiveSignal.set(false);
    }
  }

  private async releaseWakeLock(): Promise<void> {
    try {
      if (this.wakeLockSentinel) {
        await this.wakeLockSentinel.release();
        this.wakeLockSentinel = null;
      }
    } catch {
      // Ignore release errors
    } finally {
      this.wakeLockActiveSignal.set(false);
    }
  }

  private persistSession(session: ActiveCookingTimerSession | null): void {
    if (typeof sessionStorage === 'undefined') return;
    if (!session) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  private restoreSessionIfPresent(): void {
    if (typeof sessionStorage === 'undefined') return;
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ActiveCookingTimerSession;
      if (parsed && parsed.targetEndEpochMs > Date.now() - 60_000) {
        this.sessionSignal.set(parsed);
        if (!parsed.isPaused) {
          this.ensureTickLoop();
          void this.acquireWakeLock();
        }
      } else {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }
}

