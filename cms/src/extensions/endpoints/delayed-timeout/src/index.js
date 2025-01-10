export default (router) => {
	router.get('/', async (req, res) => {
		await delay(10000);
		
		res.send('doggo ipsum')
	})
}
