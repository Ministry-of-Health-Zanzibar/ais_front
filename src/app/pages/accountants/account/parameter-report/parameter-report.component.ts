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

import { Observable, Subject } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatIcon } from '@angular/material/icon';

import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import autoTable from 'jspdf-autotable';

import { EmrSegmentedModule } from '@elementar/components';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PermissionService } from '../../../../services/authentication/permission.service';
import { RangereportService } from '../../../../services/accountants/rangereport.service';
import { SourcesService } from '../../../../services/accountants/sources.service';
import { SourceTypeService } from '../../../../services/accountants/source-type.service';
import { CategoryService } from '../../../../services/accountants/category.service';
import { SubcategoryService } from '../../../../services/accountants/subcategory.service';
import { environment } from '../../../../../environments/environment.prod';

@Component({
  selector: 'app-parameter-report',
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
  templateUrl: './parameter-report.component.html',
  styleUrl: './parameter-report.component.scss'
})
export class ParameterReportComponent implements OnInit, OnDestroy {
  public documentUrl = environment.fileUrl;

  loading: boolean = false;
  private readonly onDestroy = new Subject<void>();

  reportForm: FormGroup;
  displayedColumns: string[] = ['no', 'name', 'amount', 'tin_number', 'source_name','source_type_name','category_name','document_type_name','pdf_file'];
  dataSource = new MatTableDataSource<any>();

  documents: any[] = [];
  sources: any[] = [];
  sourceTypes: any[] = [];
   category: any[] = [];
   subcategory: any[] = [];

  errorMessage = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public permission: PermissionService,
    // public locationService: LocationService,
    private sourceServices:SourcesService,
    private sourceTypeService:SourceTypeService,
    private categoryServices:CategoryService,
    private subCategoryServices:SubcategoryService,
    private reportService: RangereportService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {}




  ngOnInit(): void {
    this.configForm();
    this.getSource();
    // this.getSourceType();
    this.getCategory();
  }

  renew(): void {
    this.searchReport();
  }
  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

    onSourceChange(selectedSourceName: string): void {
    this.sourceTypeService.getSourceTypesBySourceName(selectedSourceName)
      .subscribe((response) => {
        console.log("data ",response.data)
        if (response.data) {
          this.sourceTypes = response.data;
        } else {
          this.sourceTypes = [];
        }
      });
  }
   getSource(){
    this.sourceServices.getAllSource().subscribe(response=>{
      this.sources=response.data;

    })
  }

  configForm(): void {
    this.reportForm = new FormGroup({
      source_name: new FormControl(null),
      source_type_name: new FormControl(null),
      amount: new FormControl(null),
      payee_name: new FormControl(null),
      category_name: new FormControl(null),

    });
  }

   onCategoryChange(selectedCategoryName: string): void {
    this.subCategoryServices.getSubCategorysByCategoryName(selectedCategoryName)
      .subscribe((response) => {
        console.log("data ",response.data)
        if (response.data) {
          this.subcategory = response.data;
        } else {
          this.subcategory = [];
        }
      });
  }

  getCategory(){
    this.categoryServices.getAllCategory().subscribe(response=>{
      this.category=response.data;

    })
  }

  searchReport(): void {

    if (this.reportForm.valid) {
      this.loading = true;
      this.reportService.generateReport(this.reportForm.value).subscribe(response => {
        this.loading = false;
        this.dataSource.data = response.data;
        this.dataSource.paginator = this.paginator;
        console.log('Response Data:', response.data);
      });
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



  // Export PDF
  exportPDF() {
    const doc = new jsPDF();
    doc.text('Report Data', 10, 10);

    autoTable(doc, {
      head: [['No', 'Name', 'Amount', 'TIN', 'Source', 'Source Type', 'Category', 'Doc Type']],
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

   viewPDF(element: any) {
    if (element?.document_file) {
      const url = this.documentUrl + element.document_file;
      window.open(url, '_blank');
    }
  }

}




