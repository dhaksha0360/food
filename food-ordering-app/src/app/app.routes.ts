import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MenuComponent } from './components/menu/menu.component';
import { CartComponent } from './components/cart/cart.component';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation.component';
import { OrderComponent } from './components/order/order.component';
import { OrderStatusComponent } from './components/order-status/order-status.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'cart', component: CartComponent },
  { path: 'order-confirmation', component: OrderConfirmationComponent },
  { path: 'order', component: OrderComponent },
  { path: 'order-status', component: OrderStatusComponent },
];