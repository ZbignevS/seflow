import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { TranslationService } from '@shared/i18n/translation.service';
import { HeroSectionComponent } from '@shared/ui/hero-section/hero-section';
import { FeatureGridComponent } from '@shared/ui/feature-grid/feature-grid';
import { ProcessStepsComponent } from '@shared/ui/process-steps/process-steps';
import { CtaSectionComponent } from '@shared/ui/cta-section/cta-section';
import { ContentChecklistComponent } from '@shared/ui/content-checklist/content-checklist';
import { NavbarComponent } from '../landing/components/navbar/navbar';
import { SiteFooterComponent } from '../landing/components/site-footer/site-footer';
import { IA_FEATURE_STRUCTURE } from './data/individual-activity.data';

@Component({
  selector: 'app-individual-activity',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NavbarComponent,
    HeroSectionComponent,
    FeatureGridComponent,
    ProcessStepsComponent,
    ContentChecklistComponent,
    CtaSectionComponent,
    SiteFooterComponent,
  ],
  templateUrl: './individual-activity.html',
})
export class IndividualActivityComponent {
  private readonly ts = inject(TranslationService);

  protected readonly hero = computed(() => {
    const t = this.ts.t().selfEmployed.hero;
    return {
      badge: t.badge,
      heading: t.heading,
      subtext: t.subtext,
      primaryCtaLabel: t.primaryCta,
      primaryCtaHref: '/register',
      secondaryCtaLabel: t.secondaryCta,
      secondaryCtaHref: '#features',
      notes: t.notes,
    };
  });

  protected readonly features = computed(() => {
    const t = this.ts.t().selfEmployed.features;
    return {
      sectionLabel: t.sectionLabel,
      heading: t.heading,
      description: t.description,
      items: IA_FEATURE_STRUCTURE.map((s) => ({
        ...s,
        title: t.items[s.id].title,
        description: t.items[s.id].description,
      })),
    };
  });

  protected readonly checklist = computed(() => {
    const t = this.ts.t().selfEmployed.checklist;
    return {
      sectionLabel: t.sectionLabel,
      heading: t.heading,
      description: t.description,
      items: t.items.map((text, i) => ({ id: `c${i + 1}`, text })),
    };
  });

  protected readonly steps = computed(() => {
    const t = this.ts.t().selfEmployed.steps;
    return {
      sectionLabel: t.sectionLabel,
      heading: t.heading,
      items: t.items,
    };
  });

  protected readonly cta = computed(() => {
    const t = this.ts.t().selfEmployed.cta;
    return {
      heading: t.heading,
      subtext: t.subtext,
      primaryCtaLabel: t.primaryCta,
      primaryCtaHref: '/register',
      secondaryCtaLabel: t.secondaryCta,
      secondaryCtaHref: '/#pricing',
      note: t.note,
    };
  });
}
