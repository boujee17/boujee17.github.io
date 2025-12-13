import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';   
import { TripsService, Trip } from '../../services/trips.service';
import { AuthService } from '../../services/auth.service'; 

@Component({
  selector: 'app-trips-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trips-list.html'
})
export class TripsListComponent {
  private tripsSvc = inject(TripsService);
  public auth = inject(AuthService);
  private router = inject(Router);                
  trips: Trip[] = [];
  loading = true;

  constructor() {
    this.tripsSvc.getTrips().subscribe({
      next: (data: Trip[]) => { 
        this.trips = data; 
        this.loading = false; 
      },
      error: () => { this.loading = false; }
    });
  }

  deleteTrip(code: string) {
    if (!confirm(`Delete trip ${code}?`)) return;
    this.loading = true;
    this.tripsSvc.deleteTrip(code).subscribe({
      next: () => {
        this.trips = this.trips.filter(t => t.tripCode !== code);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to delete trip.');
      }
    });
  }

    logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
