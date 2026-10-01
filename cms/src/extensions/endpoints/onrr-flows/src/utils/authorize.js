// Access control for the onrr-flows endpoints. These push content from this
// CMS to the upstream one with a write token, so only callers in one of the
// allowed roles may use them. The Publish flows call the endpoints with the
// flows service token (Authorization: Bearer {{$env.FLOWS_LOCAL_TOKEN}}), so
// that account must be in an allowed role too.

// Role names, comma-separated (ONRR_FLOWS_ALLOWED_ROLES). Names rather than
// IDs because IDs differ between environments. Matching ignores case and
// surrounding spaces. There is no default: unset or empty means nobody is
// allowed, so a missing setting can only lock the endpoints, never open them.
export function parseAllowedRoles(value) {
    if (value === undefined || value === null) return [];
    return String(value).split(',').map(name => name.trim()).filter(Boolean);
}

const normalize = name => String(name).trim().toLowerCase();

// Names of the caller's roles. accountability.roles holds the user's role and
// its parent roles (nested roles), so a user in a child of an allowed role is
// allowed too.
export async function getRoleNames(database, accountability) {
    const roles = accountability.roles ?? (accountability.role ? [accountability.role] : []);
    if (roles.length === 0) return [];
    const rows = await database('directus_roles').select('name').whereIn('id', roles);
    return rows.map(row => row.name);
}

const errorBody = (message, code) => ({ errors: [{ message, extensions: { code } }] });

export function createAuthorize({ database, allowedRoles, logger, getRoleNamesFn = getRoleNames }) {
    const allowed = new Set(allowedRoles.map(normalize));

    return async (req, res, next) => {
        const accountability = req.accountability;
        if (!accountability?.user) {
            logger.warn(`onrr-flows: rejected unauthenticated ${req.method} ${req.originalUrl} from ${accountability?.ip ?? 'unknown'}`);
            return res.status(401).json(errorBody('Authentication required.', 'UNAUTHENTICATED'));
        }

        try {
            const roles = await getRoleNamesFn(database, accountability);
            if (roles.some(name => allowed.has(normalize(name)))) return next();

            logger.warn(`onrr-flows: rejected ${req.method} ${req.originalUrl} for user ${accountability.user} (roles: ${roles.join(', ') || 'none'})`);
            return res.status(403).json(errorBody("You don't have permission to access this.", 'FORBIDDEN'));
        } catch (error) {
            return next(error);
        }
    };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Rejects a request whose route parameter isn't a UUID (page and file IDs both are).
export const requireUuidParam = name => (req, res, next) =>
    UUID.test(req.params[name] ?? '')
        ? next()
        : res.status(400).json(errorBody(`Invalid ${name}.`, 'INVALID_PAYLOAD'));
