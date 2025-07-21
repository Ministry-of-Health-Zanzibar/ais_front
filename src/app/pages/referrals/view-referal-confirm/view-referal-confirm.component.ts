import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
// import { Router } from 'express';
import { Subject, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatMiniFabButton, MatIconButton, MatAnchor, MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { EmrSegmentedModule, VDividerComponent } from '@elementar/components';
import { MatTooltip } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router, RouterLink } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PermissionService } from '../../../services/authentication/permission.service';
import { ReferralService } from '../../../services/Referral/referral.service';
import { AddReferralsComponent } from '../add-referrals/add-referrals.component';
import Swal from 'sweetalert2';
import { BillComponent } from '../bill/bill.component';
import { ReferralsLetterComponent } from '../referrals-letter/referrals-letter.component';

@Component({
  selector: 'app-view-referal-confirm',
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
        RouterLink,
        EmrSegmentedModule
  ],
  templateUrl: './view-referal-confirm.component.html',
  styleUrl: './view-referal-confirm.component.scss'
})
export class ViewReferalConfirmComponent implements OnInit,OnDestroy{


   private readonly onDestroy = new Subject<void>()
   loading: boolean = false;


      displayedColumns: string[] =
      ['id', 'patient_name', 'referral_type_name',
      'hospital_name', 'referral_reason_name','start_date', 'end_date', 'status', 'action'];
      dataSource: MatTableDataSource<any> = new MatTableDataSource();

      @ViewChild(MatPaginator) paginator!: MatPaginator;
      @ViewChild(MatSort) sort!: MatSort;
  referralsLetter: any;


      constructor(public permission: PermissionService,
        public referralService:ReferralService,
        private router:Router,
        private dialog: MatDialog
        ){}

      ngOnInit(): void {
        this.getReferrals();
      }
      ngOnDestroy(): void {
        this.onDestroy.next()
      }
      renew(){
        this.getReferrals();
      }

     getReferrals() {
  this.loading = true;
  this.referralService.getAllRefferal()
    .pipe(takeUntil(this.onDestroy))
    .subscribe(
      (response: any) => {
        this.loading = false;
        if (response.statusCode === 200) {
          // Filter data to include only items with status === 'Pending'
          const pending = response.data.filter((item: { status: string; }) => item.status === 'Confirmed');
          this.dataSource = new MatTableDataSource(pending);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        } else if (response.statusCode === 401) {
          this.router.navigateByUrl('/');
          console.warn(response.message);
        }
      },
      (error) => {
        this.loading = false;
        this.router.navigateByUrl('/');
        console.error('Failed to load referrals.', error);
      }
    );
}



      applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
      }

      addReferrals() {
        let config = new MatDialogConfig()
        config.disableClose = false
        config.role = 'dialog'
        config.maxWidth ='100vw'
        config.maxHeight = '100vh'
        config.width = '850px'
        config.panelClass = 'full-screen-modal'

        const dialogRef = this.dialog.open(AddReferralsComponent,config);

        dialogRef.afterClosed().subscribe(result => {
          this.getReferrals();
        });
      }

      updateRefererral(id: any) {
        let config = new MatDialogConfig()
        config.disableClose = false
        config.role = 'dialog'
        config.maxWidth ='100vw'
        config.maxHeight = '100vh'
        config.width = '850px'
        config.panelClass = 'full-screen-modal'
        config.data = {id: id}

        const dialogRef = this.dialog.open(AddReferralsComponent,config);

        dialogRef.afterClosed().subscribe(result => {
          this.getReferrals();
        });
      }



      confirmBlock(data: any) {
        const message = data.deleted_at ?
          'Are you sure you want to unblock' :
          'Are you sure you want to block';

        Swal.fire({
          title: "Confirm",
          html: `${message} <b>${data.referral_id}</b>`,
          icon: "warning",
          confirmButtonColor: "#4690eb",
          confirmButtonText: "Confirm",
          cancelButtonColor: "#D5D8DC",
          cancelButtonText: "Cancel",
          showCancelButton: true
        }).then((result) => {
          if (result.isConfirmed) {
            this.toggleReferralStatus(data);
          } else {
            this.getReferrals();
          }
        });
      }

      toggleReferralStatus(data: any): void {
        if (data.deleted_at) {
          // Unblock the referral
          this.referralService.unblockReferral(data.referral_id).subscribe(response => {
            if (response.statusCode === 200) {
              Swal.fire({
                title: "Success",
                text: response.message,
                icon: "success",
                confirmButtonColor: "#4690eb",
                confirmButtonText: "Continue"
              });
              this.getReferrals();
            } else {
              Swal.fire({
                title: "Error",
                text: response.message,
                icon: "error",
                confirmButtonColor: "#4690eb",
                confirmButtonText: "Continue"
              });
            }
          });
        } else {
          // Block the referral (assuming some blocking logic)
          this.referralService.deleteReferral(data.referral_id).subscribe(response => {
            if (response.statusCode === 200) {
              Swal.fire({
                title: "Success",
                text: response.message,
                icon: "success",
                confirmButtonColor: "#4690eb",
                confirmButtonText: "Continue"
              });
              this.getReferrals();
            } else {
              Swal.fire({
                title: "Error",
                text: response.message,
                icon: "error",
                confirmButtonColor: "#4690eb",
                confirmButtonText: "Continue"
              });
            }
          });
        }
      }


          getBills(id:any){
            //  console.log("hiiii",id);
             let config = new MatDialogConfig()
             config.disableClose = false
             config.role = 'dialog'
             config.maxWidth ='100vw'
             config.maxHeight = '100vh'
             config.width = '850px'
             config.panelClass = 'full-screen-modal'
             config.data = {id: id}

             const dialogRef = this.dialog.open(BillComponent,config);

             dialogRef.afterClosed().subscribe(result => {
               this.getReferrals();
             });
           }

           displayMoreData(data: any) {

            const id = data.referral_id;
             this.router.navigate(['/pages/config/referrals/more', id]); // Navigate to the new page with complain_id
           }

            // USER ROLES
    public getUserRole(): any {
      return localStorage.getItem('roles');

    }

    public get isStaff(): boolean {
      return this.getUserRole() === 'ROLE STAFF';
    }


            referralsLetterPopup(data: any): void {
              const dialogRef = this.dialog.open(ReferralsLetterComponent, {
                maxWidth: '100vw',
                maxHeight: '100vh',
                 data: data  // pass referral data to the dialog
              });

              dialogRef.afterClosed().subscribe(result => {
                console.log('The dialog was closed');
              });
            }


      }
