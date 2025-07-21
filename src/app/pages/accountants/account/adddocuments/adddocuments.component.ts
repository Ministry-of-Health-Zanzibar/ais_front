import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatError, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { HDividerComponent } from '@elementar/components';
import { map, Observable, startWith, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { RolePermissionService } from '../../../../services/users/role-permission.service';
import { DocumentsService } from '../../../../services/accountants/documents.service';
import { SourcesService } from '../../../../services/accountants/sources.service';
import { CategoryService } from '../../../../services/accountants/category.service';
import { DocumentTypeService } from '../../../../services/accountants/document-type.service';
import { response } from 'express';
import { SourceTypeService } from '../../../../services/accountants/source-type.service';

@Component({
  selector: 'app-adddocuments',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatLabel,
    MatDialogModule,
    MatError,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatSelect,
    MatDatepickerModule
  ],
  templateUrl: './adddocuments.component.html',
  styleUrl: './adddocuments.component.scss'
})
export class AdddocumentsComponent {

 private readonly onDestroy = new Subject<void>()
  readonly data = inject<any>(MAT_DIALOG_DATA);
  public sidebarVisible:boolean = true

  userForm: FormGroup;
  user: any;
  sourceData:any;
  documents: any;
  sources: any[] = [];
  sourceTypes: any[] = [];
  category: any;
  options: any[] = [];
  myControl = new FormControl('');
  filteredOptions: Observable<any[]>;
 // selectedAttachement: File = null!;
  selectedAttachement: File | null = null;

  constructor(
    private docService:DocumentsService,
    private sourceServices:SourceTypeService,
    private sourcesServices:SourcesService,
    private categoryServices:CategoryService,
    private documentType:DocumentTypeService,
    private roleService: RolePermissionService,
    private dialogRef: MatDialogRef<AdddocumentsComponent>) {

  }

  ngOnInit(): void {

    if(this.data){
      this.sourceData = this.data.data;
     
    }
    this.configForm();
    this.getCategory();
    this.getDocumentType();


   this.getSouurce();

  }

  ngOnDestroy(): void {
    this.onDestroy.next()
  }

  onClose() {
    this.dialogRef.close(false)
  }

  configForm(){
    this.userForm = new FormGroup({
      payee_name: new FormControl(null, Validators.required ),
      amount: new FormControl(null, Validators.required),
      tin_number: new FormControl(null, Validators.required),
      source_name: new FormControl(null, Validators.required),
      source_type_id: new FormControl(null),
      category_id: new FormControl(null),
      document_type_id: new FormControl(null),
      year: new FormControl(null, Validators.required),
      document_file:new FormControl(null, Validators.required),

    });
    if(this.sourceData){
      this.userForm.patchValue(this.sourceData);
    }
  }


  // getDocumentById(id: any) {
  //   this.docService.getDocumentById(id).subscribe(response => {
  //     if (response.statusCode == 200) {
  //       this.user = response.data[0];
  //       this.userForm.patchValue(this.user);

  //       // ✅ Handle source_name and dynamically load source types
  //       if (this.user.source_name) {
  //         this.userForm.patchValue({ source_name: this.user.source_name });
  //         this.onSourceChange(this.user.source_name);
  //       }

  //     } else {
  //       Swal.fire({
  //         title: "Error",
  //         text: response.message,
  //         icon: "error",
  //         confirmButtonColor: "#4690eb",
  //         confirmButtonText: "Close"
  //       });
  //     }
  //   });
  // }


  getCategory(){
    this.categoryServices.getAllCategory().subscribe(response=>{
      this.category=response.data;

    })
  }

  getDocumentType(){
    this.documentType.getAllDocumentType().subscribe(response=>{
      this.documents=response.data;

    })
  }

  onSourceChange(selectedSourceName: string): void {
    this.sourceServices.getSourceTypesBySourceName(selectedSourceName)
      .subscribe((response) => {
        console.log("data ",response.data)
        if (response.data) {
          this.sourceTypes = response.data;
        } else {
          this.sourceTypes = [];
        }
      });
  }

  getSouurce(){
    this.sourcesServices.getAllSource().subscribe(response=>{
      this.sources=response.data;

    })
  }



  updateUser(){
    if(this.userForm.valid){

      this.docService.updateDocument(this.userForm.value,this.sourceData.document_form_id).subscribe(response=>{
        if(response.statusCode == 200){
          Swal.fire({
            title: "Success",
            text: response.message,
            icon: "success",
            confirmButtonColor: "#4690eb",
            confirmButtonText: "Close"
          });
        }
        else{
          Swal.fire({
            title: "Error",
            text: response.message,
            icon: "error",
            confirmButtonColor: "#4690eb",
            confirmButtonText: "Close"
          });
        }
      })
    }
  }


  onAttachementSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedAttachement = input.files[0];
      this.userForm.get('document_file')?.setValue(this.selectedAttachement.name);
      this.userForm.get('document_file')?.updateValueAndValidity();
    }
  }



  saveUser() {
    if (this.userForm.valid) {
      const formData = new FormData();

      Object.keys(this.userForm.controls).forEach(key => {
        if (key === 'document_file') {
          if (this.selectedAttachement) {
            formData.append('document_file', this.selectedAttachement);
          }
        } else {
          const value = this.userForm.get(key)?.value;
          formData.append(key, value ?? '');
        }
      });

      this.docService.addDocument(formData).subscribe(response => {
        if (response.statusCode === 201) {
          Swal.fire({
            title: "Success",
            text: response.message,
            icon: "success",
            confirmButtonColor: "#4690eb",
            confirmButtonText: "Close"
          }).then(() => {
            this.dialogRef.close(true); // 👈 Pass true to indicate success
          });
        }else {
          Swal.fire({
            title: "Error",
            text: response.message,
            icon: "error",
            confirmButtonColor: "#4690eb",
            confirmButtonText: "Close"
          });
        }
      });
    }
  }




  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Handle the file (e.g., store it, upload it, etc.)
      console.log(file.name);
    }
  }

}

