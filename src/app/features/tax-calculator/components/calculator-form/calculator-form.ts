import { Component, ChangeDetectionStrategy, output, inject, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslatePipe } from '@shared/i18n/translate.pipe';
import type { TaxInput } from '../../models/tax.models';

@Component({
  selector: 'app-calculator-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatSlideToggleModule, TranslatePipe],
  templateUrl: './calculator-form.html',
  styleUrl: './calculator-form.scss',
})
export class CalculatorFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly inputChange = output<TaxInput>();

  protected readonly form = this.fb.nonNullable.group({
    annualIncome: [10_000, [Validators.min(0)]],
    expenses: [0, [Validators.min(0)]],
    isPartTime: [false],
  });

  ngOnInit(): void {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const v = this.form.getRawValue();
      this.inputChange.emit({
        annualIncome: Math.max(0, v.annualIncome),
        expenses: Math.max(0, v.expenses),
        isPartTime: v.isPartTime,
      });
    });
  }
}
