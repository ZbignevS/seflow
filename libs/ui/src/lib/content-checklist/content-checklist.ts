import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { IconComponent } from '../icon/icon';

export interface ChecklistItem {
  readonly id: string;
  readonly text: string;
}

@Component({
  selector: 'app-content-checklist',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './content-checklist.html',
  styleUrl: './content-checklist.scss',
})
export class ContentChecklistComponent {
  readonly sectionLabel = input<string>();
  readonly heading = input.required<string>();
  readonly description = input<string>();
  readonly items = input.required<readonly ChecklistItem[]>();
  readonly imageAlt = input<string>('');
  readonly imageSrc = input<string>();
  readonly imageOnLeft = input<boolean>(false);
}
