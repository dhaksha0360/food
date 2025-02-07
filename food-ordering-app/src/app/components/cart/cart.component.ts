import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  socket: any;
  apiUrl = 'http://localhost:5004/api/cart';

  constructor(private http: HttpClient, private router: Router, private cdRef: ChangeDetectorRef) {
    this.socket = io('http://localhost:5004');
  }

  ngOnInit(): void {
    this.getCartItems();

    // Listen for real-time cart updates
    this.socket.on('cartUpdated', (updatedCart: any[]) => {
      this.cartItems = updatedCart;
      this.cdRef.detectChanges(); // 🔹 Force UI update
    });
  }

  // Fetch cart items from API
  getCartItems(): void {
    this.http.get<any[]>(this.apiUrl).subscribe((data) => {
      this.cartItems = data;
      this.cdRef.detectChanges(); // 🔹 Ensure UI updates after data fetch
    });
  }

  // Increase item quantity
  increaseQuantity(index: number): void {
    const item = { ...this.cartItems[index] }; // 🔹 Create a new object reference
    this.http.put(`${this.apiUrl}/increase/${item.id}`, {}).subscribe(() => {
      item.quantity++;
      this.cartItems[index] = item; // 🔹 Update reference so Angular detects change
      this.cdRef.detectChanges(); // 🔹 Trigger UI update
    });
  }

  // Decrease item quantity
  decreaseQuantity(index: number): void {
    const item = { ...this.cartItems[index] };
    if (item.quantity > 1) {
      this.http.put(`${this.apiUrl}/decrease/${item.id}`, {}).subscribe(() => {
        item.quantity--;
        this.cartItems[index] = item;
        this.cdRef.detectChanges();
      });
    }
  }

  // Remove item from cart
  removeFromCart(index: number): void {
    const item = this.cartItems[index];
    this.http.delete(`${this.apiUrl}/remove/${item.id}`).subscribe(() => {
      this.cartItems = this.cartItems.filter((_, i) => i !== index); // 🔹 Create a new array reference
      this.cdRef.detectChanges();
    });
  }

  // Calculate total price
  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  // Proceed to checkout
  proceedToCheckout(): void {
    this.router.navigate(['/order']);
  }

  // Continue shopping
  continueShopping(): void {
    this.router.navigate(['/menu']);
  }
}