import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  isLoading: boolean = false;
  constructor(public authService: AuthService) {}

  onSignup(form: NgForm) {
    if (form.invalid) return;
    this.isLoading = true;
    this.authService.createUser(
      form.value.email,
      form.value.password,
      form.value.username
    );
  }
  ngOnInit(): void {}
}