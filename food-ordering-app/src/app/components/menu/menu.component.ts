import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit {
  foodItems: any[] = [];
  apiUrl = 'http://localhost:5004/api/menu';
  cartApiUrl = 'http://localhost:5004/api/cart/add';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getMenuItems();
  }

  getMenuItems(): void {
    this.http.get<any[]>(this.apiUrl).subscribe((data) => {
      this.foodItems = data;
    });
  }

  addToCart(item: any): void {
    this.http.post(this.cartApiUrl, item).subscribe(() => {
      alert(`${item.name} added to cart!`);
    });
  }
}