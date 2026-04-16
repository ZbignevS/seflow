import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';
import type {
  CreateInvoiceRequest,
  InvoiceDto,
  InvoiceListItemDto,
  InvoicePreviewPayload,
  UpdateInvoiceRequest,
} from '@seflow/contracts';

@Injectable({ providedIn: 'root' })
export class InvoicesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/invoices`;

  list(): Observable<InvoiceListItemDto[]> {
    return this.http.get<InvoiceListItemDto[]>(this.base);
  }

  getById(id: string): Observable<InvoiceDto> {
    return this.http.get<InvoiceDto>(`${this.base}/${id}`);
  }

  create(body: CreateInvoiceRequest = {}): Observable<InvoiceDto> {
    return this.http.post<InvoiceDto>(this.base, body);
  }

  update(id: string, body: UpdateInvoiceRequest): Observable<InvoiceDto> {
    return this.http.patch<InvoiceDto>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  finalize(id: string): Observable<InvoiceDto> {
    return this.http.post<InvoiceDto>(`${this.base}/${id}/finalize`, {});
  }

  preview(id: string): Observable<InvoicePreviewPayload> {
    return this.http.post<InvoicePreviewPayload>(`${this.base}/${id}/preview`, {});
  }
}
