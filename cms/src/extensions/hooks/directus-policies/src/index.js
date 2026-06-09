const UPSTREAM_URL = process.env.UPSTREAM_URL;
const UPSTREAM_TOKEN = process.env.DIRECTUS_EXTENSION_FLOWS_UPSTREAM_AUTH_TOKEN;

export default ({ action }) => {
	action('policies.create', async ({ key, payload }) => {

		if (!UPSTREAM_URL || !UPSTREAM_TOKEN) {
			console.warn('directus-policies hook: UPSTREAM_URL or auth token not configured, skipping.');
			return;
		}

		console.log(`directus-policies hook: Creating policy ${key} in upstream ${UPSTREAM_URL}`);

		try {
			const response = await fetch(`${UPSTREAM_URL}/policies`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${UPSTREAM_TOKEN}`,
				},
				body: JSON.stringify({ id: key, ...payload }),
			});

			if (!response.ok) {
				const errorBody = await response.text();
				console.error(`directus-policies hook: Failed to create policy in upstream (${response.status}): ${errorBody}`);
			} else {
				console.log(`directus-policies hook: Successfully created policy ${key} in upstream.`);
			}
		} catch (error) {
			console.error(`directus-policies hook: Error creating policy in upstream:`, error);
		}
	});

	action('policies.update', async ({ keys, payload }) => {

		if (!UPSTREAM_URL || !UPSTREAM_TOKEN) {
			console.warn('directus-policies hook: UPSTREAM_URL or auth token not configured, skipping.');
			return;
		}

		for (const key of keys) {
			console.log(`directus-policies hook: Updating policy ${key} in upstream ${UPSTREAM_URL}`);

			try {
				const response = await fetch(`${UPSTREAM_URL}/policies/${key}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${UPSTREAM_TOKEN}`,
					},
					body: JSON.stringify(payload),
				});

				if (!response.ok) {
					const errorBody = await response.text();
					console.error(`directus-policies hook: Failed to update policy ${key} in upstream (${response.status}): ${errorBody}`);
				} else {
					console.log(`directus-policies hook: Successfully updated policy ${key} in upstream.`);
				}
			} catch (error) {
				console.error(`directus-policies hook: Error updating policy ${key} in upstream:`, error);
			}
		}
	});
};
