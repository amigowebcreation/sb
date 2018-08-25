module.exports = function (app, db) {
    app.get('/', async (req, res) => {
        res.render('pages/index')
    })
}