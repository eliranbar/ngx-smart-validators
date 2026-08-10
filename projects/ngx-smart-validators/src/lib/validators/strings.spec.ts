import { FormControl } from '@angular/forms';
import { endsWith, includes, regex, startsWith, strictEmail, url } from './strings';

describe('string validators', () => {
  it('validates string placement', () => {
    expect(startsWith('pre')(new FormControl('prefix'))).toBeNull();
    expect(endsWith('.ts')(new FormControl('index.ts'))).toBeNull();
    expect(includes('smart')(new FormControl('ngx-smart-validators'))).toBeNull();
    expect(includes('missing')(new FormControl('value'))?.['includes']).toBeDefined();
  });

  it('uses a stable copy of stateful regular expressions', () => {
    const validator = regex(/foo/g);
    const control = new FormControl('foo');
    expect(validator(control)).toBeNull();
    expect(validator(control)).toBeNull();
    expect(validator(new FormControl('bar'))?.['regex']).toBeDefined();
  });

  it('accepts absolute web URLs only', () => {
    expect(url()(new FormControl('https://example.com/path'))).toBeNull();
    expect(url()(new FormControl('/relative'))?.['url']).toBeDefined();
    expect(url()(new FormControl('ftp://example.com'))?.['url']).toBeDefined();
  });

  it('applies strict email domain rules', () => {
    expect(strictEmail()(new FormControl('person@example.com'))).toBeNull();
    expect(strictEmail()(new FormControl('person@example'))?.['strictEmail']).toBeDefined();
    expect(strictEmail()(new FormControl('person..name@example.com'))?.['strictEmail']).toBeDefined();
  });
});
