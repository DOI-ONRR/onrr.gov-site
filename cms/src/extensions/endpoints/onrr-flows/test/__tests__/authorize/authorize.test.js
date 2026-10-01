import { jest } from '@jest/globals';
import {
    parseAllowedRoles,
    createAuthorize,
    requireUuidParam,
} from '../../../src/utils/authorize';

const mockRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
};

const logger = { warn: jest.fn() };

const run = async ({ accountability, roles = [], allowed = parseAllowedRoles('Admin,Events,Service Account'), lookup }) => {
    const getRoleNamesFn = lookup ?? jest.fn(async () => roles);
    const middleware = createAuthorize({ database: {}, allowedRoles: allowed, logger, getRoleNamesFn });
    const req = { accountability, method: 'POST', originalUrl: '/onrr-flows/pages/x' };
    const res = mockRes();
    const next = jest.fn();
    await middleware(req, res, next);
    return { res, next, getRoleNamesFn };
};

describe('parseAllowedRoles', () => {
    it('has no default: unset means nobody', () => {
        expect(parseAllowedRoles(undefined)).toEqual([]);
        expect(parseAllowedRoles(null)).toEqual([]);
    });

    it('splits and trims a configured list', () => {
        expect(parseAllowedRoles(' Admin , Pages Editor,Events ')).toEqual(['Admin', 'Pages Editor', 'Events']);
    });

    it('treats an empty or blank setting as "nobody"', () => {
        expect(parseAllowedRoles('')).toEqual([]);
        expect(parseAllowedRoles(' , ,')).toEqual([]);
    });
});

describe('createAuthorize', () => {
    beforeEach(() => logger.warn.mockClear());

    it('rejects a request with no accountability with 401', async () => {
        const { res, next, getRoleNamesFn } = await run({ accountability: undefined });
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json.mock.calls[0][0].errors[0].extensions.code).toBe('UNAUTHENTICATED');
        expect(next).not.toHaveBeenCalled();
        expect(getRoleNamesFn).not.toHaveBeenCalled();
    });

    it('rejects the public (anonymous) role with 401', async () => {
        const { res, next } = await run({ accountability: { user: null, role: null, roles: [], ip: '203.0.113.9' } });
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
        expect(logger.warn.mock.calls[0][0]).toContain('203.0.113.9');
    });

    it('rejects a signed-in user without an allowed role with 403 (e.g. the read-only Preview token)', async () => {
        const { res, next } = await run({ accountability: { user: 'u1', roles: ['r1'] }, roles: ['Preview'] });
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json.mock.calls[0][0].errors[0].extensions.code).toBe('FORBIDDEN');
        expect(next).not.toHaveBeenCalled();
        expect(logger.warn.mock.calls[0][0]).toContain('u1');
    });

    it('rejects a user with no role at all', async () => {
        const { res } = await run({ accountability: { user: 'u1', roles: [] }, roles: [] });
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it.each([['Admin'], ['Events'], ['Service Account'], ['admin'], [' EVENTS ']])('allows a user in role %j', async role => {
        const { res, next } = await run({ accountability: { user: 'u1', roles: ['r1'] }, roles: [role] });
        expect(next).toHaveBeenCalledWith();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('allows a user whose parent role is allowed (nested roles)', async () => {
        const { next } = await run({ accountability: { user: 'u1', roles: ['child', 'parent'] }, roles: ['Events Contributors', 'Events'] });
        expect(next).toHaveBeenCalledWith();
    });

    it('does not let admin access alone stand in for the list', async () => {
        const { res } = await run({ accountability: { user: 'u1', roles: ['r1'], admin: true }, roles: ['frontend'] });
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('uses the configured list instead of the default', async () => {
        const allowed = parseAllowedRoles('Pages Editor');
        expect((await run({ accountability: { user: 'u1' }, roles: ['Pages Editor'], allowed })).next).toHaveBeenCalledWith();
        expect((await run({ accountability: { user: 'u1' }, roles: ['Admin'], allowed })).res.status).toHaveBeenCalledWith(403);
    });

    it('denies everyone, admins included, when the setting is missing', async () => {
        const { res, next } = await run({ accountability: { user: 'u1', admin: true }, roles: ['Admin'], allowed: parseAllowedRoles(undefined) });
        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('passes a lookup failure to the error handler instead of allowing the request', async () => {
        const error = new Error('db down');
        const { res, next } = await run({ accountability: { user: 'u1' }, lookup: jest.fn(async () => { throw error; }) });
        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
    });
});

describe('requireUuidParam', () => {
    const check = value => {
        const res = mockRes();
        const next = jest.fn();
        requireUuidParam('id')({ params: { id: value } }, res, next);
        return { res, next };
    };

    it('accepts a UUID', () => {
        expect(check('2cc2eeb1-ed5a-416e-bc76-8784e935e240').next).toHaveBeenCalled();
    });

    it.each([['1'], ['abc'], [''], ['2cc2eeb1-ed5a-416e-bc76-8784e935e240/../x'], [undefined]])('rejects %j with 400', value => {
        const { res, next } = check(value);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });
});
