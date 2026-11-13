// `pricing-exports` endpoint extension. Mounted at /pricing-exports.
//
// Streams a pricing dataset's FULL price history as a generated XLSX, on demand. This replaces the
// former client-side (in-browser SheetJS) download: a CMS footnote link `#download/<slug>` is
// retargeted by the frontend plugin to `${apiUrl}/pricing-exports/<slug>.xlsx`.
//
//   GET /pricing-exports            list the supported slugs (no side effects)
//   GET /pricing-exports/<slug>     stream the XLSX (the slug may carry a trailing `.xlsx`)
//
// Reads PUBLISHED rows straight from the pricing collection via knex (the same data the public
// /items read exposes), flattens per the slug spec, and builds the workbook in memory. The data is
// small (monthly snapshots), so nothing is stored or cached on disk — the file is always current.
import { DATASETS, SUPPORTED_SLUGS, hasDataset } from './datasets.js';
import { buildWorkbook } from './buildWorkbook.js';

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export default (router, context) => {
	const { database } = context;

	// List the slugs this endpoint can export — handy for wiring/debugging.
	router.get('/', (req, res) => res.json({ datasets: SUPPORTED_SLUGS }));

	// Stream one dataset's full price history as XLSX.
	router.get('/:slug', async (req, res) => {
		const slug = String(req.params.slug || '').replace(/\.xlsx$/i, '');
		if (!hasDataset(slug)) {
			return res.status(404).json({ error: `Unknown pricing dataset '${slug}'. Supported: ${SUPPORTED_SLUGS.join(', ')}.` });
		}
		const cfg = DATASETS[slug];
		try {
			const data = await database(cfg.collection)
				.select(cfg.select)
				.where('status', 'published')
				.orderBy(cfg.order[0], cfg.order[1]);
			const buf = buildWorkbook(cfg.flatten(data), cfg.columns, cfg.sheet);
			res.setHeader('Content-Type', XLSX_TYPE);
			res.setHeader('Content-Disposition', `attachment; filename="${cfg.filename}"`);
			res.setHeader('Cache-Control', 'public, max-age=300');
			res.send(buf);
		} catch (error) {
			console.error(`[pricing-exports] ${slug} failed:`, error);
			res.status(500).json({ error: 'Failed to generate pricing XLSX.' });
		}
	});
};
