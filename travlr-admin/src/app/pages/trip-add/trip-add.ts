import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TripsService, NewTrip } from '../../services/trips.service';

@Component({
  selector: 'app-trip-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Add Trip</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <label>Name <input formControlName="name" required></label><br>
      <label>Length (days) <input type="number" formControlName="length" required></label><br>
      <label>Start <input type="date" formControlName="start" required></label><br>
      <label>Resort <input formControlName="resort" required></label><br>
      <label>Per Person <input type="number" formControlName="perPerson" required></label><br>
      <label>Image <input formControlName="image"></label><br>
      <label>Description <textarea formControlName="description"></textarea></label><br>
      <button type="submit" [disabled]="form.invalid">Save</button>
    </form>
  `
})
export class TripAddComponent {
  private fb = inject(FormBuilder);
  private trips = inject(TripsService);
  private router = inject(Router);

  form = this.fb.group({
    name: ['', Validators.required],
    length: [0, Validators.required],
    start: ['', Validators.required],
    resort: ['', Validators.required],
    perPerson: [0, Validators.required],
    image: [''],
    description: ['']
  });

  submit(): void {
    if (this.form.invalid) return;
    const raw = this.form.value;
  
    // make a code like "iceland-aurora-5d"
    const tripCode = (raw.name ?? '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 24);
  
    const trip = {
      tripCode,
      name: (raw.name ?? '') as string,
      length: Number(raw.length ?? 0),
      start: (raw.start ?? '') as string,
      resort: (raw.resort ?? '') as string,
      perPerson: Number(raw.perPerson ?? 0),
      image: (raw.image ?? '') as string,
      description: (raw.description ?? '') as string
    };
  
    this.trips.addTrip(trip).subscribe({
      next: () => this.router.navigate(['/trips']),
      error: (err) => {
        console.error('Add failed', err);
        alert('Add failed: ' + (err?.error?.message ?? err?.message ?? 'unknown error'));
      }
    });
  }
}