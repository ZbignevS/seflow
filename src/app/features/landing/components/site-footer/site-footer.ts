import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@shared/i18n/translate.pipe';
import { TranslationService } from '@shared/i18n/translation.service';
import { IconComponent } from '@shared/ui/icon/icon';
import { FOOTER_COL_HREFS } from '../../data/landing.data';

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
