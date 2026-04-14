import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar';
import { HeroComponent } from './components/hero/hero';
import { StatsBarComponent } from './components/stats-bar/stats-bar';
import { FeatureSectionComponent } from './components/feature-section/feature-section';
import { HowItWorksComponent } from './components/how-it-works/how-it-works';
import { TestimonialsSectionComponent } from './components/testimonials-section/testimonials-section';
import { PricingSectionComponent } from './components/pricing-section/pricing-section';
import { CtaBannerComponent } from './components/cta-banner/cta-banner';
import { SiteFooterComponent } from './components/site-footer/site-footer';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NavbarComponent,
    HeroComponent,
    StatsBarComponent,
    FeatureSectionComponent,
    HowItWorksComponent,
    TestimonialsSectionComponent,
    PricingSectionComponent,
    CtaBannerComponent,
    SiteFooterComponent,
  ],
  templateUrl: './landing.html',
})
export class LandingComponent {}
