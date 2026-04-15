import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { Locale } from './models/translations.model';
import EN from '@assets/i18n/en.json';
import MT from '@assets/i18n/mt.json';

type TranslationData = typeof EN;

const LOCALE_MAP: Record<Locale, TranslationData> = { en: EN, mt: MT };
const STORAGE_KEY = 'seflow-locale';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly _locale = signal<Locale>(this.readStoredLocale());

  readonly locale = this._locale.asReadonly();
  readonly t = computed<TranslationData>(() => LOCALE_MAP[this._locale()]);

  setLocale(locale: Locale): void {
    this._locale.set(locale);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, locale);
    }
  }

  private readStoredLocale(): Locale {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'mt') return stored;
    }
    return 'en';
  }
}
