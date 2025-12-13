import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TripsService, Trip } from '../../services/trips.service';

@Component({
  selector: 'app-trip-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Edit Trip</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <label>Name <input formControlName="name" required></label><br>
      <label>Length (days) <input type="number" formControlName="length" required></label><br>
      <label>Start <input type="date" formControlName="start" required></label><br>
      <label>Resort <input formControlName="resort" required></label><br>
      <label>Per Person <input type="number" formControlName="perPerson" required></label><br>
      <label>Image <input formControlName="image"></label><br>
      <label>Description <textarea formControlName="description"></textarea></label><br>
      <button type="submit" [disabled]="form.invalid">Update</button>
    </form>
  `
})
export class TripEditComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private trips = inject(TripsService);
  private router = inject(Router);

  tripCode = this.route.snapshot.paramMap.get('tripCode')!;
  form = this.fb.group({
    name: ['', Validators.required],
    length: [0, Validators.required],
    start: ['', Validators.required],
    resort: ['', Validators.required],
    perPerson: [0, Validators.required],
    image: [''],
    description: ['']
  });

  constructor() {
    this.trips.getTrip(this.tripCode).subscribe((t: Trip) => {
      this.form.patchValue({
        name: t.name,
        length: t.length,
        start: (t.start ?? '').slice(0,10),
        resort: t.resort,
        perPerson: t.perPerson,
        image: t.image,
        description: t.description
      });
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    const raw = this.form.value;
    const value = {
      name: (raw.name ?? '') as string,
      length: Number(raw.length ?? 0),
      start: (raw.start ?? '') as string,
      resort: (raw.resort ?? '') as string,
      perPerson: Number(raw.perPerson ?? 0),
      image: (raw.image ?? '') as string,
      description: (raw.description ?? '') as string
    };
    this.trips.updateTrip(this.tripCode, value).subscribe(() => this.router.navigate(['/trips']));
  }
}
