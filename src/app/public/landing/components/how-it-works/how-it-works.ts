import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { TranslatePipe } from '@core/i18n/pipes/translate.pipe';
import { TranslationService } from '@core/i18n/services/translation.service';

@Component({
  selector: 'app-how-it-works',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.scss',
})
export class HowItWorksComponent {
  private readonly ts = inject(TranslationService);
  protected readonly steps = computed(() => this.ts.t().howItWorks.steps);
}
