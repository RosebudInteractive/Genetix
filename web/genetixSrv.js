/**
 * User: kiknadze
 * Date: 20.02.2015
 * Time: 19:22
 */
var UccelloServ = require('../../Uccello/uccelloServ');

// Модули nodejs
var http = require('http');
var express = require('express');
var app = express();

// Обработчики express
// ----------------------------------------------------------------------------------------------------------------------

// обработчик файлов html будет шаблонизатор ejs
app.engine('html', require('ejs').renderFile);
// обработка /genetix
app.get('/genetix', function(req, res){
    res.render('genetix.html');
});

// статические данные и модули для подгрузки на клиент
app.use("/ui-impose", express.static(__dirname + '/ui-impose'));
app.use("/lib", express.static(__dirname + '/lib'));
app.use("/css", express.static(__dirname + '/css'));
app.use("/fonts", express.static(__dirname + '/fonts'));
app.use("/images", express.static(__dirname + '/images'));
app.use("/lib/uccello", express.static(__dirname + '/../../Uccello'));
app.use("/scripts", express.static(__dirname + '/scripts'));
app.use("/templates", express.static(__dirname + '/templates'));


/**
 * Функция заглушка для аутентификации
 * @param user
 * @param pass
 * @param done
 */
function fakeAuthenticate(user, pass, done) {
    var err = null, row = null;
    if (user.substring(0, 1)=='u' && pass.substring(0, 1)=='p')
        row = {user_id:1, email:'user@user.com'};
    done(err, row);
}


var config = {
    controls:[
        {className:'Container',component:'container', viewsets:[], guid:'1d95ab61-df00-aec8-eff5-0f90187891cf'}
    ],
    controlsPath: __dirname+'/../../Genetix/web/scripts/controls/',
    dataPath: __dirname+'/../../Genetix/data/',
    uccelloPath: __dirname+'/../../Uccello/'
};
var uccelloServ = new UccelloServ({port:8081, authenticate:fakeAuthenticate, config:config});

// запускаем http сервер
http.createServer(app).listen(1326);
console.log('Сервер запущен на http://127.0.0.1:1326/');