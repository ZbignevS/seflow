import { Component, ChangeDetectionStrategy, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@shared/i18n/translate.pipe';
import { TranslationService } from '@shared/i18n/translation.service';
import type { Locale } from '@shared/i18n/models/translations.model';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, TranslatePipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  host: {
    '(window:scroll)': 'onWindowScroll()',
    '[class.scrolled]': 'scrolled()',
  },
})
export class NavbarComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ts = inject(TranslationService);

  protected readonly locale = this.ts.locale;
  protected readonly scrolled = signal(false);

  onWindowScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.scrolled.set(window.scrollY > 20);
    }
  }

  protected switchLocale(locale: Locale): void {
    this.ts.setLocale(locale);
  }
}
