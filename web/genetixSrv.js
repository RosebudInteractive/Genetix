/**
 * User: kiknadze
 * Date: 20.02.2015
 * Time: 19:22
 */
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
app.use("/css", express.static(__dirname + '/css'));
app.use("/fonts", express.static(__dirname + '/fonts'));
app.use("/images", express.static(__dirname + '/images'));
app.use("/scripts", express.static(__dirname + '/scripts'));
app.use("/scripts/lib/uccello", express.static(__dirname + '/../../Uccello'));


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
        {className:'DataContact', component:'../DataControls/dataContact', guid:'73596fd8-6901-2f90-12d7-d1ba12bae8f4'},
        {className:'DataContract', component:'../DataControls/dataContract', guid:'08a0fad1-d788-3604-9a16-3544a6f97721'},
        {className:'DataCompany', component:'../DataControls/dataCompany', guid:'59583572-20fa-1f58-8d3f-5114af0f2c514'},
        {className:'DataAddress', component:'../DataControls/dataAddress', guid:'16ec0891-1144-4577-f437-f98699464948'},
        {className:'DataLead', component:'../DataControls/dataLead', guid:'86c611ee-ed58-10be-66f0-dfbb60ab8907'},
        {className:'DataIncomeplan', component:'../DataControls/dataIncomeplan', guid:'56cc264c-5489-d367-1783-2673fde2edaf'},
        {className:'GenDataGrid', component:'genDataGrid', viewsets:['simpleview'], guid:'55d59ec4-77ac-4296-85e1-def78aa93d55'},
        {className:'GenLabel', component:'genLabel', viewsets:['simpleview'], guid:'151c0d05-4236-4732-b0bd-ddcf69a35e25'},
        {className:'GenContainer',component:'genContainer', viewsets:['simpleview'], guid:'b75474ef-26d0-4298-9dad-4133edaa8a9c'},
        {className:'GenButton', component:'genButton', viewsets:['simpleview'], guid:'bf0b0b35-4025-48ff-962a-1761aa7b3a7b'}
    ],
    controlsPath: __dirname+'/scripts/controls/',
    dataPath: __dirname+'/data/',
    uccelloPath: __dirname+'/../../Uccello/'
};

// модуль настроек
var UccelloConfig = require('../../Uccello/config/config');
UCCELLO_CONFIG = new UccelloConfig(config);

// модуль сервера
var UccelloServ = require('../../Uccello/uccelloServ');
var uccelloServ = new UccelloServ({port:8082, authenticate:fakeAuthenticate});

// запускаем http сервер
http.createServer(app).listen(1326);
console.log('Сервер запущен на http://127.0.0.1:1326/');