import { Injectable } from '@angular/core';
import {SocketStock} from '../../../app.module';
import {Stock} from '../models/stock.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(private socketStocks: SocketStock) { }

  getStock() {
    this.socketStocks
      .emit('all-stocks');
  }

  listenForStocks() {
    return this.socketStocks
      .fromEvent<Stock[]>('listenForStocks');
  }

  updateStock(stock: Stock) {
    this.socketStocks
      .emit('updateStock', stock);
  }

  listenForUpdate() {
    return this.socketStocks
      .fromEvent<Stock>('updatedStock');
  }
}
