import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { EmrPinInputModule, HDividerComponent } from '@elementar/components';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatError, MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { PasswordStrengthModule } from '@elementar/components';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/authentication/auth.service';
import { GlobalConstants } from '@shared/global-constants';
import { MatTooltip } from '@angular/material/tooltip';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-set-new-password',
  standalone: true,
  imports: [
    MatIcon,
    RouterLink,
    EmrPinInputModule,
    FormsModule,
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    PasswordStrengthModule,
    MatHint,
    MatIconButton,
    MatSuffix,
    HDividerComponent,
     MatError,
    MatTooltip,
    NgIf

  ],
  templateUrl: './set-new-password.component.html',
  styleUrl: './set-new-password.component.scss'
})
export class SetNewPasswordComponent {
  credentialForm:any = FormGroup;
  passwordVisible: boolean = false;
  newPasswordVisible: boolean = false;
  passwordConfirmVisible: boolean = false;
  passwordConfirmed: boolean = false;

  constructor(private formBuilder:FormBuilder,
    private route:Router,
    private authService:AuthService,){}

    ngOnInit(): void {
      this.credentialFormData();
    }

  public credentialFormData(){
    this.credentialForm = this.formBuilder.group({
      old_password: new FormControl(null, [Validators.required]),
      new_password: new FormControl(null, [Validators.required]),
      password_confirmation: new FormControl(null, [Validators.required]),
    },{
      validators: this.checkPassword('new_password', 'password_confirmation') // Apply the custom validator
    });
  }

  // Function to toggle password visibility
  togglePasswordVisibility(visibility: any): void {
    if(visibility == 'new'){
      this.passwordVisible = !this.passwordVisible;
    }
    if(visibility == 'old'){
      this.newPasswordVisible = !this.newPasswordVisible;
    }
    if(visibility == 'confirm'){
      this.passwordConfirmVisible = !this.passwordConfirmVisible;
    }

  }

  checkPassword(new_password: any, password_confirmation: any): ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null => {
      const passwordValue = control.get(new_password)?.value;
      const confirmPasswordValue = control.get(password_confirmation)?.value;

      if (passwordValue && confirmPasswordValue && passwordValue !== confirmPasswordValue) {
        return { passwordsMismatch: true };
      }
      return null;
    };
  }

  submit(){
    this.authService.changePassword(this.credentialForm.value).subscribe((response) => {
      if(response.statusCode == 201){
        Swal.fire({
          title: "Success",
          text: response.message,
          icon: "success",
          confirmButtonColor: "#4690eb",
          confirmButtonText: "Continue"
        });
        this.route.navigateByUrl("auth")
      }
      else{
        Swal.fire({
          title: "Error",
          text: response.message,
          icon: "error",
          confirmButtonColor: "#4690eb",
          confirmButtonText: "Continue"
        });
      }
    },(error) => {
      Swal.fire({
        title: 'Warning!',
        text: GlobalConstants.genericErrorConnectFail,
        icon: 'warning',
        confirmButtonText: 'OK',
      });
    });

  }
}