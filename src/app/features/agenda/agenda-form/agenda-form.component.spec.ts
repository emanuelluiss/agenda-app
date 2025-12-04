import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgendaFormComponent } from './agenda-form.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { Commitment  } from '../../../domain/commitment.model';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';

describe('AgendaFormComponent', () => {
  let component: AgendaFormComponent;
  let fixture: ComponentFixture<AgendaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaFormComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        providePrimeNG({ theme: { preset: Aura } })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgendaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar o formulário como inválido', () => {
    expect(component.form.valid).toBeFalse();
  });

  it('deve validar obrigatoriedade do Título', () => {
    const title = component.form.get('title');
    title?.setValue('');
    expect(title?.hasError('required')).toBeTrue();
    title?.setValue('Reunião');
    expect(title?.hasError('required')).toBeFalse();
  });

  it('deve validar regra de datas (Fim > Início)', () => {
    const start = new Date();
    const endPast = new Date(start.getTime() - 100000);
    component.form.patchValue({ startDate: start, endDate: endPast });
    expect(component.form.hasError('invalidRange')).toBeTrue();
  });

  it('deve validar condicional (Tipo Reunião -> Local Obrigatório)', () => {
    const controlType = component.form.get('type');
    const controlLocation = component.form.get('location');

    controlType?.setValue('Lembrete');
    controlLocation?.setValue('');
    expect(controlLocation?.valid).toBeTrue();

    controlType?.setValue('Reunião');
    controlLocation?.setValue('');
    expect(controlLocation?.hasError('required')).toBeTrue();
  });

  describe('Inicialização (Edição)', () => {
    it('deve preencher o formulário se receber "compromissoParaEditar"', () => {
      const mockData: Commitment  = {
        id: '123',
        title: 'Daily Scrum',
        type: 'Reunião',
        startDate: new Date(),
        endDate: new Date(),
        participants: ['dev@teste.com'],
        location: 'Sala 1'
      };

      component.commitmentForEdit = mockData;
      component.ngOnInit();

      expect(component.form.get('title')?.value).toBe('Daily Scrum');
      expect(component.form.get('type')?.value).toBe('Reunião');
      expect(component.colorSelected()).toBe('#3b82f6');
    });
  });

  describe('Adição Manual de E-mails (handleKey/handleBlur)', () => {

    it('deve adicionar email válido ao pressionar ENTER', () => {
      const mockInput = document.createElement('input');
      mockInput.value = 'novo@teste.com';

      const mockEvent = {
        key: 'Enter',
        target: mockInput,
        preventDefault: jasmine.createSpy('preventDefault')
      } as unknown as KeyboardEvent;

      component.handleKey(mockEvent);

      const participants = component.form.get('participants')?.value;
      expect(participants).toContain('novo@teste.com');
      expect(mockInput.value).toBe('');
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('NÃO deve adicionar email inválido e deve setar erro', () => {
      const mockInput = document.createElement('input');
      mockInput.value = 'email-invalido';

      const mockEvent = {
        key: 'Enter',
        target: mockInput,
        preventDefault: jasmine.createSpy('preventDefault')
      } as unknown as KeyboardEvent;

      component.handleKey(mockEvent);

      const participants = component.form.get('participants')?.value;
      expect(participants.length).toBe(0);
      expect(component.form.get('participants')?.hasError('invalidEmail')).toBeTrue();
    });

    it('NÃO deve adicionar duplicados', () => {
      component.form.get('participants')?.setValue(['user@teste.com']);

      const mockInput = document.createElement('input');
      mockInput.value = 'user@teste.com';

      const mockEvent = {
        key: 'Enter',
        target: mockInput,
        preventDefault: jasmine.createSpy('preventDefault')
      } as unknown as KeyboardEvent;

      component.handleKey(mockEvent);

      const participants = component.form.get('participants')?.value;
      expect(participants.length).toBe(1);
    });
  });

  describe('Busca de Local (Autocomplete)', () => {
    it('deve filtrar sugestões baseado no texto digitado', () => {
      const event: AutoCompleteCompleteEvent = {
        originalEvent: new Event('input'),
        query: 'Sala'
      };

      component.searchLocation(event);

      const suggestions = component.suggestionsLocals();
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContain('Sala de Reunião 1 (Térreo)');
      expect(suggestions).not.toContain('Zoom');
    });
  });

  describe('Envio do Formulário (Submit)', () => {
    it('deve emitir o evento "salvar" se o formulário for válido', () => {
    spyOn(component.saveRequest, 'emit');

    const startTomorrow = new Date();
    startTomorrow.setDate(startTomorrow.getDate() + 1);
    startTomorrow.setHours(10, 0, 0, 0);

    const endTomorrow = new Date(startTomorrow);
    endTomorrow.setHours(11, 0, 0, 0);

    component.form.setValue({
      title: 'Reunião Válida para Teste',
      type: 'Outro',
      startDate: startTomorrow,
      endDate: endTomorrow,
      location: '',
      participants: ['email@teste.com'],
      description: 'Teste de submit',
      color: '#3B82F6'
    });

    component.onSubmit();

    expect(component.saveRequest.emit).toHaveBeenCalled();

    expect(component.saveRequest.emit).toHaveBeenCalledWith(jasmine.objectContaining({
        title: 'Reunião Válida para Teste'
    }));
  });

    it('NÃO deve emitir "salvar" se formulário inválido e deve marcar como touched', () => {
      spyOn(component.saveRequest, 'emit');

      component.form.get('title')?.setValue('');

      component.onSubmit();

      expect(component.saveRequest.emit).not.toHaveBeenCalled();
      expect(component.form.touched).toBeTrue();
    });
  });

  it('LÓGICA DE ERRO VISUAL: Deve marcar campo como TOUCHED se iniciar com data inválida (Passado)', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      component.startDateVar = pastDate;
      component.commitmentForEdit = undefined;

      component.ngOnInit();

      const control = component.form.get('startDate');

      expect(control?.value).toEqual(pastDate);
      expect(control?.hasError('pastDate')).toBeTrue();
      expect(control?.touched).toBeTrue();
      expect(control?.dirty).toBeTrue();
    });

    it('LÓGICA DE ERRO VISUAL: Deve marcar campo como TOUCHED se iniciar com Horário Comercial inválido', () => {
      const nightDate = new Date();
      nightDate.setDate(nightDate.getDate() + 1);
      nightDate.setHours(20, 0, 0, 0);

      component.startDateVar = nightDate;
      component.ngOnInit();

      const control = component.form.get('startDate');

      expect(control?.hasError('businessHours')).toBeTrue();
      expect(control?.touched).toBeTrue();
    });
});
