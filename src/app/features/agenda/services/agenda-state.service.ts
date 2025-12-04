import { Injectable, computed, effect, signal, inject } from '@angular/core';
import { Commitment } from '../../../domain/commitment.model';
import { CalendarFilters } from '../../../domain/dtos/calendar-filters.dto';
import { LogService } from '../../../core/services/log.service';

@Injectable({
  providedIn: 'root'
})
export class AgendaStateService {

  private readonly logger = inject(LogService);
  private readonly STORAGE_KEY = 'agenda-filters';

  private readonly commitmentsSignal = signal<Commitment[]>([]);
  private readonly filtersSignal = signal<CalendarFilters>(this.loadFiltersFromStorage());
  public readonly commitments = this.commitmentsSignal.asReadonly();
  public readonly filters = this.filtersSignal.asReadonly();

  public readonly totalPending = computed(() => {
    const now = new Date();
    return this.commitmentsSignal()
      .filter(c => c.startDate > now).length;
  });

  constructor() {
    effect(() => {
      const currentState = this.filtersSignal();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentState));
    });
  }

  public setCommitments(list: Commitment[]) {
    this.commitmentsSignal.set(list);
  }

  public add(item: Commitment) {
    this.commitmentsSignal.update(list => {
      const exists = list.some(existing => existing.id === item.id);

      if (exists) {
        this.logger.warn('[STATE] Tentativa de duplicação barrada:', item);
        return list;
      }

      this.logger.info('[STATE] Adicionando item ao cache local:', { id: item.id });
      return [...list, item];
    });
  }

  public update(item: Commitment) {
    this.commitmentsSignal.update(list =>
      list.map(c => c.id === item.id ? item : c)
    );
  }

  public remove(id: string) {
    this.commitmentsSignal.update(list => list.filter(c => c.id !== id));
  }

  public updateFilterText(text: string) {
    this.filtersSignal.update(f => ({ ...f, text }));
  }

  public updateFilterType(type: string | null) {
    this.filtersSignal.update(f => ({ ...f, type: type as any }));
  }

  public clearFilters() {
    this.filtersSignal.set({ text: '', type: null });
  }

  private loadFiltersFromStorage(): CalendarFilters {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : { text: '', type: null };
  }

}
