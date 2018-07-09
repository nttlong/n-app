var libs_directives;
(function (libs_directives) {
    libs_directives._module.directive("bTextbox", ["$parse", function ($parse) {
            return {
                restrict: "CEA",
                scope: false,
                template: function () {
                    if(libs_directives.isSmallSize){
                        return "<input class=\"form-control input-sm\"/>";
                    }
                    else {
                        return "<input class=\"form-control\"/>";
                    }
                },
                replace: true,
                link: function (scope, ele, attr) {
                    attr.$observe("readonly", function (value) {
                    });
                }
            };
        }]);
})(libs_directives || (libs_directives = {}));
