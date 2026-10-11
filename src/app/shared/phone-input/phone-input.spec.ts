import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, form } from '@angular/forms/signals';
import { PhoneInput, formatPhone, parsePhone } from './phone-input';

describe('Step 4: PhoneInput', () => {
  describe('parsePhone()', () => {
    it.each([
      ['', null],
      ['600700800', '+48600700800'],
      ['600 700 800', '+48600700800'],
      ['600-700-800', '+48600700800'],
      ['+44 20 7946 0958', '+442079460958'],
    ])('parses %j as %j', (raw, expected) => {
      expect(parsePhone(raw)).toEqual({ value: expected });
    });

    it.each(['abc', '12345', '+48 600'])('rejects %j with a parse error', (raw) => {
      expect(parsePhone(raw).error).toMatchObject({ kind: 'parse' });
    });
  });

  it('formats Polish numbers in groups of three', () => {
    expect(formatPhone('+48600700800')).toBe('+48 600 700 800');
    expect(formatPhone('+442079460958')).toBe('+442079460958');
    expect(formatPhone(null)).toBe('');
  });

  @Component({
    imports: [FormField, PhoneInput],
    template: `<app-phone-input [formField]="phoneForm" />`,
  })
  class Host {
    readonly phone = signal<string | null>('+48600700800');
    readonly phoneForm = form(this.phone);
  }

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
    const type = async (text: string) => {
      input.value = text;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();
    };
    return { fixture, host: fixture.componentInstance, input, type };
  }

  it('shows the model value formatted', async () => {
    const { input } = await setup();
    expect(input.value).toBe('+48 600 700 800');
  });

  it('writes the normalized value to the model', async () => {
    const { host, type } = await setup();
    await type('511 222 333');
    expect(host.phone()).toBe('+48511222333');
  });

  it('keeps the model unchanged and reports a parse error on garbage', async () => {
    const { host, type } = await setup();
    await type('call me maybe');
    expect(host.phone()).toBe('+48600700800');
    expect(host.phoneForm().getError('parse')).toBeTruthy();
  });

  it('marks the field as touched on blur through the touch output', async () => {
    const { host, input, fixture } = await setup();
    expect(host.phoneForm().touched()).toBe(false);
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.phoneForm().touched()).toBe(true);
  });

  it('can be focused with focusBoundControl()', async () => {
    const { host, input } = await setup();
    host.phoneForm().focusBoundControl();
    expect(document.activeElement).toBe(input);
  });
});
