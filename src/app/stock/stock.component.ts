import { Component, OnInit } from '@angular/core';
import {Stock} from './shared/models/stock.model';
import {Observable, Subject} from 'rxjs';
import {StockService} from './shared/services/stock.service';
import {takeUntil} from 'rxjs/operators';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit {
  title = 'Stock Exchange';
  stocks: Stock[] = [];
  unsubscriber$ = new Subject();
  selectedStock: Stock;
  stockPrice = new FormControl('', [Validators.required, Validators.min(0), Validators.max(9999999)]);

  constructor(private stockService: StockService) { }

  ngOnInit(): void {
    this.stockService.listenForStocks()
      .pipe(
        takeUntil(this.unsubscriber$)
      )
      .subscribe((stocks) => {
        this.stocks = stocks;
        console.log(stocks.length);
      });
    this.stockService.getStock();

    this.stockService.listenForUpdate().pipe(takeUntil(this.unsubscriber$))
      .subscribe((stock) => {this.stockService.getStock();
      if(this.selectedStock !== null && this.selectedStock.id === stock.id){
        this.selectedStock = stock; this.stockPrice.patchValue(stock.value);
      }})
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  selectStock(stockItem: Stock) {
    this.selectedStock = stockItem;
    this.stockPrice.setValue(stockItem.value);
  }

  updatePrice() {

    const price = this.stockPrice.value

    const stock: Stock = {
      id: this.selectedStock.id,
      name: this.selectedStock.name,
      description: this.selectedStock.description,
      value: price
    }

    this.stockService.updateStock(stock);
  }
}
