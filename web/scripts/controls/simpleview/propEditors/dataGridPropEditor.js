/**
 * Created by kiknadze on 06.04.2016.
 */

define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./../templates/designerPropEditor.html'],
    function(template, tpl) {
        var _templates = template.parseTemplate(tpl);

        var DataGridPropEditor = Class.extend({

            init: function(model, propSource) {
                this._model = model;
                this._propSource = propSource;
            },

            setModel: function(model) {
                this._model = model;
            },

            setPropSource: function(propSource) {
                this._propSource = propSource;
            },

            _getPropsDataset: function(control) {
                var propDS = null;
                var col = this._propSource.getCol("Datasets");
                for (var i = 0, len = col.count(); i < len; i++) {
                    var d = col.get(i);
                    if (d.getCurrentDataObject() == control) {
                        propDS = d;
                        break;
                    }
                }
                return propDS;
            },

            render: function(parentDiv, control, callback) {
                if (!this._propSource) return;
                var tbl = parentDiv.find("table");
                var that = this;
                var changeHandler = function(control, propName, inpt, callback) {
                    return function (e) {
                        var pDS = that._getPropsDataset(control);
                        var v = (inpt.val() == "null" ? null : inpt.val());

                        callback(e, propName, pDS, v);
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
                if (control) {
                    var propDS = this._getPropsDataset(control);
                    if (!propDS) {
                        console.error("Can not find properties dataset");
                        return;
                    }


                    var tmpl = _templates["selectProperty"];
                    var tr = $(tmpl);
                    var propName = "Dataset";
                    tr.find(".name").text(propName);
                    var inpt = tr.find(".value").find("select");
                    $.data(inpt[0], "propName", propName);

                    if (this._model) {
                        var opt = $("<option value='null'>(None)</option>");
                        inpt.append(opt);
                        var col = this._model.getCol("Datasets");
                        for (var i = 0; i < col.count(); i++) {
                            var ds = col.get(i);
                            var opt = $("<option value='" + ds.resElemName() + "'>" + ds.resElemName() + "</option>");
                            inpt.append(opt);
                        }
                    }
                    tb.append(tr);

                    var dsVal = propDS.getField("Dataset");

                    inpt.val(dsVal ? dsVal : "null");
                    inpt.change(changeHandler(control, propName, inpt, callback));

                    tmpl = _templates["property"];
                    var tr = $(tmpl);
                    propName = "Name";
                    var val = propDS.getField("Name");
                    inpt = tr.find(".value").find("input");
                    $.data(inpt[0], "propName", propName);
                    inpt.val(propDS.getField("Name"));
                    tb.append(tr);
                    inpt.change(changeHandler(control, propName, inpt, callback));
                }


            }

        });
        return DataGridPropEditor;
    }
);
