import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@core/i18n/pipes/translate.pipe';
import { TranslationService } from '@core/i18n/services/translation.service';
import { IconComponent } from '@seflow/ui';
import { FEATURE_ITEMS } from '../../content/landing.content';

@Component({
  selector: 'app-feature-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, TranslatePipe, IconComponent],
  templateUrl: './feature-section.html',
  styleUrl: './feature-section.scss',
})
export class FeatureSectionComponent {
  private readonly ts = inject(TranslationService);

  protected readonly features = computed(() =>
    FEATURE_ITEMS.map((item) => ({
      ...item,
      title: this.ts.t().features.items[item.id].title,
      desc: this.ts.t().features.items[item.id].desc,
    })),
  );
}
