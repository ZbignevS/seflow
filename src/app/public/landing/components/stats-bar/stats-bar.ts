import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { TranslationService } from '@core/i18n/services/translation.service';

@Component({
  selector: 'app-stats-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stats-bar.html',
  styleUrl: './stats-bar.scss',
})
export class StatsBarComponent {
  private readonly ts = inject(TranslationService);
  protected readonly items = computed(() => this.ts.t().stats.items);
}
