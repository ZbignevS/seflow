import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@shared/i18n/translate.pipe';
import { TranslationService } from '@shared/i18n/translation.service';
import { IconComponent } from '@shared/ui/icon/icon';
import { FEATURE_ITEMS } from '../../data/landing.data';

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
