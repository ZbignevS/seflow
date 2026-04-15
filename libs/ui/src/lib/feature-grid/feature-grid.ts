import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { IconComponent } from '../icon/icon';
import type { IconName } from '../icon/icons';

export type FeatureCardColor = 'blue' | 'green' | 'purple';

export interface FeatureGridItem {
  readonly id: string;
  readonly icon: IconName;
  readonly colorKey: FeatureCardColor;
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-feature-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, IconComponent],
  templateUrl: './feature-grid.html',
  styleUrl: './feature-grid.scss',
})
export class FeatureGridComponent {
  readonly sectionLabel = input<string>();
  readonly heading = input.required<string>();
  readonly description = input<string>();
  readonly items = input.required<readonly FeatureGridItem[]>();
}
