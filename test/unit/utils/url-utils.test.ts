import { Request } from 'express';
import { getIdamLoginUrl, getIdamRedirectUrl } from '../../../app/utils/url-utils';
import { expect } from '../../utils/testUtils';

describe('creates url', () => {
  it('not for localhost', () => {
    const req = {
      hostname: 'example.com'
    } as Partial<Request>;

    const redirectUrl = getIdamRedirectUrl(req as Request);

    expect(redirectUrl).eq('https://example.com/redirectUrl');
  });

  it('for localhost', () => {
    const req = {
      hostname: 'localhost'
    } as Partial<Request>;

    const redirectUrl = getIdamRedirectUrl(req as Request);

    expect(redirectUrl).eq('http://localhost:3000/redirectUrl');
  });

  it('getIdamLoginUrl for login', () => {
    const req = {
      query: { register: true } as any
    } as Partial<Request>;

    const loginUrl = getIdamLoginUrl(req as Request);

    expect(loginUrl).contains('/users/selfRegister');
  });

  it('getIdamLoginUrl for login', () => {
    const req = {
      query: {}
    } as Partial<Request>;

    const loginUrl = getIdamLoginUrl(req as Request);

    expect(loginUrl).contains('/login');
  });

  // TODO: add tests for getConditionalRedirectUrl method
});
