import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@shared/i18n/translate.pipe';
import { TranslationService } from '@shared/i18n/translation.service';
import { TESTIMONIAL_AVATARS } from '../../data/landing.data';

@Component({
  selector: 'app-testimonials-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, TranslatePipe],
  templateUrl: './testimonials-section.html',
  styleUrl: './testimonials-section.scss',
})
export class TestimonialsSectionComponent {
  private readonly ts = inject(TranslationService);

  protected readonly testimonials = computed(() =>
    TESTIMONIAL_AVATARS.map((avatar, i) => ({
      ...avatar,
      ...this.ts.t().testimonials.items[i],
    })),
  );
}
