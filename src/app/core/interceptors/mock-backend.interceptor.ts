import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { Commitment  } from '../../domain/commitment.model';

@Injectable()
export class MockBackendInterceptor implements HttpInterceptor {

  private readonly MOCK_API_URL = 'api.mock/compromissos';
  private dbCommitment: Commitment[] = this.initDb();

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { url, method } = req;

    if (url.includes(this.MOCK_API_URL)) {
      return of(null).pipe(
        mergeMap(() => {
          switch (method) {
            case 'GET':
              return this.handleGet(req);
            case 'POST':
              return this.handlePost(req);
            case 'PUT':
              return this.handlePut(req);
            case 'DELETE':
              return this.handleDelete(req);
            default:
              return next.handle(req);
          }
        }),
        delay(500)
      );
    }

    return next.handle(req);
  }

  private handleGet(req: HttpRequest<any>): Observable<HttpResponse<any>> {
  const commitmentRegex = /\/compromissos\/.+/;

  if (!commitmentRegex.exec(req.url)) {
    return of(
      new HttpResponse({
        status: 200,
        body: [...this.dbCommitment]
      })
    );
  }

  return of(new HttpResponse({ status: 200, body: null }));
  }

  private handlePost(req: HttpRequest<any>): Observable<HttpResponse<any>> {
    const novoCompromisso: Commitment  = {
      ...req.body,
      id: crypto.randomUUID(),
    };

    this.dbCommitment.push(novoCompromisso);

    return of(new HttpResponse({ status: 201, body: { ...novoCompromisso } }));
  }

  private handlePut(req: HttpRequest<any>): Observable<HttpResponse<any>> {
    const idUrl = this.extractIdFromURL(req.url);
    const index = this.dbCommitment.findIndex((c) => c.id === idUrl);

    if (index !== -1) {
      this.dbCommitment[index] = { ...req.body, id: idUrl };
      return of(new HttpResponse({ status: 200, body: this.dbCommitment[index] }));
    }

    return of(new HttpResponse({ status: 404, body: { message: 'Compromisso não encontrado' } }));
  }

  private handleDelete(req: HttpRequest<any>): Observable<HttpResponse<any>> {
    const idUrl = this.extractIdFromURL(req.url);

    this.dbCommitment = this.dbCommitment.filter((c) => c.id !== idUrl);

    return of(new HttpResponse({ status: 204 }));
  }

  private initDb(): Commitment [] {
    const TODAY = new Date();
    const TOMORROW = new Date(TODAY);
    TOMORROW.setDate(TODAY.getDate() + 1);

    return [
      {
        id: '1',
        title: 'Corte de Cabelo',
        description: 'Undercut',
        type: 'Lembrete',
        startDate: new Date(new Date().setHours(9, 0, 0)),
        endDate: new Date(new Date().setHours(10, 0, 0)),
        participants: ['cliente@email.com'],
        color: '#f59e0b',
      },
      {
        id: '2',
        title: 'Consulta Médica',
        description: 'Dermatologista',
        type: 'Consulta',
        startDate: new Date(TOMORROW.setHours(14, 0, 0)),
        endDate: new Date(TOMORROW.setHours(15, 0, 0)),
        participants: ['paciente@email.com'],
        color: '#10b981',
      },
    ];
  }

  private extractIdFromURL(url: string): string {
    return url.split('/').pop() || '';
  }

}
