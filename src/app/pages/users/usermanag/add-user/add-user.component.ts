import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatError, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { HDividerComponent } from '@elementar/components';
import { map, Observable, startWith, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { UserService } from '../../../../services/users/user.service';
import { LocationService } from '../../../../services/system-configuration/location.service';
import { RolePermissionService } from '../../../../services/users/role-permission.service';
import { GlobalConstants } from '@shared/global-constants';
import { CouncilService } from '../../../../services/system-configuration/council.service';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatLabel,
    MatDialogModule,
    MatCheckbox,
    MatError,
    ReactiveFormsModule,
    HDividerComponent,
    MatAutocompleteModule,
    MatSelect,
    AsyncPipe,
    MatDatepickerModule,
  ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent {

  private readonly onDestroy = new Subject<void>()
  readonly data = inject<any>(MAT_DIALOG_DATA);
  public sidebarVisible:boolean = true

  userForm: FormGroup;
  user: any;
  userData: any;
  locations: any;
  councils: any;
  roles: any;
  options: any[] = [];
  myControl = new FormControl('');
  filteredOptions: Observable<any[]>;

  constructor(
    private userService: UserService,
    private locationService: LocationService,
    private councilService: CouncilService,
    private roleService: RolePermissionService,
    private dialogRef: MatDialogRef<AddUserComponent>) {

  }

  ngOnInit(): void {
    if(this.data){
      this.userData = this.data.data;
     // this.getHospital(this.id);
    }
    this.configForm();
    this.getRoles();
  }
  //   this.getLocation();

  // }

  ngOnDestroy(): void {
    this.onDestroy.next()
  }

  onClose() {
    this.dialogRef.close(false)
  }

  configForm(){
    this.userForm = new FormGroup({
      first_name: new FormControl(null, [Validators.required, Validators.pattern(GlobalConstants.nameRegexOnly)]),
      middle_name: new FormControl(null, [Validators.required, Validators.pattern(GlobalConstants.nameRegexOnly)]),
      last_name: new FormControl(null, [Validators.required,Validators.pattern(GlobalConstants.nameRegexOnly)]),
      // location_id: new FormControl(null, Validators.required),
      address: new FormControl(null, Validators.required),
      phone_no: new FormControl(null, [Validators.required, Validators.pattern(GlobalConstants.phoneNoRegex)]),
      email: new FormControl(null, [Validators.required, Validators.pattern(GlobalConstants.emailRegex)]),
      gender: new FormControl(null, Validators.required),
      date_of_birth: new FormControl(null, Validators.required),
      role_id: new FormControl(null, Validators.required)
    });
    if(this.userData){
      this.userForm.patchValue(this.userData);
    }
  }

  getLocation() {
    this.locationService.getLocation().subscribe(response => {
      this.locations = response.data;
      this.options = response.data;
      this.filteredOptions = this.userForm.get('location_id')!.valueChanges.pipe(
        startWith(''),
        map((value: any) => typeof value === 'string' ? this._filter(value) : this.options.slice())
      );
    });
  }

  private _filter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.label.toLowerCase().includes(filterValue));
  }

  displayFn(option: any): string {
    return option ? option.label : '';
  }

  trackById(index: number, option: any): any {
    return option.location_id;
  }



  getRoles() {
    this.roleService.getAllRoles().subscribe(response => {
      this.roles = response.data;
      console.log("role",this.roles)
    });
  }

  // getUser(userData: any) {
  //   this.userService.getUserById(userData).subscribe(response=>{
  //     if(response.statusCode == 200){
  //       this.user = response.data[0];
  //       this.userForm.patchValue(this.user);
  //     }
  //     else{
  //       Swal.fire({
  //         title: "error",
  //         text: response.message,
  //         icon: "error",
  //         confirmButtonColor: "#4690eb",
  //         confirmButtonText: "Close"
  //       });
  //     }
  //   })
  // }
        saveUser(){
         if(this.userForm.valid){
           this.userService.addUser(this.userForm.value).subscribe(response=>{
             if(response.statusCode == 201){
               Swal.fire({
                 title: "Success",
                 text: "Data saved successfull",
                 html: "<b>Default Credential</b><br> Username: <b>"+response.email +"</b><br> Password: <b>" +response.password +"</b>",
                 icon: "success",
                 confirmButtonColor: "#4690eb",
                 confirmButtonText: "Continue"
               });
             }else{
               Swal.fire({
                 title: "Error",
                 text: response.message,
                 icon: "error",
                 confirmButtonColor: "#4690eb",
                 confirmButtonText: "Continue"
               });
             }
           }

         );
         }else{

         }
       }

       updateUser(){
         if(this.userForm.valid){
          this.userService.updateUser(this.userForm.value, this.userData.id).subscribe(response=>{
             if(response.statusCode == 201){
               Swal.fire({
                 title: "Success",
                 text: "Data saved successfull",
                 icon: "success",
                 confirmButtonColor: "#4690eb",
                 confirmButtonText: "Continue"
               });
             }else{
               Swal.fire({
                 title: "Error",
                 text: response.message,
                 icon: "error",
                 confirmButtonColor: "#4690eb",
                 confirmButtonText: "Continue"
               });
             }
           }

         );
         }else{

         }
       }
 }

