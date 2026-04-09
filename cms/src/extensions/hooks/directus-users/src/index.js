const UPSTREAM_URL = process.env.UPSTREAM_URL;
const UPSTREAM_TOKEN = process.env.DIRECTUS_EXTENSION_FLOWS_UPSTREAM_AUTH_TOKEN;

export default ({ action }) => {
	action('users.create', async ({ key, payload }) => {
		
		if (!UPSTREAM_URL || !UPSTREAM_TOKEN) {
			console.warn('directus-users hook: UPSTREAM_URL or auth token not configured, skipping.');
			return;
		}

		console.log(`directus-users hook: Creating user ${key} in upstream ${UPSTREAM_URL}`);

		try {
			const response = await fetch(`${UPSTREAM_URL}/users`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${UPSTREAM_TOKEN}`,
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorBody = await response.text();
				console.error(`directus-users hook: Failed to create user in upstream (${response.status}): ${errorBody}`);
			} else {
				console.log(`directus-users hook: Successfully created user ${key} in upstream.`);
			}
		} catch (error) {
			console.error(`directus-users hook: Error creating user in upstream:`, error);
		}
	});

	action('users.update', async ({ keys, payload }) => {
		
		if (Object.keys(payload).length === 1 && payload.last_page !== undefined) {
			return;
		}

		if (!UPSTREAM_URL || !UPSTREAM_TOKEN) {
			console.warn('directus-users hook: UPSTREAM_URL or auth token not configured, skipping.');
			return;
		}

		for (const key of keys) {
			console.log(`directus-users hook: Updating user ${key} in upstream ${UPSTREAM_URL}`);

			try {
				const response = await fetch(`${UPSTREAM_URL}/users/${key}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${UPSTREAM_TOKEN}`,
					},
					body: JSON.stringify(payload),
				});

				if (!response.ok) {
					const errorBody = await response.text();
					console.error(`directus-users hook: Failed to update user ${key} in upstream (${response.status}): ${errorBody}`);
				} else {
					console.log(`directus-users hook: Successfully updated user ${key} in upstream.`);
				}
			} catch (error) {
				console.error(`directus-users hook: Error updating user ${key} in upstream:`, error);
			}
		}
	});
};
