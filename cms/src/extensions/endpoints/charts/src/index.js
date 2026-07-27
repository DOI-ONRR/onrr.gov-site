// `charts` endpoint extension.
//
// A single endpoint extension that groups chart-data routes by source collection
// under the extension's `/charts` mount (Directus mounts a function-export endpoint
// at the extension name). Each collection module registers its routes under a
// `/<collection>` sub-path, so the full URL is `/charts/<collection>/<key>` —
// e.g. `/charts/disbursement/summary`, `/charts/disbursement/monthly`.
//
// To add a collection: create `./collections/<collection>.js` exporting
// `(router, context, base) => { router.get(`${base}/<key>`, …) }`, then register it
// below with its base path. Shared join/aggregate helpers live in `./lib/`.

import revenue from './collections/revenue.js';
import disbursement from './collections/disbursement.js';

export default (router, context) => {
	revenue(router, context, '/revenue');
	disbursement(router, context, '/disbursement');
};
