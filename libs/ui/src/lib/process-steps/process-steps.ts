import { Component, ChangeDetectionStrategy, input } from '@angular/core';

export interface ProcessStep {
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-process-steps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './process-steps.html',
  styleUrl: './process-steps.scss',
})
export class ProcessStepsComponent {
  readonly sectionLabel = input<string>();
  readonly heading = input.required<string>();
  readonly steps = input.required<readonly ProcessStep[]>();
}
