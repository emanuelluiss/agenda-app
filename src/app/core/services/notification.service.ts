import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly messageService = inject(MessageService);
  private readonly DEFAULT_DURATION = 3000;

  sucesso(title: string, message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: title,
      detail: message,
      life: this.DEFAULT_DURATION
    });
  }

  erro(titulo: string, mensagem: string): void {
    this.messageService.add({
      severity: 'error',
      summary: titulo,
      detail: mensagem,
      sticky: true
    });
  }

  info(titulo: string, mensagem: string): void {
    this.messageService.add({
      severity: 'info',
      summary: titulo,
      detail: mensagem,
      life: this.DEFAULT_DURATION
    });
  }

  warn(titulo: string, mensagem: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: titulo,
      detail: mensagem,
      life: this.DEFAULT_DURATION + 2000
    });
  }

}
