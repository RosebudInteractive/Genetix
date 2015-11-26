define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/dbTreeView.html', '/scripts/lib/uccello/system/utils.js'],
    function(template, tpl, Utils) {
        var vDbTreeView = {};
        vDbTreeView._templates = template.parseTemplate(tpl);
        vDbTreeView.render = function(options) {
            var item = $('#' + this.getLid()), that=this, tree = item.find('.tree');

            var curMode = this.cursorSyncMode();
            if (curMode === undefined || curMode == null)
                curMode = "OneWay";
            curMode = curMode.toUpperCase();

            if (item.length == 0) {
                item = $(vDbTreeView._templates['dbTreeView']).attr('id', this.getLid());
                tree = item.find('.tree');
                item.focus(function(){
                    if (that.getRoot().currentControl() != that) {
                        that.getControlMgr().userEventHandler(that, function(){
                            var selectedNode = tree.treegrid("getSelected");
                            if (selectedNode) {
                                $("tr.datagrid-row[node-id=" + selectedNode.id + "]").focus();
                            }
                            that.setFocused();
                        });
                    }
                });

                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);

                var layoutPane = item.find(".layout");
                layoutPane.css({width: "100%", "height": "100%"});
                layoutPane.panel({
                    border: false
                });
                $(window).on("genetix:resize", function () {
                    layoutPane.panel('resize');
                    tree.treegrid('resize');
                });


                tree = tree.treegrid({
                    loader: function(param, success, error) {
                        var treeItem = null;
                        if(param.id) {
                            var nodeData = tree.treegrid("find", param.id);
                            treeItem = nodeData.data.treeItem;
                        }
                        that.getControlMgr().userEventHandler(that, function() {
                            that.getData(treeItem, function(data) {
                                for (var i = 0; i < data.length; i++) {
                                    var d = data[i];
                                    d.id = d.id.replace("@", "_");
                                    d.children = undefined;
                                    d.state = 'closed';
                                }
                                success(data);
                            });
                        });
                    },
                    animate: true,
                    lines: false,
                    idField: "id",
                    treeField: "text",
                    columns:[[
                        {title:'Name',field:'text',width:180}
                    ]],
                    fit: true,
                    region: "center",
                    onBeforeExpand: function(row) {
                        if (row.data && row.data.treeItem && !row.data.treeItem.isOpen())
                            that.getControlMgr().userEventHandler(that, function() {
                                row.data.treeItem.isOpen(true);
                            });
                    },
                    onBeforeCollapse: function(row) {
                        if (row.data && row.data.treeItem && row.data.treeItem.isOpen())
                            that.getControlMgr().userEventHandler(that, function() {
                                row.data.treeItem.isOpen(false);
                            });
                    },
                    onSelect: function(row) {
                        that.getControlMgr().userEventHandler(that, function(){
                            if (row.data.type == 'item') {
                                that._setDatasetCursor(row.data.treeItem);
                            }
                            that.cursor(row ? row.data.treeItem : null);
                        });
                    }
                });
            }

            var itemsCol = this.getCol("Items");
            for (var i = 0, len = itemsCol.count(); i < len; i++) {
                var item = itemsCol.get(i);
                if (item.isOpen()) {
                    tree.treegrid("expand", item.getGuid().replace("@", "_"));
                } else {
                    tree.treegrid("collapse", item.getGuid().replace("@", "_"));
                }
            }

            if (this.cursor()) {
                var nodeId = this.cursor().getGuid().replace("@", "_");
                var selectedNode = tree.treegrid("getSelected");
                if (selectedNode) {
                    if (selectedNode.id == nodeId) return;
                    else tree.treegrid("unselect", selectedNode.id);
                }

                tree.treegrid("select", nodeId);

                var el = document.getElementById(nodeId);
                //if (!elementInViewport(el))
                if (!el.isVisible())
                    el.scrollIntoView();
            }

            // выставляем фокус
            if ($(':focus').attr('id') != this.getLid() && this.getRoot().isFldModified("CurrentControl") && this.getRoot().currentControl() == this)
                $('#ch_'+this.getLid()).focus();
        }

        return vDbTreeView;


        function elementInViewport(el) {
            var top = el.offsetTop;
            var left = el.offsetLeft;
            var width = el.offsetWidth;
            var height = el.offsetHeight;

            while(el.offsetParent) {
                el = el.offsetParent;
                top += el.offsetTop;
                left += el.offsetLeft;
            }

            return (
                top >= window.pageYOffset &&
                left >= window.pageXOffset &&
                (top + height) <= (window.pageYOffset + window.innerHeight) &&
                (left + width) <= (window.pageXOffset + window.innerWidth)
            );
        }
    }
);