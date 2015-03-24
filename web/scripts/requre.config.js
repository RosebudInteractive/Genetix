/**
 * User: kiknadze
 * Date: 23.02.2015
 * Time: 15:02
 */
requirejs.config({
    baseUrl: 'scripts',
    nodeRequire: require,
    paths: {
        text       : '/scripts/lib/uccello/uses/text',
        underscore : '/scripts/lib/uccello/uses/underscore',
        wGrid      : '/scripts/widgets/wGrid',
        gPopup     : '/scripts/widgets/popup'/*,
        deviceHelper: '/scripts/deviceHelper'*/
    }
});
