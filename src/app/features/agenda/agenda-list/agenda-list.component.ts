import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventContentArg } from '@fullcalendar/core/index.js';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { SelectModule } from 'primeng/select';

import { Commitment } from '../../../domain/commitment.model';
import { AgendaFormComponent } from '../agenda-form/agenda-form.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';

import { AgendaStateService } from '../services/agenda-state.service';
import { LogService } from '../../../core/services/log.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CommitmentService } from '../services/compromisso.service';

@Component({
  selector: 'app-agenda-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FullCalendarModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TooltipModule,
    BadgeModule,
    AgendaFormComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './agenda-list.component.html',
  styleUrl: './agenda-list.component.scss',
})
export class AgendaListComponent implements OnInit {

  @ViewChild('calendar')
  public calendarComponent!: FullCalendarComponent;

  public isDialogVisible = false;
  public isDeleteModalVisible = signal(false);

  public selectedDate?: Date;
  public selectedCommitment?: Commitment;

  public filterText = signal('');
  public filterType = signal<string | null>(null);

  public deleteMessage = signal('');

  public readonly filterOptions = [
    { label: 'Todos', value: null },
    { label: 'Reunião', value: 'Reunião' },
    { label: 'Consulta', value: 'Consulta' },
    { label: 'Lembrete', value: 'Lembrete' },
    { label: 'Outro', value: 'Outro' }
  ];

  protected readonly agendaState = inject(AgendaStateService);
  private readonly commitmentService = inject(CommitmentService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LogService);

  public calendarOptions: CalendarOptions = this.initCalendarOptions();

  constructor() {
    this.setupReactivity();
  }

  ngOnInit() {
    this.loadInitialData();
  }

  private setupReactivity() {
    effect(() => {
      const allCommitments = this.agendaState.commitments();
      const currentFilters = this.agendaState.filters();
      const searchText = currentFilters.text.toLowerCase();
      const searchType = currentFilters.type;
      const filtered = allCommitments.filter(c => {
        const matchText =
          c.title.toLowerCase().includes(searchText) ||
          (c.description?.toLowerCase().includes(searchText) ?? false) ||
          c.participants.some(p => p.toLowerCase().includes(searchText));

        const matchType = searchType ? c.type === searchType : true;

        return matchText && matchType;
      });

      const calendarEvents = filtered.map(c => ({
        id: c.id,
        title: `[${c.type}] ${c.title}`,
        start: c.startDate,
        end: c.endDate,
        backgroundColor: c.color || '#3B82F6',
        borderColor: c.color || '#3B82F6',
        textColor: '#ffffff',
        extendedProps: { originalData: c }
      }));

      this.calendarOptions = { ...this.calendarOptions, events: calendarEvents };
    });
  }

  private loadInitialData() {
    this.commitmentService.list().subscribe({
      next: (data) => {
        this.agendaState.setCommitments(data);
      },
      error: (err) => {
        this.logger.error('Failed to load initial data', err);
        this.notificationService.erro('Erro', 'Falha ao carregar agenda.');
      }
    });
  }

  public handleDateSelect(info: any) {
    info.view.calendar.unselect();
    this.selectedCommitment = undefined;
    this.selectedDate = info.start;
    this.isDialogVisible = true;
  }

  public handleEventClick(info: EventClickArg) {
    this.selectedCommitment = info.event.extendedProps['originalData'];
    this.selectedDate = undefined;
    this.isDialogVisible = true;
  }

  public onFilterTextChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.agendaState.updateFilterText(value);
  }

  public onFilterTypeChange(value: string) {
    this.agendaState.updateFilterType(value);
  }

  public onSaveCommitment(commitment: Commitment) {
    const isEdit = !!commitment.id;
    const logAction = isEdit ? 'EDIT_COMMITMENT' : 'CREATE_COMMITMENT';

    const request$ = isEdit
      ? this.commitmentService.update(commitment.id, commitment)
      : this.commitmentService.create(commitment);

    request$.subscribe({
      next: (result) => {
        if (isEdit) {
          this.agendaState.update(result);
        } else {
          this.agendaState.add(result);
        }

        this.notificationService.sucesso('Sucesso', `Compromisso ${isEdit ? 'atualizado' : 'agendado'}!`);
        this.logger.info(logAction, { id: result.id, title: result.title });

        this.isDialogVisible = false;
      },
      error: (err) => {
        this.notificationService.erro('Erro', 'Não foi possível salvar o compromisso.');
        this.logger.error(`AgendaList.${logAction}`, err);
      }
    });
  }

  public confirmDeletion() {
    if (!this.selectedCommitment) return;

    this.deleteMessage.set(`Tem certeza que deseja remover "${this.selectedCommitment.title}"?`);
    this.isDeleteModalVisible.set(true);
  }

  public executeDeletion() {
    if (!this.selectedCommitment) return;
    const id = this.selectedCommitment.id;

    this.commitmentService.delete(id).subscribe({
      next: () => {
        this.agendaState.remove(id);
        this.notificationService.info('Removido', 'Compromisso excluído.');
        this.logger.info('DELETE_COMMITMENT', { removed_id: id });

        this.isDeleteModalVisible.set(false);
        this.isDialogVisible = false;
      },
      error: (err) => {
        this.notificationService.erro('Erro', 'Falha ao excluir o compromisso.');
        this.logger.error('AgendaList.executeDeletion', err);
      }
    });
  }

  private initCalendarOptions(): CalendarOptions {
    return {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
      locale: ptBrLocale,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      slotMinTime: '06:00:00',
      slotMaxTime: '22:00:00',
      allDaySlot: false,
      nowIndicator: true,
      height: 'auto',
      slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit',
        omitZeroMinute: false,
        meridiem: false,
        hour12: false
      },
      slotDuration: '00:30:00',
      editable: true,
      selectable: true,
      events: [],
      select: (info) => this.handleDateSelect(info),
      eventClick: (info) => this.handleEventClick(info),
      eventDisplay: 'block',
      dayMaxEvents: 3,
      moreLinkClick: 'timeGridDay',
      eventContent: (arg) => this.renderEventContent(arg)
    };
  }

  private renderEventContent(arg: EventContentArg) {
    if (arg.view.type === 'dayGridMonth') {
      return { html: `<div class="fc-month-event-content text-sm overflow-hidden">${arg.event.title}</div>` };
    }

    const event = arg.event;
    const data = event.extendedProps['originalData'] as Commitment;
    const timeHtml = arg.timeText ? `<div class="fc-event-time font-bold">${arg.timeText}</div>` : '';
    const descHtml = data?.description ? `<div class="fc-event-desc text-xs opacity-90">${data.description}</div>` : '';

    return {
      html: `
        <div class="fc-event-wrapper p-1">
          ${timeHtml}
          <div class="fc-event-title font-semibold">${event.title}</div>
          ${descHtml}
        </div>
      `
    };
  }
}
