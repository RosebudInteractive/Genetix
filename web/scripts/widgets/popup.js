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
                titleEl.find(".text-bl").text(this.options.title)
            },

            _renderContent: function() {
                var popupData = this.options.menuItems;
                var that = this;

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
                        itemEl.children(".dropdown-menu-item-wrapper").find(".right-icon").click(data, function (event) {
                            $(this).addClass("is-pressed");
                            that._trigger("righticonclick", null, {button: $(this), data: event.data});
                            return false;
                        });

                    }
                    itemEl.find(".dropdown-menu-item-wrapper .text-bl").text(data.title);
                    itemEl.data("itemData", data);
                    var subContent = itemEl.children(".content-bl");
                    itemEl.children(".arrow-be").click(subContent, function(event) {
                        var opened = $(this).parent().hasClass("is-open");
                        if (opened) {
                            event.data.hide();
                            $(this).parent().removeClass("is-open");
                        } else {
                            event.data.show();
                            $(this).parent().addClass("is-open");
                        }
                    });
                    subContent.hide();
                    if (!(data.subTree) || data.subTree.length == 0) {
                        itemEl.children(".arrow-be").hide();
                        itemEl.removeClass("is-header");
                    }
                    else {
                        itemEl.children(".arrow-be").show();
                        itemEl.addClass("is-header");

                        for (var j = 0; j < data.subTree.length; j++) {
                            var subItemData = data.subTree[j];
                            var subItemEl = $("#" + subItemData.id);
                            if (subItemEl.length == 0) {
                                var curTemplate2 = templates["menuItem"];
                                curTemplate2 = curTemplate2.replace("###RIGHT_ICON_REF###", subItemData.rightIcon);
                                subItemEl = $(curTemplate);
                                subItemEl.attr("id", subItemData.id);
                                subContent.append(subItemEl);
                                subItemEl.children(".dropdown-menu-item-wrapper").click(subItemData, function (event) {
                                    that._trigger("click", null, event.data);
                                    that.hide();
                                });
                                subItemEl.children(".dropdown-menu-item-wrapper").find(".right-icon").click(subItemData, function (event) {
                                    $(this).addClass("is-pressed");
                                    that._trigger("righticonclick", null, {button: $(this), data: event.data});
                                    return false;
                                });

                            }
                            subItemEl.find(".dropdown-menu-item-wrapper .text-bl").text(subItemData.title);
                            subItemEl.data("itemData", subItemData);
                            var subContent2 = itemEl.children(".content-bl");
                            subContent2.hide();
                            subItemEl.children(".arrow-be").hide();
                            subItemEl.removeClass("is-header");
                        }
                    }
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

                this.element.children(".dropdown-menu-item2-b").find(".right-icon").removeClass("is-pressed");
                var cRight = 0;
                var cBott = 0;
                var parentIsBody = this.element.parent().is('body');
                if (parentIsBody) {
                    cRight = this.options.buttonControl.offset().left +  this.options.buttonControl.width();
                    cBott = this.options.buttonControl.offset().top +  this.options.buttonControl.innerHeight();
                } else {
                    cRight = this.options.buttonControl.offset().left + this.options.buttonControl.width();
                    cBott = this.options.buttonControl.position().top +  this.options.buttonControl.innerHeight();
                }

                this.element.css({
                    right: $('body').innerWidth() - cRight + this.options.offsetX,
                    top: cBott + this.options.offsetY
                });

                if (this.options.bigArrowInterval)
                    this.element.addClass("big-interval");
                else
                    this.element.removeClass("big-interval");

                if (this.options.menuItems.length != 0) {
                    this.element.find(".dropdown2-b").hide();
                    this.element.css({ display: "block"})
                }

            },

            hide: function() {
                this.element.css({ display: "none"});
            }

        });


    });