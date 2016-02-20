define(
    [],
    function() {
        var LeadEdit = Class.extend({

            init: function(uccelloClt) {
                this.pvt = {};
                this.pvt.uccelloClt = uccelloClt;
            },

            clickEdit: function () {
                var self = this;
                this._invokeObjMethod("edit", function () {
                    self.setEditForm(true);
                });
            },

            clickConvert: function(edit) {
                var self = this;
                this._invokeObjMethod("convert", function () {
                    //self.setEditForm(true);
                });
            },

            clickArchive: function(edit) {
                var self = this;
                this._invokeObjMethod("archive", function () {
                    //self.setEditForm(true);
                });
            },

            clickNext: function(edit) {
                var cm = this.pvt.uccelloClt.getContextCM();
                cm.getByName('DatasetLeadEdit').next();
            },

            clickPrev: function(edit) {
                var cm = this.pvt.uccelloClt.getContextCM();
                cm.getByName('DatasetLeadEdit').prev();
            },

            clickSave: function(edit) {
                var self = this;
                this._invokeObjMethod("save", function () {
                    self.setEditForm(false);
                });
            },

            clickCancel: function(edit) {
                var self = this;
                this._invokeObjMethod("cancel", function () {
                    self.setEditForm(false);
                });
            },

            clickNew: function (edit) {
                var recordid = Math.floor(Math.random() * 10000) + 10000;
                this._dataset().addObject(
                    {
                        fields: {
                            Id: recordid,
                            Name: 'Record ' + recordid,
                            State: 'Open',
                            Source: 'Source ' + recordid,
                            Content: 'Content ' + recordid,
                            Creation: new Date().toISOString().slice(0, 19).replace('T', ' '),
                            OpportunityId: recordid
                        }
                    }, function (result) {
                        if (DEBUG)
                            console.log('END ADD OBJ with result: ' + JSON.stringify(result));
                        if (result && result.result) {
                            if (result.result === "OK")
                                alert("Object has been successfully created !\nGUID: \"" + result.newObject + "\".");
                            else
                                alert("Error occured: \"" + result.message + "\"");
                        }
                    });
            },
            
            setEditForm: function(edit) {
                var cm = this.pvt.uccelloClt.getContextCM();
                cm.userEventHandler(this, function () {
                    cm.getByName('ToolbarBtn3_2').enabled(!edit);
                    cm.getByName('ToolbarBtn3_1').enabled(!edit);
                    cm.getByName('ToolbarBtn3_3').enabled(!edit);
                    cm.getByName('status').enabled(edit);
                    cm.getByName('content').enabled(edit);
                    cm.getByName('source').enabled(edit);
                    cm.getByName('closed').enabled(edit);
                    cm.getByName('firstName').enabled(!edit);
                    cm.getByName('workPhone').enabled(edit);
                    cm.getByName('name').enabled(edit);
                    cm.getByName('mobile').enabled(edit);
                    cm.getByName('contSource').enabled(edit);
                    cm.getByName('email').enabled(edit);
                    cm.getByName('company').enabled(edit);
                    cm.getByName('town').enabled(edit);
                    cm.getByName('sector').enabled(edit);
                    cm.getByName('index').enabled(edit);
                    cm.getByName('workersCount').enabled(edit);
                    cm.getByName('address').enabled(edit);
                    cm.getByName('ToolbarBtn2').enabled(edit);
                    cm.getByName('ToolbarBtn3').enabled(edit);
                });
            },

            _dataset: function () {
                var cm = this.pvt.uccelloClt.getContextCM();
                return cm.getByName('DatasetLeadList');
            },

            _currentObj: function () {
                return this._dataset().getCurrentDataObject();
            },

            _invokeObjMethod: function (method_name, callback) {
                var obj = this._currentObj();
                var isDone = true;
                if (obj)
                    obj[method_name](function (result) {
                        if (DEBUG)
                            console.log('"' + method_name + '" finished with result: ' + JSON.stringify(result));
                        if (result && result.result) {
                            if (result.result !== "OK") {
                                var msg = result.message ? ": \"" + result.message + "\"" : ".";
                                alert("Error occured" + msg);
                                isDone = false;
                            };
                        };
                        if (isDone && callback)
                            setTimeout(function () {
                                callback();
                            }, 0);
                    })
                else {
                    if (callback)
                        setTimeout(function () {
                            callback();
                        }, 0);
                };
            }
        });
        return LeadEdit;
    }
);