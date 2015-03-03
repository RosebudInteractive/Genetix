/**
 * User: kiknadze
 * Date: 03.03.2015
 * Time: 11:00
 */

define(
    'gPopup',
    ['/scripts/lib/uccello/uses/template.js', 'text!./widgets/templates/popup.html'],
    function(template, tpl) {
        var templates = template.parseTemplate(tpl);

        $.widget( "custom.genetixPopup", {
            options: {
                title: null,
                leftIcons: false,
                rightIcons: true,
                bigArrowInterval: true,
                buttonControl: null,
                offsetX: 0,
                offsetY: 0,
                menuItems: {}
            },

            _create: function() {
                this._clearContent();
                this._renderTitle();


                if (this.options.bigArrowInterval)
                    this.element.addClass(" big-interval");
                var that = this;
                this.element.mouseleave(function () {
                    that.hide();
                });
            },

            _clearContent: function() {
                this.element.addClass("dropdown2-b is-disableselect");
                this.element.removeAttr('style');
                this.element.css({"display": "none"});
                this.element.empty();
                this.element.append($(templates["arrow"]));
            },

            _renderTitle: function() {
                if(!this.options.title) {
                    this.element.remove(".dropdown-menu-item2-b.is-title");
                    return;
                }

                var titleEl = this.element.children(".dropdown-menu-item2-b.is-title");
                if (titleEl.length == 0 && this.options.title) {
                    titleEl = $(templates["title"]);
                    this.element.prepend(titleEl);
                }
                titleEl.text(this.options.title)
            },

            _renderContent: function() {
                var popupData = this.options.menuItems;

                for (i = 0; i < popupData.length; i++) {
                    var data = popupData[i];
                    var itemEl = $("#" + data.id);
                    if (itemEl.length == 0) {
                        var curTemplate = templates["menuItem"];
                        curTemplate = curTemplate.replace("###RIGHT_ICON_REF###", data.rightIcon);
                        itemEl = $(curTemplate);
                        itemEl.attr("id", data.id);
                        this.element.append(itemEl);
                        itemEl.children(".dropdown-menu-item-wrapper").click(data, function (event) {
                            that._trigger("click", null, event.data);
                            that.hide();
                        });
                    }
                    itemEl.find(".dropdown-menu-item-wrapper .text-bl").text(data.title);
                    itemEl.data("itemData", data);
                    itemEl.children(".content-bl").hide();
                    if (!(data.subTree) || data.subTree.length == 0)
                        itemEl.children(".arrow-be").hide();
                    else
                        itemEl.children(".arrow-be").show();
                    var that = this;
                }
            },


            show: function(popupData) {
                // Если не передано, то пытаемся использовать старые данные
                // иначе запоминаем новые и используем их
                if (popupData)
                    this.options.menuItems = popupData;

                this._renderContent();

                // уберем все стили, относящиеся к позиции выпирающего уголка
                this.element.removeClass("is-right is-top is-left is-bottom-right is-bottom-left is-top-right is-top-left");

                // TODO добавить интелекта к позиционированию
                this.element.addClass("is-right is-top ");
                var cRight = this.options.buttonControl.offset().left +  this.options.buttonControl.width();
                var cBott = this.options.buttonControl.offset().top +  this.options.buttonControl.innerHeight();

                this.element.css({
                    right: $('body').innerWidth() - cRight + this.options.offsetX,
                    top: cBott + this.options.offsetY
                });

                if (this.options.bigArrowInterval)
                    this.element.addClass("big-interval");
                else
                    this.element.removeClass("big-interval");

                if (this.options.menuItems.length != 0)
                    this.element.css({ display: "block"})

            },

            hide: function() {
                this.element.css({ display: "none"});
            }

        });


    });