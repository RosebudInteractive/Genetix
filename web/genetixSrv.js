/**
 * User: kiknadze
 * Date: 20.02.2015
 * Time: 19:22
 */
// дирректория где лежит Uccello
var uccelloDir = process.argv[2]&&process.argv[2]!='-'?process.argv[2]:'Uccello';
var _dbPath = '../../Genetix/web/data/';



console.log('Using folder: '+uccelloDir);
// порт web
var uccelloPortWeb = process.argv[3]&&process.argv[3]!='-'?process.argv[3]:1326;
// порт websocket
var uccelloPortWsf = process.argv[4]&&process.argv[4]!='-'?process.argv[4]:8082;

DEBUG = true;

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
        res.render('genetix.html', { webSocketServerPort: UCCELLO_CONFIG.webSocketServer.port});
        //res.render('genetix.m.html', { webSocketServerPort: UCCELLO_CONFIG.webSocketServer.port});
    else
        res.render('genetix.html', { webSocketServerPort: UCCELLO_CONFIG.webSocketServer.port});
});
app.get('/buttons', function(req, res){
    var device = new DeviceHelper(req.headers["user-agent"]);
    if (device.mobile() || device.tablet())
        res.render('buttons.html');
        //res.render('buttons.m.html');
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
    if (user.substring(0, 1)=='u')
        row = {user_id:1, email:'user@user.com'};
    done(err, row);
}


var config = {
    controls:[
        {className:'GenDataGrid', component:'genDataGrid', guid:'55d59ec4-77ac-4296-85e1-def78aa93d55'},
        {className:'GenLabel', component:'genLabel', guid:'151c0d05-4236-4732-b0bd-ddcf69a35e25'},
        {className:'GenVContainer', component:'genVContainer', guid:'b75474ef-26d0-4298-9dad-4133edaa8a9c'},
        {className:'GenGContainer', component:'genGContainer', guid:'93ada11b-8c2a-4b06-b5ee-8622d607b0a4'},
        {className:'GenGColumn', component:'genGColumn', guid:'8d1b679e-4cfe-4faa-aecb-f0c53cf8e35a'},
        {className:'GenButton', component:'genButton', guid:'bf0b0b35-4025-48ff-962a-1761aa7b3a7b'},
        {className:'GenDataEdit', component:'genDataEdit', guid:'567cadd5-7f9d-4cd8-a24d-7993f065f5f9'},
        {className:'GenForm', component:'genForm', guid:'29bc7a01-2065-4664-b1ad-7cc86f92c177'}
    ] ,

    classGuids: {
        "RootTstCompany": "c4d626bf-1639-2d27-16df-da3ec0ee364e",
        "DataTstCompany": "34c6f03d-f6ba-2203-b32b-c7d54cd0185a",
        "RootTstContact": "de984440-10bd-f1fd-2d50-9af312e1cd4f",
        "DataTstContact": "27ce7537-7295-1a45-472c-a422e63035c7",
        "RootContract": "4f7d9441-8fcc-ba71-2a1d-39c1a284fc9b",
        "DataContract": "08a0fad1-d788-3604-9a16-3544a6f97721",
        "RootAddress": "07e64ce0-4a6c-978e-077d-8f6810bf9386",
        "DataAddress": "16ec0891-1144-4577-f437-f98699464948",
        "RootLeadLog": "bedf1851-cd51-657e-48a0-10ac45e31e20",
        "DataLeadLog": "c4fa07b5-03f7-4041-6305-fbd301e7408a",
        "RootIncomeplan": "194fbf71-2f84-b763-eb9c-177bf9ac565d",
        "DataIncomeplan": "56cc264c-5489-d367-1783-2673fde2edaf",
        "RootOpportunity": "3fe7cd6f-b146-8898-7215-e89a2d8ea702",
        "DataOpportunity": "5b64caea-45b0-4973-1496-f0a9a44742b7",
        "RootCompany": "0c2f3ec8-ad4a-c311-a6fa-511609647747",
        "DataCompany": "59583572-20fa-1f58-8d3f-5114af0f2c51",
        "RootContact": "ad17cab2-f41a-36ef-37da-aac967bbe356",
        "DataContact": "73596fd8-6901-2f90-12d7-d1ba12bae8f4",
        "DataLead": "86c611ee-ed58-10be-66f0-dfbb60ab8907",
        "RootLead": "31c99003-c0fc-fbe6-55eb-72479c255556"
    },
    controlsPath: __dirname+'/scripts/controls/',
    dataPath: __dirname+'/data/',
    uccelloPath: __dirname+'/../../'+uccelloDir+'/',
    dataman: {
        /*connection: {
            host: "localhost",
            username: "root",
            password: "masterkey",
            database: "uccello",
            provider: "mysql",
            connection_options: {},
            provider_options: {},
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            },
        },*/
        connection: {
            host: "127.0.0.1",
            username: "genetix",
            password: "genetix",
            database: "genetix",
            provider: "mysql",
            connection_options: {},
            provider_options: {},
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            },
        },
        importData: {
            autoimport: false,
            dir: "../web/data/tables"
        },
        trace: {
            sqlCommands: true,
            importDir: true
        }
    },
    resman: {
        useDb: false,
        defaultProduct: "Genetix",
        sourceDir: [
            {path: _dbPath + 'forms/', type: 'FRM'}
        ]
    },
    resourceBuilder: {
        types: [
            {Code: "FRM", Name: "User Form", ClassName: "ResForm", Description: "Пользовательская форма"},
            {Code: "PR_DEF", Name: "Process Definition", ClassName: "ProcessDefinition", Description: "Определение процесса"}
        ],
        destDir : _dbPath + "tables/",
        formResTypeId: 1,
        productId: 2,
        currBuildId: 2
    }
};

// модуль настроек
var UccelloConfig = require('../../'+uccelloDir+'/config/config');
UCCELLO_CONFIG = new UccelloConfig(config);
if (uccelloPortWeb) UCCELLO_CONFIG.webServer.port = uccelloPortWeb;
if (uccelloPortWsf) UCCELLO_CONFIG.webSocketServer.port = uccelloPortWsf;


// логирование
logger = require('../../'+uccelloDir+'/system/winstonLogger');
//perfomance = {now:require("performance-now")};
// очищаем файл лога при старте
if (UCCELLO_CONFIG.logger.clearOnStart) {
    var fs = require('fs')
    fs.writeFileSync(UCCELLO_CONFIG.logger.file, '');
}

// модуль сервера
/*var UccelloServ = require('../../'+uccelloDir+'/uccelloServ');
var CommunicationServer = require('../../' + uccelloDir + '/connection/commServer');
var communicationServer = new CommunicationServer.Server(UCCELLO_CONFIG.webSocketServer);
var uccelloServ = new UccelloServ({ authenticate: fakeAuthenticate, commServer: communicationServer });

// запускаем http сервер
http.createServer(app).listen(UCCELLO_CONFIG.webServer.port);
console.log('Web server started http://127.0.0.1:'+UCCELLO_CONFIG.webServer.port+'/');

communicationServer.start();
console.log("Communication Server started (port: " + UCCELLO_CONFIG.webSocketServer.port + ").");*/


//----------------------

// модуль сервера
var UccelloServ = require('../../'+uccelloDir+'/uccelloServ');
var CommunicationServer = require('../../' + uccelloDir + '/connection/commServer');

// комуникационный модуль
UCCELLO_CONFIG.webSocketServer = UCCELLO_CONFIG.webSocketServer ? UCCELLO_CONFIG.webSocketServer : {};

var communicationServer = new CommunicationServer.Server(UCCELLO_CONFIG.webSocketServer);
var uccelloServ = new UccelloServ({
    authenticate: fakeAuthenticate,
    commServer: communicationServer
});

// запускаем http сервер
http.createServer(app).listen(UCCELLO_CONFIG.webServer.port, '0.0.0.0');
console.log('Web server started http://127.0.0.1:'+UCCELLO_CONFIG.webServer.port+'/');

// зщапускаем коммуникационный сервер
communicationServer.start();
console.log("Communication Server started (port: " + UCCELLO_CONFIG.webSocketServer.port + ").");