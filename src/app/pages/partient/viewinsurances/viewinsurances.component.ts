import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAnchor, MatButton, MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { EmrSegmentedModule, VDividerComponent } from '@elementar/components';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { PermissionService } from '../../../services/authentication/permission.service';
import { PartientService } from '../../../services/partient/partient.service';
import { Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { InsuranceComponent } from '../insurance/insurance.component';

@Component({
  selector: 'app-viewinsurances',
  standalone: true,
  imports: [
     CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatDivider,
    MatIcon,
    MatMiniFabButton,
    MatIconButton,
    VDividerComponent,
    MatTooltip,
    MatSlideToggleModule,
    FormsModule,
    MatAnchor,
    MatButton,
    EmrSegmentedModule
  ],
  templateUrl: './viewinsurances.component.html',
  styleUrl: './viewinsurances.component.scss'
})
export class ViewinsurancesComponent {

private readonly onDestroy = new Subject<void>()
 loading: boolean = false;


  constructor(
    public permission: PermissionService,
    private userService: PartientService,
    private dialog: MatDialog,
    private router:Router,

  ){}

  displayedColumns: string[] = ['id','name','phone','location','position','job','action','action2'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  ngOnInit(): void {
    this.userPetient();
  }
  ngOnDestroy(): void {
    this.onDestroy.next()
  }
  renew(){
    this.userPetient();
  }


  userPetient() {
    this.loading = true;
    this.userService.getAllPartients().pipe(takeUntil(this.onDestroy)).subscribe((response: any) => {
      this.loading = false;
      if (response.data) {
        this.dataSource = new MatTableDataSource(response.data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      } else {
        console.log('permission response errors');
      }
    }, (error) => {
      this.loading = false;
      console.log('permission getAway api fail to load');
    });
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }





  getInsurance(id:any){
    // console.log("hiiii",id);
    let config = new MatDialogConfig()
    config.disableClose = false
    config.role = 'dialog'
    config.maxWidth ='100vw'
    config.maxHeight = '100vh'
    config.width = '850px'
    config.panelClass = 'full-screen-modal'
    config.data = {id: id}

    const dialogRef = this.dialog.open(InsuranceComponent,config);

    dialogRef.afterClosed().subscribe(result => {
      this.userPetient();
    });
  }

  displayMoreData(data: any) {

    const id = data.patient_id;
     this.router.navigate(['/pages/patient/more', id]); // Navigate to the new page with complain_id
   }



  }

