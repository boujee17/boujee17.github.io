// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { TripsListComponent } from './pages/trips-list/trips-list';
import { TripAddComponent } from './pages/trip-add/trip-add';
import { TripEditComponent } from './pages/trip-edit/trip-edit';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './services/auth.guard'; 

export const routes: Routes = [
  { path: '', redirectTo: 'trips', pathMatch: 'full' },
  { path: 'trips', component: TripsListComponent },
  // protect admin-only routes
  { path: 'trips/add', component: TripAddComponent, canActivate: [authGuard] },
  { path: 'trips/:tripCode/edit', component: TripEditComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: 'trips' }
];

