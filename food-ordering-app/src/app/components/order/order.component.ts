import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
})
export class OrderComponent implements OnInit {
  orderDetails = {
    name: '',
    address: '',
    phone: '',
    paymentMethod: 'Credit Card'
  };
  totalPrice: number = 0;
  apiUrl = 'http://localhost:5004/api/orders';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.getTotalPrice();
  }

  getTotalPrice(): void {
    this.http.get<{ total: number }>('http://localhost:5004/api/cart/total')
      .subscribe(response => {
        this.totalPrice = response.total;
      });
  }

  placeOrder(): void {
    if (!this.orderDetails.name || !this.orderDetails.address || !this.orderDetails.phone) {
      alert('Please fill in all fields.');
      return;
    }

    this.http.post(this.apiUrl, this.orderDetails)
      .subscribe({
        next: (response: any) => {
          alert('Order placed successfully!');
          this.router.navigate(['/order-status']);
        },
        error: (err) => {
          alert(err.error.message || 'Error placing order.');
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }
}