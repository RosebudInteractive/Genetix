/**
 * Created by kiknadze on 06.04.2016.
 */

define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./../templates/designerPropEditor.html'],
    function(template, tpl) {
        var _templates = template.parseTemplate(tpl);

        var PropEditorManager = Class.extend({

            init: function(model) {
                this._model = model;
            },

            setModel: function(model) {
                this._model = model;
            },

            render: function(parentDiv, control, callback) {
                var tbl = parentDiv.find("table");

                var changeHandler = function(obj, funcName, inpt, callback) {
                    return function (e) {
                        var opts = {
                            Dataset: inpt.val()
                        };
                        callback(e, funcName, JSON.stringify(opts));
                    }
                };

                if (tbl.length == 0) {
                    var header = $(_templates["header"]);
                    parentDiv.append(header);
                    parentDiv.append(_templates["body"]);
                }
                var tb = tbl.find("tbody");
                tb.empty();

                var funcName = "controlProperties";
                var curr = control;
                if (curr) {
                    var propsStr = control.controlProperties();
                    var props = {};
                    if (propsStr) {
                        props = JSON.parse(propsStr);
                    }
                    var tmpl = _templates["selectProperty"];
                    var tr = $(tmpl);
                    var propName = "Dataset";
                    tr.find(".name").text(propName);
                    var inpt = tr.find(".value").find("select");
                    $.data(inpt[0], "propName", propName);

                    if (this._model) {
                        var col = this._model.getCol("Datasets");
                        for (var i = 0; i < col.count(); i++) {
                            var ds = col.get(i);
                            var opt = $("<option value='" + ds.resElemName() + "'>" + ds.resElemName() + "</option>");
                            inpt.append(opt);
                        }
                    }
                    tb.append(tr);

                    if (props.Dataset)
                        inpt.val(props.Dataset);
                    inpt.change(changeHandler(control, funcName, inpt, callback));
                }


            }

        });
        return PropEditorManager;
    }
);
