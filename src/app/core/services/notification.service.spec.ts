import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { MessageService } from 'primeng/api';

describe('NotificationService', () => {
  let service: NotificationService;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('MessageService', ['add']);

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: MessageService, useValue: spy }
      ]
    });

    service = TestBed.inject(NotificationService);
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve chamar o MessageService com severidade "success" ao chamar sucesso()', () => {
    const titulo = 'Bom trabalho';
    const mensagem = 'Operação realizada';

    service.sucesso(titulo, mensagem);

    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: titulo,
      detail: mensagem,
      life: 3000
    });
  });

  it('deve chamar o MessageService com severidade "error" e sticky=true ao chamar erro()', () => {
    const titulo = 'Falha';
    const mensagem = 'Algo deu errado';

    service.erro(titulo, mensagem);

    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: titulo,
      detail: mensagem,
      sticky: true
    });
  });

  it('deve chamar o MessageService com severidade "info" ao chamar info()', () => {
    const titulo = 'Dica';
    const mensagem = 'Informação útil';

    service.info(titulo, mensagem);

    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: titulo,
      detail: mensagem,
      life: 3000
    });
  });
});
