/*
    自定义工具
    I am liangzhenyu
    2018-07-05
*/

/*
插件-弹框提示-v1.3.5(可以展示大内容，也可以是确认框)
使用方法说明：
    1.此插件基于jQuery编写，使用时需要先导入jQuery
    2.获取对象
        var myPop = $.initPopop(cfg);
        cfg:配置文件如果不设置将使用默认设置
    3.设置配置
        myPop.setStyle(cfg, status);
        cfg:配置文件如果不设置将使用默认设置
        status:配置文件的状态（false:在原配置上追加，重复的将覆盖；true:全新覆盖，未配置的将使用默认值），默认值为false
    4.显示提示框
        myPop.showPopup(content,title);
        content:任意内容（可选），若无则使用 cfg 配置中的内容设置，若cfg配置中也没有设置将为空白，强制水平和垂直居中
        title:标题(可选)，若无则使用 cfg 配置中的标题设置，若cfg配置中也没有设置将使用默认值：“消息”
    5.关闭提示框
        myPop.closePopup();
    6.添加框低按钮
        myPop.addButton(btnName,callback); //需要注意的是添加的按键过多（弹框的宽不足容纳所有按键）时，将自动适应设置弹框的宽来容纳所有按键
        btnName:按键的名称,注：添加的名称含有“关闭，取消”等的将带有点击关闭弹框的事件，
        callback:回调函数(按键点击事件在这里，就是说每添加一个按键都自动绑定了一个点击事件)，函数中的 this->当前弹框对象
    7.移除框低按钮
        myPop.removeButton(nameOrIndex);
        nameOrIndex:按键的名称或者按键所在的下标
    8.获取本弹框状态
        myPop.getStatus();
        返回值:{
            status: true/false，弹框的状态，true为开启状态，false为关闭状态，
            rect:{top,left,bottom,right,width,height}，弹框绝对位置相关值,
            version:版本
        }
    9.弹框开启关闭回调事件
        myPop.on(type,callback);
        type:"afteropen","beforeopen","afterclose"和"beforeclose";按照jquery的on方法使用习惯配置便可
        callback:回调函数
 参数说明：
    cfg:{
        content:任意内容,可以是节点，可以是ID，可以是类。使用建议：弹框作为模态框时建议在这里配置选择器，作为提示框时这里不要配置，直接在showPopup方法配置；
            简而言之就是不常改变的内容（一般都是配置了样式的节点）放在这，经常改变的内容（一般都是一句疑问句）就放在showPopup方法中。
        title:弹框标题,
        width:弹框的长,
        height:弹框的高,
        zIndex:弹框层级，默认：99999，可以设置为“auto”，表示取当前页面最高层级
        clickNavToTop:是否点击导航栏置顶弹框，默认：false，
        vertical:内容是否垂直居中，默认：true,
        border:弹框边框设置,
        borderRadius:边框的圆角大小,
        themeColor:弹框的主题颜色,
        animation:弹框弹出风格动画，1、弹出；2、收缩；3、旋转；4、下滑；5、上滑；6、抖动
        showShadow:是否显示边框阴影,默认为true,
        shadowSize:阴影的长度，如果 showShadow为false则该值无效，默认长度为12px，
        showIcon:是否显示左上图标,默认:true,
        icon:图标的图片（可以是路径；也可以是图片base64编码；也可以直接是字符，比如：'!','?'）,
        allowedFullscreen:是否允许全屏，即是否添加全屏按键，默认值：false,
        allowedKeyboard:是否允许键盘操作，目前暂时只要Esc按键点击退出事件，默认允许，true
        buttonAlign:按键对齐方式，left,center和right三种方式,
        showBackground:是否显示背景,默认：false,
        clickBgToClose:是否点击背景关闭弹框，默认：false，
        allowedMove:是否允许移动,默认：false,
        targetSelector:参照目标，用于弹框设置位置的相对节点，默认：'window'，相对于屏幕设置位置（这样能保证绝对定位），强调：这个'window'不是选择器，这个只是标识绝对定位的意思；
            其他比如：body，div，#myId，.myClass等节点或选择器，这些是用于设置相对位置（必须是真实的节点或选择器）
        insideOrFollow:弹框类型设置，“inside”和“follow”两种类型(内嵌和跟随)，默认“inside”，内嵌或跟随(targetSelector)显示,
        relativePosition:弹框相对目标选择器的位置，
            当'insideOrFollow' 值为“inside”时默认中间：center，可选值：top，bottom,left，right及组合方位词，也可以是"x,y"的绝对定位；
            当'insideOrFollow' 值为“follow”时默认右下：right bottom，可选值：top，bottom,left，right及组合方位词
        relativeOffset: 弹框与目标相对偏差位置（就是弹框和targetSelector的距离有多远），默认偏移10px,
        buttons:[{
            name:"确定", //按键名称
            click:callback //按键事件
        }...],除了上面的 addButton(name,callback) 方法添加按键外，也可以在参数里面使用，一样效果
    }

  另：作者我没有按照 打开弹框时便插入节点，关闭弹框时移除节点 的流程。是因为弹框的按钮以及弹框内容部分可能开发者需要对里面的控件添加事件，如果移除节点将导致事件失效。
    但为了保持美观，编写一个弹框使用一个大 DIV 包括
 */
;(function ($, win, document) {
    "use strict";
    $.extend({
        initPopup: function (configure) {
            /**
             * 判断是否是IE家族的浏览器
             * @returns {*}
             */
            var isIE = function () {
                var userAgent = navigator.userAgent;
                var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器
                if (isIE) {
                    new RegExp("MSIE (\\d+\\.\\d+);").test(userAgent);
                    var ieV = parseInt(RegExp["$1"]);
                    if (ieV >= 6) return ieV;
                    return 1;
                }
                var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器
                var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
                if (isEdge) return "edge";
                if (isIE11) return 11;
                return false;
            };
            /**
             * 判断是否是火狐浏览器
             * @returns {boolean}
             */
            var isFire = function () {
                return navigator.userAgent.indexOf("Firefox") > -1;
            };
            /**
             * 弹框的主体入口方法
             * @param configure 配置
             */
            var lzyPopup = function (configure) {
                var self = this;
                self.version = "v2.5";
                self._$icon = $("<div class='lzy_nav_icon'>!</div>");
                self._$title = $("<div class='lzy_nav_title'>消息</div>");
                self._$close = $("<div class='lzy_nav_close'><svg><rect width='18' height='18'/><line x1='4' y1='4' x2='14' y2='14'/><line x1='4' y1='14' x2='14' y2='4'/></svg></div>");
                self._$full = $("<div class='lzy_nav_full'></div>");
                self._$nav = $("<div class='lzy_popup_nav'></div>").append(self._$icon, self._$title, self._$close, self._$full);
                self._$content = $("<div class='lzy_popup_cont lzy_popup_v_cont'></div>");
                self._$footer = $("<div class='lzy_popup_footer'></div>");
                self._$popup = $("<div class='lzy_custom_popup'></div>").append(self._$nav, self._$content, self._$footer);
                self._$bg = $("<div class='lzy_custom_bg'></div>");
                self._cfg = null;
                self._global = {
                    once: 1,
                    move: {},
                    rect: null,
                    className: {
                        fb: "lzy_footer_btn",
                        _fb: ".lzy_footer_btn",
                        fbc: "lzy_footer_btn_close",
                        _fbc: ".lzy_footer_btn_close",
                        pnm: "lzy_popup_nav_move",
                        cnf: "lzy_custom_none_footer",
                        ps: "lzy_popup_show_",
                        pc: "lzy_popup_close_",
                        pvc: "lzy_popup_v_cont"
                    },
                    fullTag: {full: false},
                    fullBtn: {
                        zoomin: "<svg><rect x='4' y='4' width='10' height='10' style='stroke: %color' /></svg>",
                        zoomout: "<svg><rect x='4' y='6' width='8' height='8' style='stroke: %color'/><line x1='5' y1='4' x2='14' y2='4' style='stroke: %color'/><line x1='14' y1='3' x2='14' y2='13' style='stroke: %color'/></svg>"
                    }
                };
                self._events = {
                    beforeOpen: [],
                    afterOpen: [],
                    beforeClose: [],
                    afterClose: []
                };
                self.setStyle(configure, true);

                self.timeout = null;
                $(win).resize(function () {
                    clearTimeout(self.timeout);
                    self.timeout = setTimeout(function () {
                        self.setStyle(null, false);
                        if (self._$popup.is(":visible")) {
                            self.showPopup();
                        }
                    }, 300);
                });
            };
            lzyPopup.prototype = {
                /**
                 * 用来给弹框判断是否使用屏幕作参照对象
                 * @param ele 节点
                 * @returns {boolean}
                 */
                _referScreen: function (ele) {
                    return !ele || ele === "window" || ele === "document" || ele === "screen" || ele === win || ele === document;
                },
                /**
                 * 获取body下的所有子节点中最大的zIndex值
                 */
                _maxZIndex: function () {
                    var arr = [], $objs = $("body>*");
                    for (var i = 0; i < $objs.length; i++) {
                        var z = $($objs[i]).css("zIndex");
                        arr.push(isNaN(z) ? 0 : z);
                    }
                    var maxZIndex = arr.length ? Math.max.apply(null, arr) : 0;
                    return maxZIndex > 999999 ? maxZIndex + 1 : 1000000;
                },
                /**
                 * 获取2倍边框宽
                 * @param $obj 对象
                 * @returns {number} 框的2倍大小
                 */
                _douBW: function ($obj) {
                    return $obj.css("border-left-width").replace("px", "") * 2;
                },
                /**
                 * 该方法的作用主要是避免传入参数为 0  时的判断却为false
                 * @private
                 */
                _notEmpty: function (val) {
                    return val === null || typeof(val) === "undefined";
                },
                /**
                 * 配置弹框的样式
                 * @param configure 配置参数
                 * @param status 状态，true:全新参数，false:追加参数
                 * @returns {*} 弹框对象
                 */
                setStyle: function (configure, status) {
                    var self = this,
                        /**
                         * 设置配置标记
                         * @param iof -> insideOrFollow 内嵌或跟随
                         * @param pos 位置：1，2，4，8，16，代表 中，上，下，左，右
                         * @returns {*} 标识码或绝对定位坐标
                         */
                        setPosTag = function (iof, pos) {
                            if (iof && iof === 'follow' && !pos) return 20;
                            if (!pos) return 1;
                            if (/[0-9]/.test(pos)) {
                                //方位中包含数字，可能是方位code，也可能是觉得定位坐标
                                pos = pos.toString().replace(/px/g, "").replace(/\s+/g, "");
                                if ("1,2,4,8,16,18,10,12,20".indexOf(pos) >= 0) return pos;
                                return pos + ",";
                            }
                            pos = pos.toLowerCase();
                            if (pos.indexOf("center") >= 0) return 1;
                            var tag = 0;
                            if (pos.indexOf("top") >= 0) tag += 2;
                            if (pos.indexOf("bottom") >= 0) tag += 4;
                            if (pos.indexOf("left") >= 0) tag += 8;
                            if (pos.indexOf("right") >= 0) tag += 16;
                            return tag;
                        };

                    configure = configure || {};
                    if (status) {
                        //全新插入参数，未配置的使用默认参
                        self._cfg = {
                            content: configure.content || null,
                            title: configure.title || null,
                            width: configure.width || 350,
                            height: configure.height || 200,
                            zIndex: configure.zIndex || 99999,
                            clickNavToTop: configure.clickNavToTop,
                            border: configure.border || '1px solid black',
                            borderRadius: self._notEmpty(configure.borderRadius) ? 5 : parseFloat(configure.borderRadius),
                            themeColor: configure.themeColor || "#358aff",
                            animation: configure.animation || 1,
                            showIcon: self._notEmpty(configure.showIcon) ? true : configure.showIcon,
                            vertical: self._notEmpty(configure.vertical) ? true : configure.vertical,
                            icon: configure.icon || null,
                            allowedFullscreen: configure.allowedFullscreen,
                            allowedKeyboard: self._notEmpty(configure.allowedKeyboard) ? true : configure.allowedKeyboard,
                            buttonAlign: configure.buttonAlign || 'right',
                            showShadow: self._notEmpty(configure.showShadow) ? true : configure.showShadow,
                            shadowSize: self._notEmpty(configure.shadowSize) ? 12 : configure.shadowSize,
                            showBackground: configure.showBackground,
                            clickBgToClose: configure.clickBgToClose,
                            allowedMove: configure.allowedMove,
                            targetSelector: configure.targetSelector || 'window',
                            insideOrFollow: (configure.insideOrFollow || 'inside').toLowerCase(),
                            relativePosition: setPosTag(self.insideOrFollow, configure.relativePosition),
                            relativeOffset: self._notEmpty(configure.relativeOffset) ? 10 : configure.relativeOffset,
                            buttons: configure.buttons || null
                        };
                    } else {
                        //追加插入参数，未配置的使用默认参
                        self._cfg = {
                            content: configure.content || self._cfg.content,
                            title: configure.title || self._cfg.title,
                            width: configure.width || self._cfg.width,
                            height: configure.height || self._cfg.height,
                            zIndex: configure.zIndex || self._cfg.zIndex,
                            clickNavToTop: !self._notEmpty(configure.clickNavToTop) ? configure.clickNavToTop : self._cfg.clickNavToTop,
                            border: configure.border || self._cfg.border,
                            borderRadius: !self._notEmpty(configure.borderRadius) ? parseFloat(configure.borderRadius) : self._cfg.borderRadius,
                            themeColor: configure.themeColor || self._cfg.themeColor,
                            animation: configure.animation || self._cfg.animation,
                            showIcon: !self._notEmpty(configure.showIcon) ? configure.showIcon : self._cfg.showIcon,
                            vertical: !self._notEmpty(configure.vertical) ? configure.vertical : self._cfg.vertical,
                            icon: configure.icon || self._cfg.icon,
                            allowedFullscreen: !self._notEmpty(configure.allowedFullscreen) ? configure.allowedFullscreen : self._cfg.allowedFullscreen,
                            allowedKeyboard: !self._notEmpty(configure.allowedKeyboard) ? configure.allowedKeyboard : self._cfg.allowedKeyboard,
                            buttonAlign: configure.buttonAlign || self._cfg.buttonAlign,
                            showShadow: !self._notEmpty(configure.showShadow) ? configure.showShadow : self._cfg.showShadow,
                            shadowSize: !self._notEmpty(configure.shadowSize) ? configure.shadowSize : self._cfg.shadowSize,
                            showBackground: !self._notEmpty(configure.showBackground) ? configure.showBackground : self._cfg.showBackground,
                            clickBgToClose: !self._notEmpty(configure.clickBgToClose) ? configure.clickBgToClose : self._cfg.clickBgToClose,
                            allowedMove: !self._notEmpty(configure.allowedMove) ? configure.allowedMove : self._cfg.allowedMove,
                            targetSelector: configure.targetSelector || self._cfg.targetSelector,
                            insideOrFollow: (configure.insideOrFollow || self._cfg.insideOrFollow).toLowerCase(),
                            relativePosition: configure.relativePosition ? setPosTag(self.insideOrFollow, configure.relativePosition) : self._cfg.relativePosition,
                            relativeOffset: !self._notEmpty(configure.relativeOffset) ? configure.relativeOffset : self._cfg.relativeOffset,
                            buttons: configure.buttons || self._cfg.buttons
                        };
                    }

                    var $popup = self._$popup,
                        $footer = self._$footer,
                        $content = self._$content,
                        cfg = self._cfg,
                        once = self._global.once,
                        className = self._global.className,
                        fullBtn = self._global.fullBtn;


                    //配置样式
                    $popup.css({
                        'width': cfg.width,
                        'height': cfg.height,
                        'border': cfg.border,
                        'border-radius': cfg.borderRadius,
                        'border-color': cfg.themeColor,
                        'box-shadow': "0 0 " + (cfg.showShadow ? cfg.shadowSize.toString().replace("px", "") + "px " + cfg.themeColor : "0")//设置边框阴影
                    });
                    self._$nav.css({
                        'border-bottom-color': cfg.themeColor,
                        'background-color': cfg.themeColor
                    }).off("click");
                    if (cfg.clickNavToTop) {
                        self._$nav.on("click", function (e) {
                            e.stopPropagation();
                            if (cfg.showBackground) self._$bg.css("z-index", self._maxZIndex());
                            else $popup.css("z-index", self._maxZIndex())
                        });
                    }

                    //是否允许拖动
                    if (cfg.allowedMove) {
                        self._$nav.addClass(className.pnm)
                            .off("mousedown")
                            .on("mousedown", function (e) {
                                self._global.move.flag = true;
                                self._global.move.x = e.pageX - $popup.offset().left;
                                self._global.move.y = e.pageY - $popup.offset().top;
                            });
                    } else {
                        self._$nav.removeClass(className.pnm).off("mousedown");
                    }
                    if (once === 1) {
                        //拖动事件
                        $(document).on("mousemove", function (e) {
                            if (self._global.move.flag) {
                                $popup.css({
                                    'left': e.pageX - self._global.move.x,
                                    'top': e.pageY - self._global.move.y
                                });
                            }
                        }).on("mouseup", function () {
                            delete self._global.move.flag;
                        });
                    }

                    self._$icon.css({'border-color': '#fff', 'color': '#fff'});
                    //是否显示图标
                    if (cfg.showIcon) {
                        var sIcon = cfg.icon;
                        if (!self._notEmpty(sIcon)) {
                            //更换图标
                            if (sIcon.indexOf("base64") >= 0
                                || "gif,jpg,jpeg,png,gif,jpg,png".indexOf(sIcon.toString().substr(sIcon.lastIndexOf(".") + 1)) >= 0) {
                                self._$icon.css({
                                    'background-image': 'url(' + sIcon + ')',
                                    'border-radius': 0,
                                    'border': 'none'
                                }).empty().show();
                            } else {
                                self._$icon.show().html(sIcon);
                            }
                        }
                    } else {
                        self._$icon.hide();
                    }
                    self._$title.css({'color': '#fff'});
                    if (isIE()) self._$title.css('line-height', "33px");//适配IE浏览器样式
                    //是否允许放大全屏
                    if (cfg.allowedFullscreen) {
                        self._$full.show().html($(fullBtn.zoomin.replace(/%color/g, "#fff")))
                            .off("click")
                            .on("click", function (e) {
                                e.stopPropagation();
                                $(this).css("background-color", "rgba(0,0,0,0)");
                                if ($(this).find("line").length === 0) {
                                    $(this).html($(fullBtn.zoomout.replace(/%color/g, "#fff")));
                                    self._global.fullTag = {
                                        full: true,
                                        top: $popup.css("top"),
                                        left: $popup.css("left"),
                                        width: $popup.css("width"),
                                        height: $popup.css("height")
                                    };
                                    //放大动画
                                    $popup.animate({
                                        'top': 1,
                                        'left': 1,
                                        'width': win.innerWidth - self._douBW($popup) - 2,
                                        'height': win.innerHeight - self._douBW($popup) - 2
                                    }, "fast");
                                } else {
                                    $(this).html($(fullBtn.zoomin.replace(/%color/g, "#fff")));
                                    self._global.fullTag.full = false;
                                    var ft = self._global.fullTag;
                                    //缩回动画
                                    $popup.animate({
                                        'top': ft.top,
                                        'left': ft.left,
                                        'width': ft.width,
                                        'height': ft.height
                                    }, "fast");
                                }
                            });
                    } else {
                        self._$full.hide();
                    }
                    self._$close.off("click").on("click", function () {
                        self.closePopup();
                    }).find("line").css({'stroke': '#fff'});
                    if (cfg.vertical) {
                        $content.addClass(className.pvc);
                    } else {
                        $content.removeClass(className.pvc);
                    }
                    $footer.css({'text-align': configure.buttonAlign});
                    //设置弹框的位置参照值
                    if (cfg.insideOrFollow === 'follow') {
                        //跟随状态
                        if (self._referScreen(cfg.targetSelector)) {
                            console.error("无法获取参照节点(" + cfg.targetSelector + ")的位置，请检查是否使用屏幕作参照对象(targetSelector='window')! \n");
                            return false;
                        }
                        self._global.rect = $(cfg.targetSelector).get(0).getBoundingClientRect();
                    } else {
                        if (self._referScreen(cfg.targetSelector)) {
                            //绝对定位情况
                            self._global.rect = {
                                width: win.innerWidth,
                                height: win.innerHeight,
                                top: 0,
                                right: 0,
                                bottom: 0,
                                left: 0
                            };
                        } else {
                            //相对定位情况
                            self._global.rect = $(cfg.targetSelector).get(0).getBoundingClientRect();
                        }
                    }


                    var rect = self._global.rect;
                    //背景是否显示
                    if (cfg.showBackground) {
                        //把弹框放到背景节点里
                        self._$bg.appendTo("body").append($popup).css({
                            'width': rect.width,
                            'height': rect.height,
                            'top': rect.top,
                            'left': rect.left
                        }).off("click").on("click", function (e) {
                            e.stopPropagation();
                            if (cfg.clickBgToClose) {
                                self.closePopup();
                            } else {
                                $popup.addClass(className.ps + "6").removeClass(className.ps + cfg.animation);
                                setTimeout(function () {
                                    $popup.removeClass(className.ps + "6");
                                }, 300);
                            }
                        });
                        $popup.off("click").on("click", function (e) {
                            e.stopPropagation();
                            return false;
                        });
                    } else {
                        $popup.appendTo("body");
                    }
                    if (typeof(cfg.width) === "string" && cfg.width.indexOf("%") >= 0) {
                        var pw = cfg.width.replace("%", "") / 100;
                        if (cfg.showBackground) {
                            //带有背景，背景节点就是弹框的父节点
                            $popup.css('width', rect.width * pw);
                        } else {
                            //没有有背景，body节点就是弹框的父节点
                            $popup.css('width', $("body").width() * pw);
                        }
                    }
                    if (typeof(cfg.height) === "string" && cfg.height.indexOf("%") >= 0) {
                        var ph = cfg.height.replace("%", "") / 100;
                        if (cfg.showBackground) {
                            $popup.css('height', rect.height * ph);
                        } else {
                            $popup.css('height', $("body").height() * ph);
                        }
                    }

                    if (once === 1) {
                        //是否允许键盘事件
                        $(document).on("keyup", function (event) {
                            var e = event || win.event;
                            if (e && e.keyCode === 27) {
                                if (cfg.allowedKeyboard) self.closePopup();
                            }
                        });

                        //添加按键
                        if (cfg.buttons && cfg.buttons instanceof Array && cfg.buttons.length) {
                            for (var i = 0; i < cfg.buttons.length; i++) {
                                self.addButton(cfg.buttons[i].name, cfg.buttons[i].click);
                            }
                        }
                    }

                    //配置标题
                    if (!self._notEmpty(cfg.title)) self._$title.html(cfg.title);
                    //配置内容
                    if (!self._notEmpty(cfg.content)) {
                        if ($(cfg.content).length > 0) {
                            if (once === 1) {
                                $content.html($(cfg.content));
                            }
                        } else {
                            $content.html("<span>" + cfg.content + "</span>");
                        }
                    }


                    self._global.once++;
                    return self;
                },
                /**
                 * 打开弹框
                 * @param content 内容
                 * @param title 标题
                 * @returns {*} 弹框对象
                 */
                showPopup: function (content, title) {
                    var self = this,
                        $popup = self._$popup,
                        $footer = self._$footer,
                        $content = self._$content,
                        cfg = self._cfg,
                        events = self._events,
                        className = self._global.className;

                    var open = true;
                    for (var i = 0; i < events.beforeOpen.length; i++) {
                        try {
                            var callid = events.beforeOpen[i].call(this);
                            if (false === callid) open = false;
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    if (!open) {
                        console.log("已经截止弹框开启");
                        return false;
                    }

                    if (self._global.fullTag.full) {
                        //全屏状态设置
                        $popup.css({
                            'top': 1,
                            'left': 1,
                            "margin-top": 0,
                            "margin-left": 0,
                            'width': win.innerWidth - self._douBW($popup) - 2,
                            'height': win.innerHeight - self._douBW($popup) - 2
                        });
                    } else {
                        //获取目标选择器的绝对位置
                        var rect = self._global.rect, pos = cfg.relativePosition;
                        var halfW = $popup.width() / 2;
                        var halfH = $popup.height() / 2;
                        var oft = cfg.relativeOffset;
                        //设置位置
                        var setCss = function (val1, val2) {
                            $popup.css({'left': parseFloat(val1) - halfW, 'top': parseFloat(val2) - halfH});
                        };
                        if (cfg.insideOrFollow === 'follow') {
                            //跟随状态
                            switch (pos) {
                                case 2:
                                    setCss(rect.left + halfW, rect.top - halfH - oft);
                                    break;
                                case 4:
                                    setCss(rect.left + halfW, rect.bottom + halfH + oft);
                                    break;
                                case 8:
                                    setCss(rect.left - halfW - oft, rect.top + halfH);
                                    break;
                                case 16:
                                    setCss(rect.right + halfW + oft, rect.top + halfH);
                                    break;
                                case 18:
                                    setCss(rect.right + halfW + oft, rect.top - halfH - oft);
                                    break;
                                case 10:
                                    setCss(rect.left - halfW - oft, rect.top - halfH - oft);
                                    break;
                                case 12:
                                    setCss(rect.left - halfW - oft, rect.bottom + halfH + oft);
                                    break;
                                case 20:
                                    setCss(rect.right + halfW + oft, rect.bottom + halfH + oft);
                                    break;
                            }
                        } else {
                            //内嵌状态
                            if (pos.toString().indexOf(",") < 0) {
                                // 相对定位或绝对定位情况
                                switch (pos) {
                                    case 1:
                                        setCss(rect.left + rect.width / 2, rect.top + rect.height / 2);
                                        break;
                                    case 2:
                                        setCss(rect.left + rect.width / 2, rect.top + halfH + oft);
                                        break;
                                    case 4:
                                        setCss(rect.left + rect.width / 2, rect.top + rect.height - halfH - oft);
                                        break;
                                    case 8:
                                        setCss(rect.left + halfW + oft, rect.top + rect.height / 2);
                                        break;
                                    case 16:
                                        setCss(rect.left + rect.width - halfW - oft, rect.top + rect.height / 2);
                                        break;
                                    case 18:
                                        setCss(rect.left + rect.width - halfW - oft, rect.top + halfH + oft);
                                        break;
                                    case 10:
                                        setCss(rect.left + halfW + oft, rect.top + halfH + oft);
                                        break;
                                    case 12:
                                        setCss(rect.left + halfW + oft, rect.top + rect.height - halfH - oft);
                                        break;
                                    case 20:
                                        setCss(rect.left + rect.width - halfW - oft, rect.top + rect.height - halfH - oft);
                                        break;
                                }
                            } else {
                                // x,y 坐标位置情况
                                var arrpos = pos.split(",");
                                setCss(parseFloat(arrpos[0]) + halfW, parseFloat(arrpos[1] || 0) + halfH);
                            }
                        }
                    }
                    //配置各项底部按键等的样式(因为添加按键是不定性的，后滞的，无法预先在初始化时配置)
                    $popup.removeClass(className.cnf);
                    if ($footer.find(className._fb).length === 0) $popup.addClass(className.cnf);
                    $footer.css("text-align", cfg.buttonAlign)
                        .find(className._fb)
                        .css({
                            'border-color': cfg.themeColor,
                            'background-color': cfg.themeColor,
                            'border-radius': cfg.borderRadius
                        })
                        .parent().find(className._fbc)
                        .css({
                            'color': cfg.themeColor,
                            'background-color': 'white'
                        });
                    if (isFire()) $footer.find(className._fb).css({'height': '23px'});
                    if (isIE()) $footer.find(className._fb).css({'line-height': '24px'});

                    //配置标题
                    if (!self._notEmpty(title)) self._$title.html(title);
                    //配置内容
                    if (!self._notEmpty(content)) {
                        if ($(content).length > 0) {
                            //如果是 dom 节点就直接添加
                            $content.html($(content));
                        } else {
                            //如果是字符串便包括在 span 节点里（适配ie9）
                            $content.html("<span>" + content + "</span>");
                        }
                    }
                    for (i = 0; i < 10; i++) $popup.removeClass(className.pc + i);
                    if (cfg.showBackground) {
                        self._$bg.show().css("z-index", "auto" === cfg.zIndex ? self._maxZIndex() : cfg.zIndex);
                    }

                    $popup.css("z-index", "auto" === cfg.zIndex ? self._maxZIndex() : self._cfg.zIndex)
                        .show().addClass(className.ps + cfg.animation);//显示弹框，插入弹出动画样式
                    setTimeout(function () {
                        $popup.show();
                        for (var i = 0; i < events.afterOpen.length; i++) {
                            try {
                                events.afterOpen[i].call(self);
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }, 300);
                    return self;
                },
                /**
                 * 关闭弹框
                 * @returns {*} 弹框对象
                 */
                closePopup: function () {
                    var self = this,
                        $popup = self._$popup,
                        cfg = self._cfg,
                        events = self._events,
                        className = self._global.className;

                    var close = true;
                    for (var i = 0; i < events.beforeClose.length; i++) {
                        try {
                            var callid = events.beforeClose[i].call(self);
                            if (false === callid) close = false;
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    if (!close) {
                        console.log("已经截止弹框关闭");
                        return false;
                    }

                    $popup.removeClass(className.ps + cfg.animation).addClass(className.pc + cfg.animation);//插入弹回动画样式
                    setTimeout(function () {
                        $popup.hide();//隐藏
                        self._$bg.hide();//隐藏
                        for (var i = 0; i < events.afterClose.length; i++) {
                            try {
                                //关闭按键回调方法执行
                                events.afterClose[i].call(self);
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }, 280);
                    return self;
                },
                /**
                 *添加按键
                 * @param btnName 按键名称
                 * @param callback 点击事件回调方法
                 * @returns {lzyPopup} 弹框对象
                 */
                addButton: function (btnName, callback) {
                    var self = this,
                        $footer = self._$footer,
                        className = self._global.className;
                    var $curBtn = $("<button class='" + className.fb + "'>" + btnName + "</button>")
                        .appendTo($footer)
                        .on("click", function (e) {
                            if (callback && typeof(callback) === "function") callback.call(self, e);
                        });
                    if (btnName && (btnName.indexOf("关") >= 0 || btnName.indexOf("消") >= 0)) $curBtn.addClass(className.fbc);
                    var size = 0, $btns = $footer.find(className._fb);
                    var getMargin = function ($obj, margin) {
                        return parseFloat($obj.css(margin).replace("px", ""));
                    };
                    for (var i = 0; i < $btns.length; i++) {
                        var tempSize = $btns.eq(i).text().length <= 2 ? 38 : $btns.eq(i).text().length * 16;
                        size += tempSize + 22 + getMargin($btns.eq(i), "margin-right") + getMargin($btns.eq(i), "margin-left");
                    }
                    if (size > self._$popup.width()) self.setStyle({width: size + 20});//添加的按键过多，导致总长超过弹框的宽时便设置弹框的宽足与容纳按键
                    return self;
                },
                /**
                 * 移除按键
                 * @param nameOrIndex 按键名称或按键所在下标
                 */
                removeButton: function (nameOrIndex) {
                    var self = this, $footer = self._$footer,
                        className = self._global.className;
                    if (isNaN(nameOrIndex)) {
                        //非数字即按名称判断按键
                        var $btns = $footer.find(className._fb);
                        for (var i = $btns.length - 1; i >= 0; i--) {
                            if ($btns.eq(i).text() === nameOrIndex) $btns.eq(i).remove();
                        }
                    } else {
                        $footer.find(className._fb).eq(nameOrIndex).remove();
                    }
                },
                /**
                 * 获取当前弹框的状态
                 * @returns {{version: string, status: *, rect: ClientRect}} 版本，是否打开状态，位置
                 */
                getStatus: function () {
                    var self = this;
                    return {
                        version: self.version,
                        status: self._$popup.is(":visible"),
                        rect: self._$popup.get(0).getBoundingClientRect()
                    };
                },
                /**
                 * 弹框开启关闭事件回调
                 * @param type 类型，afteropen，beforeopen(或open)，afterclose，beforeclose(或close)
                 * @param callback 回调方法
                 * @returns {lzyPopup} 弹框对象
                 */
                on: function (type, callback) {
                    var self = this, events = self._events;
                    var attT = type.split(" ");
                    if (attT.length) {
                        for (var i = 0; i < attT.length; i++) {
                            switch (attT[i].toLowerCase()) {
                                case "afteropen":
                                    events.beforeOpen.push(callback);
                                    break;
                                case "open":
                                case "beforeopen":
                                    events.afterOpen.push(callback);
                                    break;
                                case "afterclose":
                                    events.afterClose.push(callback);
                                    break;
                                case "close":
                                case "beforeclose":
                                    events.beforeClose.push(callback);
                                    break;
                            }
                        }
                    }
                    return self;
                }
            };
            return new lzyPopup(configure);
        }
    });
})(jQuery, window, document);