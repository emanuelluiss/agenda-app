import { Injectable } from '@angular/core';

import { LogLevel } from '../enums/log-level.enum';


@Injectable({
  providedIn: 'root'
})
export class LogService {

  private readonly LOG_STYLES = {
    [LogLevel.INFO]: 'color: #2563eb',
    [LogLevel.WARN]: 'color: #d97706',
    [LogLevel.ERROR]: 'color: #dc2626'
  };

  public info(mensagem: string, detalhes?: unknown): void {
    this.printLog(LogLevel.INFO, mensagem, detalhes);
  }

  public warn(mensagem: string, detalhes?: unknown): void {
    this.printLog(LogLevel.WARN, mensagem, detalhes);
  }

  public error(mensagem: string, erro?: unknown): void {
    this.printLog(LogLevel.ERROR, mensagem, erro);
  }

  private printLog(nivel: LogLevel, msg: string, data: unknown): void {
    const timestamp = new Date().toLocaleTimeString();
    const style = this.LOG_STYLES[nivel];
    const styleBadge = this.createBadgeStyle(style);

    console.log(
      `%c${timestamp} %c[${nivel}]%c ${msg}`,
      'color: #6b7280',
      styleBadge,
      'color: inherit',
      data ?? ''
    );
  }

  private createBadgeStyle(color: string): string {
    return `
      color: ${color};
      font-weight: bold;
      background-color: #f3f4f6;
      padding: 2px 5px;
      border-radius: 4px;
    `;
  }

}
