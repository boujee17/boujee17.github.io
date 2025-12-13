import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Trip {
  tripCode: string;
  name: string;
  length: number;
  start: string;
  resort: string;
  perPerson: number;
  image: string;
  description: string;
}

export type NewTrip = Omit<Trip, 'tripCode'>;

@Injectable({ providedIn: 'root' })
export class TripsService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/trips';

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.baseUrl);
  }

  getTrip(tripCode: string): Observable<Trip> {
    return this.http.get<Trip>(`${this.baseUrl}/${tripCode}`);
  }

  addTrip(trip: NewTrip): Observable<Trip> {
    return this.http.post<Trip>(this.baseUrl, trip);
  }

  updateTrip(tripCode: string, trip: Partial<Trip>): Observable<Trip> {
    return this.http.put<Trip>(`${this.baseUrl}/${tripCode}`, trip);
  }

  
  deleteTrip(tripCode: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${tripCode}`);
  }
}
