import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly ts = inject(TranslationService);

  transform(key: string): string {
    const parts = key.split('.');
    let node: unknown = this.ts.t();
    for (const part of parts) {
      if (node !== null && typeof node === 'object') {
        node = (node as Record<string, unknown>)[part];
      } else {
        return key;
      }
    }
    return typeof node === 'string' ? node : key;
  }
}
