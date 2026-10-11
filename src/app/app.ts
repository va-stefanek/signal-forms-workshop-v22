import { Component } from '@angular/core';
import { RegistrationPage } from './registration/registration-page/registration-page';

@Component({
  selector: 'app-root',
  imports: [RegistrationPage],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
