import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';
import type {
  CreateExpenseRequest,
  ExpenseDto,
  ExpenseListItemDto,
  UpdateExpenseRequest,
} from '@seflow/contracts';

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/expenses`;

  list(): Observable<ExpenseListItemDto[]> {
    return this.http.get<ExpenseListItemDto[]>(this.base);
  }

  getById(id: string): Observable<ExpenseDto> {
    return this.http.get<ExpenseDto>(`${this.base}/${id}`);
  }

  create(body: CreateExpenseRequest = {}): Observable<ExpenseDto> {
    return this.http.post<ExpenseDto>(this.base, body);
  }

  update(id: string, body: UpdateExpenseRequest): Observable<ExpenseDto> {
    return this.http.put<ExpenseDto>(`${this.base}/${id}`, body);
  }

  patch(id: string, body: Partial<UpdateExpenseRequest>): Observable<ExpenseDto> {
    return this.http.patch<ExpenseDto>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  togglePaid(id: string): Observable<ExpenseDto> {
    return this.http.post<ExpenseDto>(`${this.base}/${id}/toggle-paid`, {});
  }
}
