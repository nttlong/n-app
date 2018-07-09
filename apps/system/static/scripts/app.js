function app(viewPath,menu,serviceUrl){
    ws_set_url(serviceUrl);
    var app=angular.module("app",["c-ui"]);
        var ctl=app.controller("app",["$compile","$scope",function($compile,scope){

            scope.$root.$compile=$compile;
            scope.$root.$dialog=dialog;
            scope.view_path=viewPath;
            ws_onBeforeCall(function(){
                return $("<div class='mask'></div>").appendTo('body');
            });
            ws_onAfterCall(function(sender){
                sender.remove();
            });
          scope.$root.menu=JSON.parse(menu);
          history_navigator(scope.$root);
          scope.$root.$history.change(function(data){
            scope.$root.currentPage=data.page;
            scope.$root.$applyAsync();
            
          });
          scope.$root.$applyAsync();
          console.log(scope.$root);
        }]);  
}
