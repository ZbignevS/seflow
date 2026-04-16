import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@core/i18n/pipes/translate.pipe';
import { InvoicesService } from '../../../services/invoices.service';
import type { InvoicePreviewPayload } from '@seflow/contracts';

@Component({
  selector: 'app-invoice-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    DatePipe,
    TranslatePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './invoice-preview.page.html',
  styleUrl: './invoice-preview.page.scss',
})
export class InvoicePreviewPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly invoicesService = inject(InvoicesService);

  protected readonly payload = signal<InvoicePreviewPayload | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      void this.router.navigate(['/portal/invoices']);
      return;
    }

    this.invoicesService.preview(id).subscribe({
      next: (p) => {
        this.payload.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load invoice preview.');
        this.loading.set(false);
      },
    });
  }

  protected print(): void {
    window.print();
  }

  protected goBack(): void {
    const id = this.route.snapshot.paramMap.get('id');
    void this.router.navigate(['/portal/invoices', id]);
  }

  /** Recomputed at render time so stale stored values don't show wrong currency. */
  protected amountInWords(amount: number, currency: string): string {
    const units = Math.floor(amount);
    const cents = Math.round((amount - units) * 100);
    const unitName = this.currencyUnitName(currency, units);
    const body = cents === 0
      ? `${this.numberToWords(units)} ${unitName}`
      : `${this.numberToWords(units)} ${unitName} and ${this.numberToWords(cents)} ${cents === 1 ? 'cent' : 'cents'}`;
    return body.charAt(0).toUpperCase() + body.slice(1);
  }

  private currencyUnitName(currency: string, units: number): string {
    const map: Record<string, { one: string; many: string }> = {
      EUR: { one: 'euro',   many: 'euro'    },
      GBP: { one: 'pound',  many: 'pounds'  },
      USD: { one: 'dollar', many: 'dollars' },
    };
    const names = map[currency] ?? { one: currency.toLowerCase(), many: currency.toLowerCase() };
    return units === 1 ? names.one : names.many;
  }

  private numberToWords(n: number): string {
    if (n === 0) return 'zero';
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
      'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
      'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + this.numberToWords(n % 100) : '');
    return this.numberToWords(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + this.numberToWords(n % 1000) : '');
  }
}
