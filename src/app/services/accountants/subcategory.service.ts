import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class SubcategoryService {

 private baseUrl: string = `${environment.baseUrl}`;
  private href = `${this.baseUrl}subCategories`;

  constructor(private http: HttpClient) {}

  public getAllSubCategory(): Observable<any> {
    return this.http.get<any>(this.href);
  }
  public getSubCategorysByCategoryName(categoryName: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}subCategories/category/${categoryName}`);
  }


  public getSubCategoryById(id: any): Observable<any> {
    return this.http.get<any>(`${this.href}/${id}`);
  }

  public addSubCategory(category: any): Observable<any> {
    return this.http.post(this.href, category);
  }

  public deleteSubCategory(id:any): Observable<any>{
    return this.http.delete(`${this.href}/${id}`);
  }

  public updateSubCategory(category:any, id:any): Observable<any>{
    return this.http.put(`${this.href}/${id}`,category)
  }

  public unblockSubCategory(data: any, id:any): Observable<any>{
    return this.http.patch(`${this.baseUrl}subCategories/unBlock/${id}`, data);
  }

}

