const UPSTREAM_URL = process.env.UPSTREAM_URL;
const UPSTREAM_TOKEN = process.env.DIRECTUS_EXTENSION_FLOWS_UPSTREAM_AUTH_TOKEN;

export default ({ action }) => {
	action('roles.create', async ({ key, payload }) => {

		if (!UPSTREAM_URL || !UPSTREAM_TOKEN) {
			console.warn('directus-roles hook: UPSTREAM_URL or auth token not configured, skipping.');
			return;
		}

		console.log(`directus-roles hook: Creating role ${key} in upstream ${UPSTREAM_URL}`);

		try {
			const response = await fetch(`${UPSTREAM_URL}/roles`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${UPSTREAM_TOKEN}`,
				},
				body: JSON.stringify({ id: key, ...payload }),
			});

			if (!response.ok) {
				const errorBody = await response.text();
				console.error(`directus-roles hook: Failed to create role in upstream (${response.status}): ${errorBody}`);
			} else {
				console.log(`directus-roles hook: Successfully created role ${key} in upstream.`);
			}
		} catch (error) {
			console.error(`directus-roles hook: Error creating role in upstream:`, error);
		}
	});

	action('roles.update', async ({ keys, payload }) => {

		if (!UPSTREAM_URL || !UPSTREAM_TOKEN) {
			console.warn('directus-roles hook: UPSTREAM_URL or auth token not configured, skipping.');
			return;
		}

		for (const key of keys) {
			console.log(`directus-roles hook: Updating role ${key} in upstream ${UPSTREAM_URL}`);

			try {
				const response = await fetch(`${UPSTREAM_URL}/roles/${key}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${UPSTREAM_TOKEN}`,
					},
					body: JSON.stringify(payload),
				});

				if (!response.ok) {
					const errorBody = await response.text();
					console.error(`directus-roles hook: Failed to update role ${key} in upstream (${response.status}): ${errorBody}`);
				} else {
					console.log(`directus-roles hook: Successfully updated role ${key} in upstream.`);
				}
			} catch (error) {
				console.error(`directus-roles hook: Error updating role ${key} in upstream:`, error);
			}
		}
	});
};
