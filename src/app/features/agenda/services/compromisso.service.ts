import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { Commitment } from '../../../domain/commitment.model';
import { LogService } from '../../../core/services/log.service';

@Injectable({
  providedIn: 'root'
})
export class CommitmentService {

  private readonly http = inject(HttpClient);
  private readonly logger = inject(LogService);

  private readonly API_URL = 'api.mock/compromissos';

  public list(): Observable<Commitment[]> {
    return this.http.get<Commitment[]>(this.API_URL).pipe(
      map((list) => list.map(item => this.adaptToModel(item))),

      tap(list => this.logger.info(`[API] Listagem carregada: ${list.length} itens`)),
      catchError(err => this.handleError('Erro ao listar compromissos', err))
    );
  }

  public create(commitment: Commitment): Observable<Commitment> {
    return this.http.post<Commitment>(this.API_URL, commitment).pipe(
      map(item => this.adaptToModel(item)),
      tap(created => this.logger.info(`[API] Compromisso criado [ID: ${created.id}]`)),
      catchError(err => this.handleError('Erro ao criar compromisso', err))
    );
  }

  public update(id: string, commitment: Commitment): Observable<Commitment> {
    return this.http.put<Commitment>(`${this.API_URL}/${id}`, commitment).pipe(
      map(item => this.adaptToModel(item)),
      tap(updated => this.logger.info(`[API] Compromisso atualizado [ID: ${updated.id}]`)),
      catchError(err => this.handleError('Erro ao atualizar compromisso', err))
    );
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => this.logger.info(`[API] Compromisso deletado [ID: ${id}]`)),
      catchError(err => this.handleError('Erro ao remover compromisso', err))
    );
  }

  private adaptToModel(data: any): Commitment {
    return {
      ...data,
      startDate: new Date(data.startDate || data.dataInicio),
      endDate: new Date(data.endDate || data.dataFim)
    };
  }

  private handleError(msg: string, error: any): Observable<never> {
    this.logger.error(`[API] ${msg}`, error);
    return throwError(() => error);
  }

}
