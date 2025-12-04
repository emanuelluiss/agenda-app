import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgendaListComponent } from './agenda-list.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { AgendaStateService } from '../services/agenda-state.service';
import { Commitment  } from '../../../domain/commitment.model';
import { MessageService } from 'primeng/api';
import { LogService } from '../../../core/services/log.service';
import { CommitmentService } from '../services/compromisso.service';

describe('AgendaListComponent (Métodos de Ação)', () => {
  let component: AgendaListComponent;
  let fixture: ComponentFixture<AgendaListComponent>;
  let commitmentServiceSpy: jasmine.SpyObj<CommitmentService>;
  let agendaStateSpy: jasmine.SpyObj<AgendaStateService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let logServiceSpy: jasmine.SpyObj<LogService>;

  const mockCommitment: Commitment  = {
    id: '123',
    title: 'Teste',
    type: 'Reunião',
    startDate: new Date(),
    endDate: new Date(),
    participants: [],
    location: 'Sala'
  };

  beforeEach(async () => {
    commitmentServiceSpy = jasmine.createSpyObj('CompromissoService', ['list', 'create', 'update', 'delete']);

    agendaStateSpy = jasmine.createSpyObj('AgendaStateService', [
      'setCommitments',
      'add',
      'update',
      'remove',
      'commitments',
      'filters',
      'totalPending',
      'updateFilterText',
      'updateFilterType'
    ]);

    messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    logServiceSpy = jasmine.createSpyObj('LogService', ['info', 'error', 'warn']);
    commitmentServiceSpy.list.and.returnValue(of([]));

    agendaStateSpy.commitments.and.returnValue([]);
    agendaStateSpy.filters.and.returnValue({ text: '', type: null });
    agendaStateSpy.totalPending.and.returnValue(0);

    await TestBed.configureTestingModule({
      imports: [AgendaListComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CommitmentService, useValue: commitmentServiceSpy },
        { provide: AgendaStateService, useValue: agendaStateSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: LogService, useValue: logServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgendaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve preparar modal para criação ao selecionar uma data no calendário', () => {
    const mockInfo = {
      start: new Date('2025-11-28T09:00:00'),
      view: { calendar: { unselect: jasmine.createSpy('unselect') } }
    };

    component.handleDateSelect(mockInfo);

    expect(mockInfo.view.calendar.unselect).toHaveBeenCalled();
    expect(component.selectedCommitment).toBeUndefined();
    expect(component.selectedDate).toEqual(mockInfo.start);
    expect(component.isDialogVisible).toBeTrue();
  });

  it('deve preparar modal para edição ao clicar em um evento existente', () => {
    const mockClickInfo = {
      event: { extendedProps: { originalData: mockCommitment } }
    };

    component.handleEventClick(mockClickInfo as any);

    expect(component.selectedCommitment).toEqual(mockCommitment);
    expect(component.selectedDate).toBeUndefined();
    expect(component.isDialogVisible).toBeTrue();
  });

  it('deve chamar criar() no serviço se o compromisso não tiver ID', () => {
    const newCommitment = { ...mockCommitment, id: '' };

    commitmentServiceSpy.create.and.returnValue(of({ ...newCommitment, id: '999' }));

    component.onSaveCommitment(newCommitment);

    expect(commitmentServiceSpy.create).toHaveBeenCalledWith(newCommitment);
    expect(agendaStateSpy.add).toHaveBeenCalled();
    expect(logServiceSpy.info).toHaveBeenCalled();
    expect(component.isDialogVisible).toBeFalse();
  });

  it('deve chamar editar() no serviço se o compromisso já tiver ID', () => {
    const commitmentExisting = { ...mockCommitment, id: '123' };

    commitmentServiceSpy.update.and.returnValue(of(commitmentExisting));

    component.onSaveCommitment(commitmentExisting);

    expect(commitmentServiceSpy.update).toHaveBeenCalledWith('123', commitmentExisting);
    expect(agendaStateSpy.update).toHaveBeenCalled();
    expect(logServiceSpy.info).toHaveBeenCalled();
    expect(component.isDialogVisible).toBeFalse();
  });

  it('deve preparar a exclusão corretamente (abrir modal e setar mensagem)', () => {
    component.selectedCommitment = mockCommitment;

    component.confirmDeletion();

    expect(component.isDeleteModalVisible()).toBeTrue();
    expect(component.deleteMessage()).toContain(mockCommitment.title);
  });

  it('deve efetivar a exclusão corretamente (chamar service e fechar modais)', () => {
    component.selectedCommitment = mockCommitment;
    commitmentServiceSpy.delete.and.returnValue(of(void 0));

    component.executeDeletion();

    expect(commitmentServiceSpy.delete).toHaveBeenCalledWith(mockCommitment.id);
    expect(agendaStateSpy.remove).toHaveBeenCalledWith(mockCommitment.id);

    expect(component.isDeleteModalVisible()).toBeFalse();
    expect(component.isDialogVisible).toBeFalse();
  });

});
