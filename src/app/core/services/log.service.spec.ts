import { TestBed } from '@angular/core/testing';
import { LogService } from './log.service';

describe('LogService', () => {
  let service: LogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LogService]
    });
    service = TestBed.inject(LogService);

    spyOn(console, 'log');
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve mostrar mensagem de INFO com a cor azul', () => {
    const mensagem = 'Teste de Informação';
    service.info(mensagem);

    expect(console.log).toHaveBeenCalledWith(
      jasmine.stringMatching(/%c.*%c\[INFO\]%c.*Teste de Informação/),
      jasmine.any(String),
      jasmine.stringMatching(/color: #2563eb/),
      jasmine.any(String),
      ''
    );
  });

  it('deve mostrar mensagem de WARN com a cor laranja', () => {
    const mensagem = 'Aviso Importante';
    const detalhes = { id: 123 };

    service.warn(mensagem, detalhes);

    expect(console.log).toHaveBeenCalledWith(
      jasmine.stringMatching(/%c.*%c\[WARN\]%c.*Aviso Importante/),
      jasmine.any(String),
      jasmine.stringMatching(/color: #d97706/),
      jasmine.any(String),
      detalhes
    );
  });

  it('deve mostrar mensagem de ERROR com a cor vermelha', () => {
    const mensagem = 'Erro Crítico';
    const erroObj = new Error('Falha na API');

    service.error(mensagem, erroObj);

    expect(console.log).toHaveBeenCalledWith(
      jasmine.stringMatching(/%c.*%c\[ERROR\]%c.*Erro Crítico/),
      jasmine.any(String),
      jasmine.stringMatching(/color: #dc2626/),
      jasmine.any(String),
      erroObj
    );
  });
});
