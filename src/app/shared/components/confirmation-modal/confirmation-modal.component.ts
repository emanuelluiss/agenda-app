import { Component, EventEmitter, input, Input, model, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule
  ],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalComponent {

  @Output() confirmModal = new EventEmitter<void>();
  @Output() cancelModal = new EventEmitter<void>();

  public visible = model<boolean>(false);
  public title = input<string>('Confirmação');
  public message = input<string>('Tem certeza que deseja prosseguir?');
  public confirmButtonText = input<string>('Sim');
  public cancelButtonText = input<string>('Cancelar');
  public typeConfirmButton = input<'danger' | 'primary' | 'success'>('primary');

  onConfirm() {
    this.confirmModal.emit();
    this.closeModal();
  }

  onCancel() {
    this.cancelModal.emit();
    this.closeModal();
  }

  public closeModal() {
    this.visible.set(false);
  }

}
