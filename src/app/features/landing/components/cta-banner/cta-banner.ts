import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@shared/i18n/translate.pipe';

@Component({
  selector: 'app-cta-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, TranslatePipe],
  templateUrl: './cta-banner.html',
  styleUrl: './cta-banner.scss',
})
export class CtaBannerComponent {}
