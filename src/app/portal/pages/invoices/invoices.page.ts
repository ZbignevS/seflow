import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@core/i18n/pipes/translate.pipe';

@Component({
  selector: 'app-invoices-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <div class="placeholder-page">
      <h1 class="page-title">{{ 'portal.nav.newInvoice' | translate }}</h1>
      <p class="page-desc">Invoice management is coming soon.</p>
    </div>
  `,
  styles: [`
    .placeholder-page {
      max-width: var(--container-max);
      margin: 0 auto;
      padding: 48px var(--container-padding);
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--color-text);
      margin: 0 0 8px;
    }

    .page-desc {
      color: var(--color-text-muted);
      margin: 0;
    }
  `],
})
export class InvoicesPageComponent {}
