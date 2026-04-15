import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthModalComponent } from '../auth-modal/auth-modal';

export type AuthTab = 'login' | 'register';

export interface AuthDialogData {
  initialTab: AuthTab;
}

@Injectable({ providedIn: 'root' })
export class AuthModalService {
  private readonly dialog = inject(MatDialog);
  private dialogRef: MatDialogRef<AuthModalComponent> | null = null;

  open(tab: AuthTab = 'login'): void {
    if (this.dialogRef) return;
    this.dialogRef = this.dialog.open(AuthModalComponent, {
      width: '440px',
      maxWidth: '96vw',
      panelClass: 'auth-dialog',
      autoFocus: 'first-tabbable',
      data: { initialTab: tab } satisfies AuthDialogData,
    });
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null;
    });
  }

  close(): void {
    this.dialogRef?.close();
  }
}
