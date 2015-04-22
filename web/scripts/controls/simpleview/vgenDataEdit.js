define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/dataEdit.html'],
    function(template, tpl) {
        var vGenDataEdit = {};
        vGenDataEdit._templates = template.parseTemplate(tpl);
        vGenDataEdit.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                item = $(vGenDataEdit._templates['edit']).attr('id', this.getLid());
                var parent = (this.getParent()? '#' + this.getParent().getLid(): options.rootContainer);
                $(parent).append(item);

                // сохранять при потере фокуса
                item.find("input").blur(function () {
                    if (that.dataset() && that.dataField()) {
                        that.getControlMgr().userEventHandler(that, function () {
                            var dataset = that.getControlMgr().get(that.dataset());
                            dataset.setField(that.dataField(), item.find("input").val());
                        });
                    }
                });
            }

            // координаты контрола
            item.css({top: this.top() + 'px', left: this.left() + 'px'});
            if (this.title()) {
                item.attr("title", this.title());
                item.tooltip({
                    position: { my: 'center top', at: 'center bottom', collision: 'none' },
                    tooltipClass: 'bottom'
                });
            } else
                item.removeAttr("title");

            // устанавливаем значение
            if (this.dataset() && this.dataField()) {
                var dataset = that.getControlMgr().get(that.dataset());
                item.find("input").val(dataset? dataset.getField(this.dataField()): '');
            }
        }
        return vGenDataEdit;
    }
);