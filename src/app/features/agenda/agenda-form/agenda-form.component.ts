import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';

import { Commitment, CommitmentType } from '../../../domain/commitment.model';
import { COLORS_BY_TYPE } from '../../../shared/constants/agenda.ui.constants';
import { OnlyDateCharsDirective } from '../../../shared/directives/only-date-chars.directive';
import { businessHoursValidator } from '../../../shared/validators/business-hours.validator';

@Component({
  selector: 'app-agenda-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    AutoCompleteModule,
    MessageModule,
    OnlyDateCharsDirective,
  ],
  templateUrl: './agenda-form.component.html',
  styleUrls: ['./agenda-form.component.scss']
})
export class AgendaFormComponent implements OnInit {

  @Input() startDateVar?: Date;
  @Input() commitmentForEdit?: Commitment;

  @Output() saveRequest = new EventEmitter<Commitment>();
  @Output() cancelRequest = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  public form!: FormGroup;

  public colorSelected = signal<string>('#3b82f6');
  public suggestionsLocals = signal<string[]>([]);

  protected readonly COLORS = COLORS_BY_TYPE;
  public readonly optionsTypes = [
    { label: 'Reunião', value: 'Reunião' },
    { label: 'Consulta', value: 'Consulta' },
    { label: 'Lembrete', value: 'Lembrete' },
    { label: 'Outro', value: 'Outro' }
  ];

  private readonly possibleLocations = [
    'Sala de Reunião 1 (Térreo)', 'Sala de Reunião 2 (1º Andar)', 'Auditório Principal',
    'Google Meet (Online)', 'Microsoft Teams', 'Zoom', 'Consultório', 'Casa', 'Academia'
  ];

  ngOnInit() {
    this.initForm();
    this.setupValidations();
    this.populateFormValues();
  }

  public onSubmit() {
    if (this.form.valid) {
      const payload: Commitment = {
        id: this.commitmentForEdit?.id || '',
        ...this.form.value,
        color: this.colorSelected()
      };
      this.saveRequest.emit(payload);
    } else {
      this.form.markAllAsTouched();
    }
  }

  public searchLocation(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();
    const result = this.possibleLocations.filter(location =>
      location.toLowerCase().includes(query)
    );
    this.suggestionsLocals.set(result);
  }

  public handleKey(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      this.addParticipant(event.target as HTMLInputElement);
    }
  }

  public handleBlur(event: Event) {
    this.addParticipant(event.target as HTMLInputElement);
  }

  public getColorByType(type: CommitmentType): string {
    return COLORS_BY_TYPE[type] || '#3b82f6';
  }

  public futureDateValidator(control: AbstractControl): ValidationErrors | null {
    const date = new Date(control.value);
    const now = new Date();
    if (control.value && date < new Date(now.getTime() - 60000)) {
      return { pastDate: true };
    }
    return null;
  }

  public dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;

    if (start && end && new Date(end) <= new Date(start)) {
      return { invalidRange: true };
    }
    return null;
  }

  public emailArrayValidator(control: AbstractControl): ValidationErrors | null {
    const emails: string[] = control.value || [];
    if (emails.length === 0) return { required: true };
    return null;
  }

  private initForm() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      type: [null, Validators.required],
      startDate: [null, [Validators.required, this.futureDateValidator, businessHoursValidator(8, 18)]],
      endDate: [null, Validators.required],
      location: [''],
      participants: [[], [Validators.required, this.emailArrayValidator]],
      description: [''],
      color: ['#3B82F6']
    }, { validators: this.dateRangeValidator });
  }

  private setupValidations() {
    this.form.get('type')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((type: CommitmentType) => {
        const localControl = this.form.get('location');

        if (type === 'Reunião') {
          localControl?.setValidators([Validators.required]);
        } else {
          localControl?.clearValidators();
        }
        localControl?.updateValueAndValidity();

        const newColor = COLORS_BY_TYPE[type] || '#3b82f6';
        this.colorSelected.set(newColor);
      });
  }

  private populateFormValues() {
    if (this.commitmentForEdit) {
      this.form.patchValue({
        ...this.commitmentForEdit,
        startDate: new Date(this.commitmentForEdit.startDate),
        endDate: new Date(this.commitmentForEdit.endDate)
      });

      const type = this.commitmentForEdit.type;
      this.colorSelected.set(this.commitmentForEdit.color || COLORS_BY_TYPE[type]);

    } else if (this.startDateVar) {
      const start = new Date(this.startDateVar);
      const end = new Date(this.startDateVar);
      end.setHours(end.getHours() + 1);

      this.form.patchValue({ startDate: start, endDate: end });
    }

    this.validateFieldAtInitialization('startDate');
    this.validateFieldAtInitialization('endDate');
  }

  private validateFieldAtInitialization(field: string) {
    const control = this.form.get(field);
    if (control) {
      control.updateValueAndValidity();
      if (control.invalid) {
        control.markAsTouched();
        control.markAsDirty();
      }
    }
  }

  private addParticipant(input: HTMLInputElement) {
    const value = input.value.trim();
    if (!value) return;

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const controlParticipants = this.form.get('participants');

    if (!isEmailValid) {
      controlParticipants?.setErrors({ invalidEmail: true });
      controlParticipants?.markAsTouched();
      return;
    }

    const currentList = controlParticipants?.value || [];

    if (currentList.includes(value)) {
      input.value = '';
      return;
    }

    const newList = [...currentList, value];
    controlParticipants?.setValue(newList);
    controlParticipants?.updateValueAndValidity();
    controlParticipants?.setErrors(null);
    input.value = '';
  }

}
