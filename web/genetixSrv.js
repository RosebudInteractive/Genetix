/**
 * User: kiknadze
 * Date: 20.02.2015
 * Time: 19:22
 */
// дирректория где лежит Uccello
var uccelloDir = process.argv[2]?process.argv[2]:'Uccello';
console.log('Using folder: '+uccelloDir);

// Модули nodejs
var http = require('http');
var express = require('express');
var app = express();
var DeviceHelper = require('./scripts/deviceHelper');

// Обработчики express
// ----------------------------------------------------------------------------------------------------------------------

// обработчик файлов html будет шаблонизатор ejs
app.engine('html', require('ejs').renderFile);
// обработка /genetix
app.get('/genetix', function(req, res){
    var device = new DeviceHelper(req.headers["user-agent"]);
    if (device.mobile() || device.tablet())
        res.render('genetix.m.html');
    else
        res.render('genetix.html');
});
app.get('/buttons', function(req, res){
    var device = new DeviceHelper(req.headers["user-agent"]);
    if (device.mobile() || device.tablet())
        res.render('buttons.m.html');
    else
        res.render('buttons.html');
});

// статические данные и модули для подгрузки на клиент
app.use("/ui-impose", express.static(__dirname + '/ui-impose'));
app.use("/containers-layout", express.static(__dirname + '/containers-layout'));
app.use("/css", express.static(__dirname + '/css'));
app.use("/fonts", express.static(__dirname + '/fonts'));
app.use("/images", express.static(__dirname + '/images'));
app.use("/scripts", express.static(__dirname + '/scripts'));
app.use("/scripts/lib/uccello", express.static(__dirname + '/../../'+uccelloDir));


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
        {className:'GenDataGrid', component:'genDataGrid', viewsets:true, guid:'55d59ec4-77ac-4296-85e1-def78aa93d55'},
        {className:'GenLabel', component:'genLabel', viewsets:true, guid:'151c0d05-4236-4732-b0bd-ddcf69a35e25'},
        {className:'GenVContainer', component:'genVContainer', viewset:true, guid:'b75474ef-26d0-4298-9dad-4133edaa8a9c'},
        {className:'GenGContainer', component:'genGContainer', viewset:true, guid:'93ada11b-8c2a-4b06-b5ee-8622d607b0a4'},
        {className:'GenGColumn', component:'genGColumn', viewset:false, guid:'8d1b679e-4cfe-4faa-aecb-f0c53cf8e35a'},
        {className:'GenButton', component:'genButton', viewsets:true, guid:'bf0b0b35-4025-48ff-962a-1761aa7b3a7b'},
        {className:'GenDataEdit', component:'genDataEdit', viewset:true, guid:'567cadd5-7f9d-4cd8-a24d-7993f065f5f9'},
        // контролы уччелло
        {className:'Form', viewsets:true},
        {className:'Container', viewset:true},
        {className:'CContainer', viewset:true},
        {className:'HContainer', viewset:true},
        {className:'VContainer', viewset:true},
        {className:'GContainer', viewset:true}
    ],
    controlsPath: __dirname+'/scripts/controls/',
    dataPath: __dirname+'/data/',
    uccelloPath: __dirname+'/../../'+uccelloDir+'/',
    webSocketServer: {port:8082}
};

// модуль настроек
var UccelloConfig = require('../../'+uccelloDir+'/config/config');
UCCELLO_CONFIG = new UccelloConfig(config);
DEBUG = true;

// логирование
logger = require('../../'+uccelloDir+'/system/winstonLogger');
//perfomance = {now:require("performance-now")};
// очищаем файл лога при старте
if (UCCELLO_CONFIG.logger.clearOnStart) {
    var fs = require('fs')
    fs.writeFileSync(UCCELLO_CONFIG.logger.file, '');
}

// модуль сервера
var UccelloServ = require('../../'+uccelloDir+'/uccelloServ');
var CommunicationServer = require('../../' + uccelloDir + '/connection/commServer');
var communicationServer = new CommunicationServer.Server(UCCELLO_CONFIG.webSocketServer);
var uccelloServ = new UccelloServ({ authenticate: fakeAuthenticate, commServer: communicationServer });

// запускаем http сервер
http.createServer(app).listen(1326);
console.log('Сервер запущен на http://127.0.0.1:1326/');

communicationServer.start();
console.log("Communication Server started (port: " + UCCELLO_CONFIG.webSocketServer.port + ").");