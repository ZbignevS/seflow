import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-hero-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss',
})
export class HeroSectionComponent {
  readonly badge = input<string>();
  readonly heading = input.required<string>();
  readonly subtext = input.required<string>();
  readonly primaryCtaLabel = input.required<string>();
  readonly primaryCtaHref = input.required<string>();
  readonly secondaryCtaLabel = input<string>();
  readonly secondaryCtaHref = input<string>('#');
  readonly notes = input<readonly string[]>([]);
}
