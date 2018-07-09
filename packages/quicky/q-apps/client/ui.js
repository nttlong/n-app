var _dialog_root_url;
function dialog_root_url(value) {
    _dialog_root_url = value;
}
function findScopeById(id){
    var eles=$(".ng-scope");
    var ret=undefined;
    for(var i=0;i<eles.length;i++){
        ret=angular.element(eles[i]).scope();
        if(ret.$id===id){
            break;
        }
        else {
            ret=undefined;
        }
    }
    return ret;
}
function dialog($scope) {
    if(angular.isNumber($scope)){
        $scope=findScopeById($scope);
    }
    function getScript(content) {
        if (content.indexOf("<body>") > -1) {
            var x = content.indexOf("<body>") + "<body>".length;
            var y = content.indexOf("</body>");
            content = content.substring(x, y);
        }
        var ret = [];
        var i = content.indexOf("<script>");
        while (i > -1) {
            var j = content.indexOf("</script>", i);
            var script = content.substring(i + "<script>".length, j);
            ret.push(script);
            content = content.substring(0, i) + content.substring(j + "</script>".length, content.length);
            i = content.indexOf("<script>");
        }
        return {
            scripts: ret,
            content: content
        };
    }
    function compile(scope, scripts, content,_params) {
        var subScope = scope.$new(true, scope);

        for (var i = 0; i < scripts.length; i++) {
            var fn = eval(scripts[i]);
            fn(subScope,_params);
        }
        var frm = $('<div><div class="modal fade" id="myModal" role="dialog">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +

            '<div class="modal-header">' +


            '<h4 class="modal-title"><img src=""/ style="height:40px"><span>...</span></h4>' +
            '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
            '</div>' +
            '<div class="modal-body">' +

            '</div>' +
            '</div></div>'
        );
        var $ele = $("<div>" + content + "</div>");

        var child = $($ele.children()[0])
        frm.attr("title",child.attr("title"))
        frm.attr("icon",child.attr("icon"))
        $ele.children().appendTo(frm.find(".modal-body")[0]);
        subScope.$element=frm

        subScope.$watch(function () {
            return subScope.$element.find(".modal-body").children().attr("title");
        }, function (val) {
            if(angular.isDefined(val)){
                subScope.$element.find(".modal-title span").html(val);
            }
        });
        subScope.$watch(function () {
            return subScope.$element.find(".modal-body").children().attr("icon");
        }, function (val) {
            if(angular.isDefined(val)){
                subScope.$element.find(".modal-title img").attr("src", val);
            }
            else{
                subScope.$element.find(".modal-title img").hide()
            }

        });
        if(!$scope.$root.$compile){
            throw("Please use '$compile' at controller then set '$scope.$root.$compile=$compile'")
        }
        $scope.$root.$compile(frm.contents())(subScope);
        subScope.$element = $(frm.children()[0]);
        subScope.$applyAsync();

        return subScope;
    }
    function ret(scope) {
        var me = this;
        me.url = function (_url) {
            if (_dialog_root_url) {
                me._url = _dialog_root_url + "/" + _url;
            }
            else {
                me._url = _url;
            }

            return me;
        }
        me.params=function(data){
            me._params=data;
            return me;
        }
        me.done = function (callback) {


            $.ajax({
                method: "GET",
                url: me._url,
                success: function (res) {
                    var ret = getScript(res);
                    var sScope = compile(scope, ret.scripts, ret.content,me._params);
                    if (callback) {
                        callback(sScope);
                    }
                    sScope.$element.appendTo("body");
                    function watch() {
                        if (!$.contains($("body")[0], sScope.$element[0])) {
                            sScope.$destroy();
                        }
                        else {
                            setTimeout(watch, 500);
                        }
                    }
                    watch();
                    sScope.$element.modal()
                        .on("hidden.bs.modal", function () {
                            sScope.$element.remove();

                        });

                    function watch() {
                        if (!$.contains($("body")[0], sScope.$element[0])) {

                            sScope.$destroy();
                        }
                        else {
                            setTimeout(watch, 500);
                        }
                    }
                    sScope.$doClose = function () {
                        sScope.$element.modal('hide')
                    }
                    watch();
                }
            })
        }
    }
    return new ret($scope);
}
function $url() {
    function ret() {
        var me = this;
        me.data = {};
        if (window.location.href.indexOf("#") > -1) {
            var ref = window.location.href.split('#')[1];
            var items = ref.split('&');
            for (var i = 0; i < items.length; i++) {
                me.data[items[i].split('=')[0]] = items[i].split('=')[1];
            }
        }
        me.param = function (key, value) {
            me.data[key] = value;
            return me;
        }
        me.clear = function () {
            me.data = {}
            return me;
        }
        me.url = function () {
            var ret = "";
            var keys = Object.keys(me.data);
            for (var i = 0; i < keys.length; i++) {
                ret += keys[i] + "=" + me.data[keys[i]] + "&"
            }
            return ret.substring(0, ret.length - 1);
        }
        me.apply = function () {
            window.location.href = "#" + decodeURIComponent( me.url());
        }

    }
    return new ret();
}
function history_navigator($scope) {
    var oldUrl;
    function historyMonitorStart(handler) {
        function run() {
            if (oldUrl != window.location.href) {

                if (historyChangeCallback.length > 0) {
                    if (window.location.href.indexOf('#') > -1) {
                        var data = {};
                        var url = window.location.href.split('#')[1];
                        var items = url.split('&');
                        var ret = {};
                        for (var i = 0; i < items.length; i++) {
                            data[items[i].split('=')[0]] = decodeURI(window["unescape"](items[i].split('=')[1]));
                        }
                        for (var i = 0; i < historyChangeCallback.length; i++) {
                            historyChangeCallback[i](data);
                        }
                        var keys = Object.keys($scope.$history.events);
                        for (var i = 0; i < keys.length; i++) {
                            if (!$scope.$history.events[keys[i]].hasStartCall) {
                                var obj = {
                                    key: keys[i],
                                    data: data,
                                    done: function () {
                                        if ($scope.$history.events[obj.key])
                                            $scope.$history.events[obj.key].handler(obj.data);
                                    }
                                }
                                setTimeout(function () {
                                    obj.done();
                                }, 300);

                            }
                        }

                    }
                    else {
                        historyChangeCallback[historyChangeCallback.length - 1]({});
                    }
                }
                oldUrl = window.location.href;
            }
            setTimeout(run, 100);
        }
        run();
    }

    var historyChangeCallback = [];
    function applyHistory(scope) {

        scope.$history = {
            isStart: true,
            events: {},
            data: function () {
                if (window.location.href.indexOf('#') == -1)
                    return {};
                var url = window.location.href.split('#')[1];
                var items = url.split('&');
                var ret = {};
                for (var i = 0; i < items.length; i++) {
                    ret[items[i].split('=')[0]] = decodeURI(window["unescape"](items[i].split('=')[1]));
                }
                return ret;
            },
            change: function (callback) {
                var _data = scope.$history.data();
                callback(_data);
                scope.$$$$historyCallback = callback;
                historyChangeCallback.push(callback);

            },
            redirectTo: function (bm) {
                window.location.href = bm;
            },
            onChange: function (subScope, handler) {

                scope.$history.events["scope_" + subScope.$id] = {
                    handler: handler,
                    hasStartCall: true,
                    scope: subScope
                };
                subScope.$on("$destroy", function () {
                    delete scope.$history.events["scope_" + subScope.$id];
                });
                if (scope.$history.events["scope_" + subScope.$id].hasStartCall) {
                    handler(scope.$history.data());
                    scope.$history.events["scope_" + subScope.$id].hasStartCall = false;
                }

            }
        };
        function URLObject(obj) {
            obj.$url = this;
            var me = this;
            me.data = obj.$history.data();
            me.clear = function () {
                me.data = {};
                return me;
            };
            me.item = function (key, value) {
                if (!me.data) {
                    me.data = {};
                }
                me.data[key] = value;
                return me;
            };
            me.done = function () {
                var keys = Object.keys(me.data);
                var retUrl = "";
                for (var i = 0; i < keys.length; i++) {
                    retUrl += keys[i] + "=" + window["escape"](encodeURI(me.data[keys[i]])) + "&";
                }
                retUrl = window.location.href.split('#')[0] + '#' + retUrl.substring(0, retUrl.length - 1);
                return retUrl;
            };
            var x = 1;
        }
        new URLObject(scope);
        historyMonitorStart(historyChangeCallback);
    }
    return new applyHistory($scope);
}

function ng_app(modulelName,controllerName,injection, fn,ngStartSymbol,ngEndSymbol) {
    injection.push("imageupload","q-ui");
    var app = angular.module(modulelName, injection, function ($interpolateProvider) {
        if(ngStartSymbol){
            $interpolateProvider.startSymbol(ngStartSymbol);
            $interpolateProvider.endSymbol(ngStartSymbol);
        }
        
    });
    var controller = app.controller(controllerName, ["$compile", "$scope", function ($compile, $scope) {
        $scope.$root.$compile = $compile;
        $scope.$root.$dialog =dialog;
        history_navigator($scope.$root);
        fn($scope);
        
          
        $scope.$applyAsync();
    }]);
}
var _appDirectiveSetRootUrl;
function appDirectiveSetRootUrl(url) {
    _appDirectiveSetRootUrl = url;
}
var mdl = angular.module("q-ui", []);
mdl.service("$dialog",["$compile",function($compile){
    function getScope(id) {
        var elem;
        $('.ng-scope').each(function(){
            var s = angular.element(this).scope(),
                sid = s.$id;

            if(sid == id) {
                elem = this;
                return false; // stop looking at the rest
            }
        });
        return elem;
    }
    return function(scope){
        scope.$root.$compile=$compile
        scope.$root.$dialog=function(id){
            if(!id){
                return $dialog(scope.$root)
            }
            else {
                var ele=getScope(id)
                subScope=angular.element(ele).scope()
                return dialog(subScope)
            }

        }
    }
}])
// candidate portal directive ui
mdl.directive("qTemplate", ["$compile", function ($compile) {

    function loadUrl(url, handler) {
        var $mask = $("<div class='mask'></div>");
        $mask.appendTo("body");
        $.ajax({
            url: _appDirectiveSetRootUrl? _appDirectiveSetRootUrl + "/" + url:url,
            method: "get",
            success: function (res) {
                $mask.remove();
                handler(undefined, { url: url, res: res });
            },
            error: function (err) {
                $mask.remove();
                handler(err);
            }
        })
    }
    function getScript(res) {
        var content = res.res;
        if (content.indexOf("<body>") > -1) {
            var x = content.indexOf("<body>") + "<body>".length;
            var y = content.indexOf("</body>",x);
            content = content.substring(x, y);
        }
        var ret = [];
        var i = content.indexOf("<script>");
        while (i > -1) {
            var j = content.indexOf("</script>", i);
            var script = content.substring(i + "<script>".length, j);
            ret.push(script);
            content = content.substring(0, i) + content.substring(j + "</script>".length, content.length);
            i = content.indexOf("<script>");
        }
        return {
            scripts: ret,
            content: content,
            url:res.url
        };
    }
    function compile(scope, scripts, content,url) {
        
        var subScope = scope.$new(true, scope);
        if (scripts && (scripts.length > 0)) {
            for (var i = 0; i < scripts.length; i++) {
                try {
                    //debugger;
                    var fn = Function("var ret=" + scripts[i] + ";return ret")();
                    fn(subScope);
                }
                catch (ex) {
                    throw ({
                        error: ex,
                        url: url
                    })
                    console.log(scripts[i])
                }
            }
        }
        var $ele = $("<div>" + content + "</div>");
        subScope.$element = $ele.children();
        $compile($ele.contents())(subScope);
        subScope.$applyAsync();

        return subScope;
    }
    return {
        restrict: "ACE",
        link: function (scope, ele, attr) {
            attr.$observe("url", function (value) {
                loadUrl(value, function (err, content) {
                    var ret = getScript(content);
                    var sScope = compile(scope, ret.scripts, ret.content,ret.url);
                    ele.empty();
                    sScope.$element.appendTo(ele[0]);
                    function watch() {
                        if (!$.contains($("body")[0], sScope.$element[0])) {
                            sScope.$destroy();
                        }
                        else {
                            setTimeout(watch, 500);
                        }
                    }
                    watch();
                })
            })
        }
    }
}]);
angular.module('imageupload', [])
    .directive('image', function($q) {
        'use strict'

        var URL = window.URL || window.webkitURL;

        var getResizeArea = function () {
            var resizeAreaId = 'fileupload-resize-area';

            var resizeArea = document.getElementById(resizeAreaId);

            if (!resizeArea) {
                resizeArea = document.createElement('canvas');
                resizeArea.id = resizeAreaId;
                resizeArea.style.visibility = 'hidden';
                document.body.appendChild(resizeArea);
            }

            return resizeArea;
        }

        var resizeImage = function (origImage, options) {
            var maxHeight = options.resizeMaxHeight || 300;
            var maxWidth = options.resizeMaxWidth || 250;
            var quality = options.resizeQuality || 0.7;
            var type = options.resizeType || 'image/jpg';

            var canvas = getResizeArea();

            var height = origImage.height;
            var width = origImage.width;

            // calculate the width and height, constraining the proportions
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round(height *= maxWidth / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round(width *= maxHeight / height);
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            //draw image on canvas
            var ctx = canvas.getContext("2d");
            ctx.drawImage(origImage, 0, 0, width, height);

            // get the data from canvas as 70% jpg (or specified type).
            return canvas.toDataURL(type, quality);
        };

        var createImage = function(url, callback) {
            var image = new Image();
            image.onload = function() {
                callback(image);
            };
            image.src = url;
        };

        var fileToDataURL = function (file) {
            var deferred = $q.defer();
            var reader = new FileReader();
            reader.onload = function (e) {
                deferred.resolve(e.target.result);
            };
            reader.readAsDataURL(file);
            return deferred.promise;
        };


        return {
            restrict: 'A',
            scope: {
                image: '=',
                resizeMaxHeight: '@?',
                resizeMaxWidth: '@?',
                resizeQuality: '@?',
                resizeType: '@?',
            },
            link: function postLink(scope, element, attrs, ctrl) {

                var doResizing = function(imageResult, callback) {
                    createImage(imageResult.url, function(image) {
                        var dataURL = resizeImage(image, scope);
                        imageResult.resized = {
                            dataURL: dataURL,
                            type: dataURL.match(/:(.+\/.+);/)[1],
                        };
                        callback(imageResult);
                    });
                };

                var applyScope = function(imageResult) {
                    scope.$apply(function() {
                        //console.log(imageResult);
                        if(attrs.multiple)
                            scope.image.push(imageResult);
                        else
                            scope.image = imageResult; 
                    });
                };


                element.bind('change', function (evt) {
                    //when multiple always return an array of images
                    if(attrs.multiple)
                        scope.image = [];

                    var files = evt.target.files;
                    for(var i = 0; i < files.length; i++) {
                        //create a result object for each file in files
                        var imageResult = {
                            file: files[i],
                            url: URL.createObjectURL(files[i])
                        };

                        fileToDataURL(files[i]).then(function (dataURL) {
                            imageResult.dataURL = dataURL;
                        });

                        if(scope.resizeMaxHeight || scope.resizeMaxWidth) { //resize image
                            doResizing(imageResult, function(imageResult) {
                                applyScope(imageResult);
                            });
                        }
                        else { //no resizing
                            applyScope(imageResult);
                        }
                    }
                });
            }
        };
    });