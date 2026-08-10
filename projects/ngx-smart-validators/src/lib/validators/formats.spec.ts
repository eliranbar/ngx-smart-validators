import { FormControl } from '@angular/forms';
import {
  base64,
  hexColor,
  ipAddress,
  json,
  latitude,
  longitude,
  phone,
  uuid,
} from './formats';

describe('format validators', () => {
  it('validates basic country-aware phone numbers', () => {
    expect(phone('US')(new FormControl('(415) 555-2671'))).toBeNull();
    expect(phone('US')(new FormControl('123'))?.['phone']).toBeDefined();
    expect(phone()(new FormControl('+44 7911 123456'))).toBeNull();
  });

  it('validates UUID, JSON, base64, and colors', () => {
    expect(uuid()(new FormControl('550e8400-e29b-41d4-a716-446655440000'))).toBeNull();
    expect(uuid()(new FormControl('not-a-uuid'))?.['uuid']).toBeDefined();
    expect(json()(new FormControl('{"valid":true}'))).toBeNull();
    expect(json()(new FormControl('{invalid}'))?.['json']).toBeDefined();
    expect(base64()(new FormControl('SGVsbG8='))).toBeNull();
    expect(base64()(new FormControl('***='))?.['base64']).toBeDefined();
    expect(hexColor()(new FormControl('#09aF'))).toBeNull();
    expect(hexColor()(new FormControl('09af'))?.['hexColor']).toBeDefined();
  });

  it('validates IPv4 and compressed IPv6 addresses', () => {
    expect(ipAddress('v4')(new FormControl('192.168.1.1'))).toBeNull();
    expect(ipAddress('v4')(new FormControl('256.1.1.1'))?.['ipAddress']).toBeDefined();
    expect(ipAddress('v6')(new FormControl('2001:db8::1'))).toBeNull();
    expect(ipAddress('v6')(new FormControl('2001:::1'))?.['ipAddress']).toBeDefined();
  });

  it('validates coordinate limits', () => {
    expect(latitude()(new FormControl('-90'))).toBeNull();
    expect(latitude()(new FormControl(90.1))?.['latitude']).toBeDefined();
    expect(longitude()(new FormControl(180))).toBeNull();
    expect(longitude()(new FormControl(-181))?.['longitude']).toBeDefined();
  });
});
