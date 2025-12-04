import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appOnlyDateChars]',
  standalone: true
})
export class OnlyDateCharsDirective {

  private readonly NAVIGATION_KEYS = [
    'Backspace', 'Tab', 'End', 'Home',
    'ArrowLeft', 'ArrowRight', 'Delete', 'Enter', 'Escape'
  ];
  private readonly SEPARATOR_CHARS = ['/', ':', ' '];
  private readonly VALID_REGEX = /^[0-9/: ]*$/;
  private readonly MAX_LENGTH = 16;

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;

    if (
      input.value.length >= this.MAX_LENGTH &&
      !this.isNavigationKey(event.key) &&
      !this.isKeyboardShortcut(event)
    ) {
      event.preventDefault();
      return;
    }

    if (this.isNavigationKey(event.key)) {
      return;
    }

    if (this.isKeyboardShortcut(event)) {
      return;
    }

    if (!this.isValidChar(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const data = event.clipboardData?.getData('text/plain');

    if (!data) return;

    if (data.length > this.MAX_LENGTH) {
      event.preventDefault();
      return;
    }

    if (!this.VALID_REGEX.test(data)) {
      event.preventDefault();
    }
  }

  private isNavigationKey(key: string): boolean {
    return this.NAVIGATION_KEYS.includes(key);
  }

  private isKeyboardShortcut(event: KeyboardEvent): boolean {
    return (event.ctrlKey || event.metaKey) &&
      ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase());
  }

  private isValidChar(key: string): boolean {
    const isNumber = /^\d$/.test(key);
    const isSeparator = this.SEPARATOR_CHARS.includes(key);
    return isNumber || isSeparator;
  }

}
