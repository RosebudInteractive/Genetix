/**
 * User: kiknadze
 * Date: 23.02.2015
 * Time: 15:02
 */
requirejs.config({
    baseUrl: 'scripts',
    nodeRequire: require,
    paths: {
        "text"              : '/scripts/lib/uccello/uses/text',
        "underscore"        : '/scripts/lib/uccello/uses/underscore',
        "wGrid"             : '/scripts/widgets/wGrid',
        "gPopup"            : '/scripts/widgets/popup',
        "flex-container"    : '/scripts/widgets/flex-container',
        "flex-min-dimension": '/scripts/widgets/flex-min-dimension'/*,
        deviceHelper: '/scripts/deviceHelper'*/
    }
});
