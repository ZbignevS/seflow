import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';
import type { ClientDto, CreateClientRequest, UpdateClientRequest } from '@seflow/contracts';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getClients(): Observable<ClientDto[]> {
    return this.http.get<ClientDto[]>(`${this.apiUrl}/clients`);
  }

  getClientById(id: string): Observable<ClientDto> {
    return this.http.get<ClientDto>(`${this.apiUrl}/clients/${id}`);
  }

  createClient(data: CreateClientRequest): Observable<ClientDto> {
    return this.http.post<ClientDto>(`${this.apiUrl}/clients`, data);
  }

  updateClient(id: string, data: UpdateClientRequest): Observable<ClientDto> {
    return this.http.patch<ClientDto>(`${this.apiUrl}/clients/${id}`, data);
  }

  deleteClient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clients/${id}`);
  }
}
