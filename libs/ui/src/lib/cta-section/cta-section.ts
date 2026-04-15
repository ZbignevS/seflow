import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cta-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule],
  templateUrl: './cta-section.html',
  styleUrl: './cta-section.scss',
})
export class CtaSectionComponent {
  readonly heading = input.required<string>();
  readonly subtext = input<string>();
  readonly primaryCtaLabel = input.required<string>();
  readonly primaryCtaHref = input.required<string>();
  readonly secondaryCtaLabel = input<string>();
  readonly secondaryCtaHref = input<string>('#');
  readonly note = input<string>();
}
