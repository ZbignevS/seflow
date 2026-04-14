import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@shared/i18n/translate.pipe';
import { LandingService } from '../../landing.service';

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, TranslatePipe],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class HeroComponent {
  private readonly ls = inject(LandingService);

  protected readonly chartBars = this.ls.chartBars;
  protected readonly chartLabels = this.ls.chartLabels;
  protected readonly transactions = this.ls.transactions;
}
