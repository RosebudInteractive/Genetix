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
        {className:'Container',component:'container', viewsets:['simpleview'], guid:'1d95ab61-df00-aec8-eff5-0f90187891cf'},
        {className:'Form', component:'form', viewsets:['simpleview'], guid:'7f93991a-4da9-4892-79c2-35fe44e69083'},
        {className:'DataColumn', component:'dataColumn', guid:'100f774a-bd84-8c46-c55d-ba5981c09db5'},
        {className:'DataGrid', component:'dataGrid', viewsets:['simpleview'], guid:'ff7830e2-7add-e65e-7ddf-caba8992d6d8'}
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