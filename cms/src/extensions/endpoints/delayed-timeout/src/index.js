export default (router) => {
	router.get('/', async (req, res) => {
		const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
		await delay(10000);
		res.send('doggo ipsum')
	})
}
