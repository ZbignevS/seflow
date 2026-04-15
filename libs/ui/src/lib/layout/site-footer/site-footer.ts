import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@core/i18n/pipes/translate.pipe';
import { TranslationService } from '@core/i18n/services/translation.service';
import { IconComponent } from '../../icon/icon';

/** Column link hrefs aligned positionally with footer.columns[i].links[j] in the i18n files. */
const FOOTER_COL_HREFS: readonly (readonly string[])[] = [
  ['#features', '#how-it-works', '#pricing', '/security'],
  ['/about', '/blog', '/careers', '/press'],
  ['/help', '/contact', '/privacy', '/terms'],
] as const;

@Component({
  selector: 'app-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, TranslatePipe, IconComponent],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
})
export class SiteFooterComponent {
  private readonly ts = inject(TranslationService);

  protected readonly columns = computed(() =>
    this.ts.t().footer.columns.map((col, i) => ({
      heading: col.heading,
      links: col.links.map((link, j) => ({
        label: link.label,
        href: FOOTER_COL_HREFS[i]?.[j] ?? '#',
      })),
    })),
  );
}
