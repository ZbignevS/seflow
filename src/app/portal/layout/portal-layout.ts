import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PortalNavbarComponent } from './portal-navbar/portal-navbar';

@Component({
  selector: 'app-portal-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, PortalNavbarComponent],
  templateUrl: './portal-layout.html',
  styleUrl: './portal-layout.scss',
})
export class PortalLayoutComponent {}
