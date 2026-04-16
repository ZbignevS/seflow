import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@core/i18n/pipes/translate.pipe';

@Component({
  selector: 'app-delete-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule, TranslatePipe],
  template: `
    <h2 mat-dialog-title>{{ 'portal.profile.deleteConfirmTitle' | translate }}</h2>
    <mat-dialog-content>
      <p>{{ 'portal.profile.warningDelete' | translate }}</p>
      <p>{{ 'portal.profile.deleteConfirmText' | translate }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="cancel()">
        {{ 'portal.profile.deleteCancel' | translate }}
      </button>
      <button mat-raised-button color="warn" type="button" (click)="confirm()">
        {{ 'portal.profile.deleteConfirm' | translate }}
      </button>
    </mat-dialog-actions>
  `,
})
export class DeleteConfirmDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<DeleteConfirmDialogComponent>);

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected confirm(): void {
    this.dialogRef.close(true);
  }
}
