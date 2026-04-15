import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import type { IconName } from './icons';

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './icon.html',
  host: { 'aria-hidden': 'true' },
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input<number>(24);
}
