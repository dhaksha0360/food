import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-order-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-status.component.html',
  styleUrls: ['./order-status.component.css'],
})
export class OrderStatusComponent implements OnDestroy {
  order: any = null;
  orderStatus = 'Pending...';
  socket: Socket;

  constructor(private router: Router) {
    // Get order details from navigation state
    const navigation = this.router.getCurrentNavigation();
    this.order = navigation?.extras.state?.['order'];

    // Connect to Socket.io backend
    this.socket = io('http://localhost:5004');

    // Listen for order status updates from server
    this.socket.on('orderStatusUpdate', (status: string) => {
      this.orderStatus = status;
    });

    // If order exists, send order details to server
    if (this.order) {
      this.socket.emit('newOrder', this.order);
    }
  }

  // Navigate to Menu when Confirm Order is clicked
  goToMenu() {
    this.socket.disconnect(); // ✅ Disconnect socket before navigating
    this.router.navigate(['/menu']);
  }

  // Cleanup when component is destroyed
  ngOnDestroy() {
    this.socket.disconnect();
  }
}