import { v4 as uuidv4 } from 'uuid';

export default {
	id: 'onrr-generate-uuid',
	handler: () => {
		return uuidv4();
	},
};
