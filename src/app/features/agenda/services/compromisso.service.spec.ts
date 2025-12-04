import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LogService } from '../../../core/services/log.service';
import { Commitment  } from '../../../domain/commitment.model';
import { CommitmentService } from './compromisso.service';

describe('CompromissoService', () => {
  let service: CommitmentService;
  let httpMock: HttpTestingController;
  let logServiceSpy: jasmine.SpyObj<LogService>;

  const API_URL = 'api.mock/compromissos';

  const mockCommitment: Commitment  = {
    id: '1',
    title: 'Reunião Teste',
    type: 'Reunião',
    startDate: new Date(),
    endDate: new Date(),
    participants: ['dev@teste.com'],
    location: 'Sala 1'
  };

  beforeEach(() => {
    logServiceSpy = jasmine.createSpyObj('LogService', ['info', 'error']);

    TestBed.configureTestingModule({
      providers: [
        CommitmentService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LogService, useValue: logServiceSpy }
      ]
    });

    service = TestBed.inject(CommitmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('listar() deve retornar array de compromissos e logar sucesso', () => {
    const mockList = [mockCommitment, { ...mockCommitment, id: '2' }];

    service.list().subscribe(list => {
      expect(list.length).toBe(2);
      expect(list).toEqual(mockList);
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('GET');

    req.flush(mockList);

    expect(logServiceSpy.info).toHaveBeenCalled();
  });

  it('criar() deve enviar POST e retornar o objeto criado', () => {
    service.create(mockCommitment).subscribe(newCommitment => {
      expect(newCommitment).toEqual(mockCommitment);
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCommitment);

    req.flush(mockCommitment);
    expect(logServiceSpy.info).toHaveBeenCalled();
  });

  it('deve tratar erros de API e chamar log.error', () => {
    const msgErro = 'Erro Interno do Servidor';

    service.list().subscribe({
      next: () => fail('Deveria ter caído no erro'),
      error: (erro) => {
        expect(erro.status).toBe(500);
      }
    });

    const req = httpMock.expectOne(API_URL);

    req.flush(msgErro, { status: 500, statusText: 'Server Error' });

    expect(logServiceSpy.error).toHaveBeenCalled();
  });
});
