const  scoreRoutes = require('./score_routes');
const  welcome = require('./welcome');
module.exports = function (app, db) {
    scoreRoutes(app, db);
    welcome(app, db);
}