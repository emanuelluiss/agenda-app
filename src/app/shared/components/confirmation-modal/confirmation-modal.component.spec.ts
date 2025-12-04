import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationModalComponent } from './confirmation-modal.component';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

describe('ConfirmationModalComponent', () => {
  let component: ConfirmationModalComponent;
  let fixture: ComponentFixture<ConfirmationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationModalComponent],
      providers: [
        provideNoopAnimations(),
        providePrimeNG({ theme: { preset: Aura } })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationModalComponent);
    component = fixture.componentInstance;
    component.visible.set(true);
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir o título e mensagem passados via Input', () => {
    fixture.componentRef.setInput('title', 'Título de Teste');
    fixture.componentRef.setInput('message', 'Mensagem de perigo!');
    fixture.detectChanges();

    const titleTest = fixture.debugElement.query(By.css('.p-dialog-title')).nativeElement;
    const msgTest = fixture.debugElement.query(By.css('.text-xl')).nativeElement;

    expect(titleTest.textContent).toContain('Título de Teste');
    expect(msgTest.textContent).toContain('Mensagem de perigo!');
  });

  it('deve emitir evento "confirmar" ao clicar no botão de confirmação', () => {
    spyOn(component.confirmModal, 'emit');

    const btnConfirmar = fixture.debugElement.query(By.css('p-button[icon="pi pi-check"]'));

    if (!btnConfirmar) {
      console.log('HTML Renderizado:', fixture.debugElement.nativeElement.innerHTML);
    }

    expect(btnConfirmar).withContext('Botão Confirmar não foi encontrado!').toBeTruthy();
    btnConfirmar.triggerEventHandler('onClick', null);

    expect(component.confirmModal.emit).toHaveBeenCalled();
    expect(component.visible()).toBeFalse();
  });

  it('deve emitir evento "cancelar" ao clicar no botão de cancelar', () => {
    spyOn(component.cancelModal, 'emit');

    const btnCancelar = fixture.debugElement.query(By.css('p-button[icon="pi pi-times"]'));

    expect(btnCancelar).withContext('Botão Confirmar não foi encontrado!').toBeTruthy();
    btnCancelar.triggerEventHandler('onClick', null);

    expect(component.cancelModal.emit).toHaveBeenCalled();
    expect(component.visible()).toBeFalse();
  });
});
