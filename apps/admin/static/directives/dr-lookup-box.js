var libs_directives;
/*--how to use:
    <div b-lookup-box=.. total-items=.. page-index=.. on-change=.. ng-model=../>
*/
(function (libs_directives) {
    libs_directives._module.directive("bLookupBox", ["$parse", function ($parse) {
            return {
                restrict: "CEA",
                replace: true,
                template:"<div class=\"input-group\">"+
                         "<input type=\"text\" class=\"form-control\">"+
                         "<span class=\"input-group-addon\" id=\"basic-addon2\">@example.com</span>"+
                         "</div>",
                link: function (scope, ele, attr) {

                }
            };
        }]);
})(libs_directives || (libs_directives = {}));
