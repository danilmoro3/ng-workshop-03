// tslint:disable
import { Injectable } from '@angular/core';
import { merge, OperatorFunction, Subject } from 'rxjs';
import { scan, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private _news$ = new Subject<string>();
  private _breakingNews$ = new Subject<string>();

  news$ = this._news$.pipe(storeNews(), shareReplay());
  breakingNews$ = this._breakingNews$.pipe(storeNews(), shareReplay());

  allNews$ = merge(
    // combineLatest will start emitting when all of it's streams will emit at least one time
    // that is why startWith() operator is required here - we want to emit normal news
    // even when there were no breaking news yet and vice versa
    this.breakingNews$,
    this.news$
  ).pipe(scan((breaking, news) => [...breaking, news[news.length - 1]], []));

  addNews(news: string) {
    this._news$.next(news);
  }

  addBreakingNews(news: string) {
    this._breakingNews$.next(`BREAKING: ${news}`);
  }
}

/**
 * RxJS operator function that accumulates every news into array of news
 */
function storeNews(): OperatorFunction<string, string[]> {
  return news$ =>
    news$.pipe(
      scan<string, string[]>((allNews, news) => [...allNews, news], [])
    );
}
