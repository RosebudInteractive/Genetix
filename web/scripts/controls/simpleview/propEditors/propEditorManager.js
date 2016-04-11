/**
 * Created by kiknadze on 06.04.2016.
 */

define(
    ["./defaultEditor", "./dataGridPRopEditor"],
    function(DefEditor, DBGridPropEditor) {
        var editors = null;

        var PropEditorManager = Class.extend({

            init: function(model) {
                this._model = model;
                editors = {
                    default: {
                        name: "DefaultEditor",
                        default: true,
                        obj: new DefEditor(this._model)
                    } ,
                    dataGrid: {
                        DataGridEditor: {
                            name: "DataGridEditor",
                            default: true,
                            obj: new DBGridPropEditor(this._model)
                        }
                    }
                }

            },

            setModel: function(model) {
                this._model = model;
                editors.default.obj.setModel(model);
                editors.dataGrid.DataGridEditor.obj.setModel(model);
            },

            renderProperties: function(parentDiv, control, callback) {
                var editor = editors.default;
                if (control && control.className == "DesignerControl" &&
                    (control.typeGuid() == UCCELLO_CONFIG.classGuids.DataGrid ||
                        control.typeGuid() ==  UCCELLO_CONFIG.classGuids.GenDataGrid)
                    ) {
                    editor = editors.dataGrid.DataGridEditor;
                }

                editor.obj.render(parentDiv, control, callback);
            }

        });
        return new PropEditorManager();
    }
);
