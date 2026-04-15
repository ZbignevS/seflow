import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { TranslationService } from '@core/i18n/services/translation.service';
import { NavbarComponent, SiteFooterComponent, HeroSectionComponent, FeatureGridComponent, ContentChecklistComponent, ProcessStepsComponent, CtaSectionComponent } from '@seflow/ui';
import { SELF_EMPLOYMENT_STEPS } from './content/self-employment-guide.content';

@Component({
  selector: 'app-self-employment-guide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NavbarComponent,
    HeroSectionComponent,
    FeatureGridComponent,
    ContentChecklistComponent,
    ProcessStepsComponent,
    CtaSectionComponent,
    SiteFooterComponent,
  ],
  templateUrl: './self-employment-guide.html',
})
export class SelfEmploymentGuideComponent {
  private readonly ts = inject(TranslationService);

  protected readonly hero = computed(() => {
    const t = this.ts.t().selfEmploymentGuide.hero;
    return {
      badge: t.badge,
      heading: t.heading,
      subtext: t.subtext,
      primaryCtaLabel: t.primaryCta,
      primaryCtaHref: 'https://jobsplus.gov.mt/knowledge-base/how-can-i-register-as-self-employed',
      secondaryCtaLabel: t.secondaryCta,
      secondaryCtaHref: '#steps',
      notes: t.notes,
    };
  });

  protected readonly steps = computed(() => {
    const t = this.ts.t().selfEmploymentGuide.steps;
    return {
      sectionLabel: t.sectionLabel,
      heading: t.heading,
      description: t.description,
      items: SELF_EMPLOYMENT_STEPS.map((s) => ({
        id: s.id,
        icon: s.icon,
        colorKey: s.colorKey,
        title: t.items[s.id].title,
        description: t.items[s.id].description,
      })),
    };
  });

  protected readonly requirements = computed(() => {
    const t = this.ts.t().selfEmploymentGuide.requirements;
    return {
      sectionLabel: t.sectionLabel,
      heading: t.heading,
      description: t.description,
      items: t.items.map((text, i) => ({ id: `r${i + 1}`, text })),
    };
  });

  protected readonly notes = computed(() => {
    const t = this.ts.t().selfEmploymentGuide.notes;
    return {
      sectionLabel: t.sectionLabel,
      heading: t.heading,
      items: t.items,
    };
  });

  protected readonly cta = computed(() => {
    const t = this.ts.t().selfEmploymentGuide.cta;
    return {
      heading: t.heading,
      subtext: t.subtext,
      primaryCtaLabel: t.primaryCta,
      primaryCtaHref: 'https://jobsplus.gov.mt/knowledge-base/how-can-i-register-as-self-employed',
      secondaryCtaLabel: t.secondaryCta,
      secondaryCtaHref: '/tax-calculator',
      note: t.note,
    };
  });
}
