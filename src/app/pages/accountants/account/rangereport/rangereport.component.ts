import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

import { Subject } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatIcon } from '@angular/material/icon';





import * as XLSX from 'xlsx';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

import autoTable from 'jspdf-autotable';

import { EmrSegmentedModule } from '@elementar/components';
import { MatDialog} from '@angular/material/dialog';
import { PermissionService } from '../../../../services/authentication/permission.service';
import { RangereportService } from '../../../../services/accountants/rangereport.service';
import { SourcesService } from '../../../../services/accountants/sources.service';
import { SourceTypeService } from '../../../../services/accountants/source-type.service';
import { environment } from '../../../../../environments/environment.prod';

@Component({
  selector: 'app-rangereport',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatTableModule,
    MatPaginatorModule,
    MatAutocompleteModule,
    MatInput,
    MatIcon,
    MatFormFieldModule,
    EmrSegmentedModule
  ],
  templateUrl: './rangereport.component.html',
  styleUrl: './rangereport.component.scss'
})
export class RangereportComponent implements OnInit, OnDestroy {
  public documentUrl = environment.fileUrl;
  private readonly onDestroy = new Subject<void>();

   sources: any[] = [];
  sourceTypes: any[] = [];
  reportForm: FormGroup;
  displayedColumns: string[] = ['no', 'name', 'amount', 'tin_number', 'source_name','source_type_name','category_name','document_type_name','pdf_file'];
  dataSource = new MatTableDataSource<any>();

  documents: any[] = [];
  loading = false;
  errorMessage = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public permission: PermissionService,
    // public locationService: LocationService,
     private sourceServices:SourcesService,
    private sourceTypeService:SourceTypeService,
    private reportService: RangereportService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {}



  renew(): void {
    this.fetchReports();
  }
   viewPDF(element: any) {
    if (element?.document_file) {
      const url = this.documentUrl + element.document_file;
      window.open(url, '_blank');
    }
  }


  configForm(): void {
    this.reportForm = new FormGroup({
      source_name: new FormControl(null),
      source_type_name: new FormControl(null),
      start_date: new FormControl(null,Validators.required),
      end_date: new FormControl(null,Validators.required),

    });
  }
  fetchReports() {
  if (this.reportForm.invalid) {
    this.errorMessage = 'Please select valid start and end dates.';
    return;
  }

  const { start_date, end_date, source_name, source_type_name } = this.reportForm.value;

  if (new Date(start_date) > new Date(end_date)) {
    this.errorMessage = 'Start date cannot be after end date.';
    return;
  }

  this.errorMessage = '';
  this.loading = true;

  const requestData: any = {
    start_date,
    end_date,
  };

  if (source_name) {
    requestData.source_id = source_name;
  }

  if (source_type_name) {
    requestData.source_type_id = source_type_name;
  }

  this.reportService.generateDateReports(requestData).subscribe({
    next: (response) => {
      this.documents = response.data;
      this.dataSource.data = this.documents;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.loading = false;
    },
    error: () => {
      this.errorMessage = 'Error fetching reports';
      this.loading = false;
    }
  });
}


  // fetchReports() {
  //   if (this.reportForm.invalid) {
  //     this.errorMessage = 'Please select valid start and end dates.';
  //     return;
  //   }

  //   const { start_date, end_date } = this.reportForm.value;
  //   if (new Date(start_date) > new Date(end_date)) {
  //     this.errorMessage = 'Start date cannot be after end date.';
  //     return;
  //   }

  //   this.errorMessage = '';
  //   this.loading = true;

  //   this.reportService.generateDateReport(start_date, end_date).subscribe({
  //     next: (response) => {
  //       this.documents = response.data;
  //       console.log("data hzii",this.documents);
  //       this.dataSource.data = this.documents; // Fix: Assign data to dataSource
  //       this.dataSource.paginator = this.paginator;
  //       this.dataSource.sort = this.sort; // Fix: Enable sorting
  //       this.loading = false;
  //     },
  //     error: () => {
  //       this.errorMessage = 'Error fetching reports';
  //       this.loading = false;
  //     }
  //   });
  // }

  // Fix: Improve search filter to work across all columns
  ngOnInit(): void {
    this.configForm();
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return Object.values(data).some((value) =>
        String(value).toLowerCase().includes(filter)
      );
    };
     this.getSource();
  }


  onSourceChange(sourceName: string): void {


  this.sourceTypeService.getSourceTypesBySourceName(sourceName).subscribe({
    next: (response) => {
      this.sourceTypes = response.data || [];

    },
    error: (err) => {
      this.sourceTypes = [];
      //console.error("Failed to fetch source types:", err);
    }
  });
}

public onGetSourceTypeName(sourceName: any): void {
  this.onSourceChange(sourceName);
  // console.log('SOUCE NAME: ', sourceName)
}


   getSource(){
    this.sourceServices.getAllSource().subscribe(response=>{
      this.sources=response.data;


    })
  }

  // Fix: Override default search functionality
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


exportExcel(): void {
  const dataToExport = this.dataSource.data;

  // Filter and format the data
  const selectedFields = dataToExport.map((item: any) => ({
    Payee: item.payee_name,
    Amount: item.amount,
    DocumentType: item.document_type_name,
    TIN: item.tin_number,
    SourceType: item.source_type_name,
    SourceName: item.source_name,
    Category: item.category_name,
  }));

  // Create an empty sheet
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);

  // Add custom title row at the top (A1)
  XLSX.utils.sheet_add_aoa(worksheet, [['DOCUMENT REPORT']], { origin: 'A1' });

  // Merge title across 7 columns (A1 to G1)
  worksheet['!merges'] = [
    {
      s: { r: 0, c: 0 }, // start cell (row 0, col 0)
      e: { r: 0, c: 6 }, // end cell (row 0, col 6) -> column G
    },
  ];

  // Optionally set alignment for the title cell
  const titleCell = worksheet['A1'];
  if (titleCell) {
    titleCell.s = {
      alignment: { horizontal: 'center' },
      font: { bold: true, sz: 14 },
    };
  }

  // Add blank row
  XLSX.utils.sheet_add_aoa(worksheet, [[]], { origin: -1 });

  // Add data below the blank row
  XLSX.utils.sheet_add_json(worksheet, selectedFields, {
    origin: -1,
    skipHeader: false,
  });

  // Create the workbook
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Reports': worksheet },
    SheetNames: ['Reports'],
  };

  // Write buffer
  const excelBuffer: any = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
    cellStyles: true, // needed for formatting
  });

  // Download file
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'document-report.xlsx';
  a.click();
  window.URL.revokeObjectURL(url);
}
  exportPDF() {
    const doc = new jsPDF();
    doc.text('Report Data', 10, 10);

    autoTable(doc, {
      head: [['No', 'name', 'amount', 'tin_number', 'source_name','source_type_name','category_name','document_type_name']],
      body: this.dataSource.data.map((element, index) => [
        index + 1,
        element.payee_name,
        element.amount,
        element.tin_number,
        element.source_name,
        element.source_type_name,
        element.category_name,
        element.document_type_name
      ]),
    });

    doc.save('report.pdf');
  }


  ngOnDestroy(): void {
    this.onDestroy.next();
  }


}


