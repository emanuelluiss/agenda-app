import { TestBed } from '@angular/core/testing';
import { AgendaStateService } from './agenda-state.service';
import { Commitment } from '../../../domain/commitment.model';
import { LogService } from '../../../core/services/log.service'; // Importação necessária

describe('AgendaStateService', () => {
  let service: AgendaStateService;
  let logServiceSpy: jasmine.SpyObj<LogService>;

  const mockFutureCommitments: Commitment = {
    id: '1', title: 'Reunião', type: 'Reunião',
    startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    participants: [], location: 'Sala 1'
  };

  beforeEach(() => {
    logServiceSpy = jasmine.createSpyObj('LogService', ['info', 'warn']);
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AgendaStateService,
        { provide: LogService, useValue: logServiceSpy }
      ]
    });
  });

  const setupService = () => {
    service = TestBed.inject(AgendaStateService);
  };

  it('deve carregar filtros do localStorage ao iniciar', () => {
    const savedData = JSON.stringify({ text: 'Teste Inicial', type: 'Reunião' });

    spyOn(localStorage, 'getItem').and.returnValue(savedData);

    service = TestBed.inject(AgendaStateService);

    const testFilters = service.filters();

    expect(localStorage.getItem).toHaveBeenCalledWith('agenda-filters');
    expect(testFilters.text).toBe('Teste Inicial');
  });

  it('deve iniciar com filtros padrão se localStorage vazio', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);

    service = TestBed.inject(AgendaStateService);

    expect(service.filters().text).toBe('');
    expect(service.filters().type).toBeNull();
  });

  it('deve ser criado', () => {
    setupService();
    expect(service).toBeTruthy();
  });

  it('deve adicionar um compromisso na lista', () => {
    setupService();
    service.add(mockFutureCommitments);
    expect(service.commitments().length).toBe(1);
    expect(logServiceSpy.info).toHaveBeenCalled();
  });

  it('deve calcular corretamente o total de pendentes', () => {
    setupService();
    service.setCommitments([mockFutureCommitments]);
    expect(service.totalPending()).toBe(1);
  });

  it('deve atualizar o filtro de texto', () => {
    setupService();
    service.updateFilterText('Scrum');
    expect(service.filters().text).toBe('Scrum');
  });

  it('deve salvar no LocalStorage quando o filtro mudar (Effect)', () => {
    setupService();
    const setItemSpy = spyOn(localStorage, 'setItem');

    service.updateFilterText('Novo Valor');

    TestBed.flushEffects();

    expect(setItemSpy).toHaveBeenCalledWith(
      'agenda-filters',
      jasmine.stringMatching('"text":"Novo Valor"')
    );
  });
});
