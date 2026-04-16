import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env';
import type { ChangePasswordRequest, UpdateUserRequest, UserDto } from '@seflow/contracts';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getMe(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.apiUrl}/users/me`);
  }

  updateUser(data: UpdateUserRequest): Observable<UserDto> {
    return this.http.patch<UserDto>(`${this.apiUrl}/users/me`, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/users/change-password`, data);
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/me`);
  }
}
