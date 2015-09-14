"use strict";function getStats(a){var b=0,c=0,d=0;a.forEach(function(a){a.comments.length>0?(c++,b+=a.comments?a.comments.length:0):d++});var e=[a.length+" preguntas",b+" comentarios",(b/a.length).toFixed(2)+" comentarios por pregunta",d+" preguntas sin comentarios",c+" preguntas con comentarios"];return e}angular.module("quizApp",["ngCookies","ngResource","ngSanitize","ngRoute","btford.socket-io","ui.bootstrap","leaflet-directive"]).config(["$routeProvider","$locationProvider","$httpProvider",function(a,b,c){a.otherwise({redirectTo:"/"}),b.html5Mode(!0),c.interceptors.push("authInterceptor")}]).factory("authInterceptor",["$rootScope","$q","$cookies","$location",function(a,b,c,d){return{request:function(a){return a.headers=a.headers||{},c.get("token")&&(a.headers.Authorization="Bearer "+c.get("token")),a},responseError:function(a){return 401===a.status?(d.path("/login"),c.remove("token"),b.reject(a)):b.reject(a)}}}]).run(["$rootScope","$location","Auth",function(a,b,c){a.$on("$routeChangeStart",function(a,d){d.authenticate&&c.isLoggedIn(function(c){c||(a.preventDefault(),b.path("/login"))})})}]),angular.module("quizApp").config(["$routeProvider",function(a){a.when("/login",{templateUrl:"app/account/login/login.html",controller:"LoginCtrl"}).when("/logout",{name:"logout",referrer:"/",template:"",controller:["$location","$route","Auth",function(a,b,c){var d=b.current.params.referrer||b.current.referrer||"/";c.logout(),a.path(d)}]}).when("/signup",{templateUrl:"app/account/signup/signup.html",controller:"SignupCtrl"}).when("/settings",{templateUrl:"app/account/settings/settings.html",controller:"SettingsCtrl",authenticate:!0})}]).run(["$rootScope",function(a){a.$on("$routeChangeStart",function(a,b,c){"logout"===b.name&&c&&c.originalPath&&!c.authenticate&&(b.referrer=c.originalPath)})}]),angular.module("quizApp").controller("LoginCtrl",["$scope","Auth","$location",function(a,b,c){a.user={},a.errors={},a.login=function(d){a.submitted=!0,d.$valid&&b.login({email:a.user.email,password:a.user.password}).then(function(){c.path("/")})["catch"](function(b){a.errors.other=b.message})}}]),angular.module("quizApp").controller("SettingsCtrl",["$scope","User","Auth",function(a,b,c){a.errors={},a.changePassword=function(b){a.submitted=!0,b.$valid&&c.changePassword(a.user.oldPassword,a.user.newPassword).then(function(){a.message="El password ha cambiado correctamente."})["catch"](function(){b.password.$setValidity("mongoose",!1),a.errors.other="El password es incorrecto.",a.message=""})}}]),angular.module("quizApp").controller("SignupCtrl",["$scope","Auth","$location",function(a,b,c){a.user={},a.errors={},a.register=function(d){a.submitted=!0,d.$valid&&b.createUser({name:a.user.name,email:a.user.email,password:a.user.password}).then(function(){c.path("/")})["catch"](function(b){b=b.data,a.errors={},angular.forEach(b.errors,function(b,c){d[c].$setValidity("mongoose",!1),a.errors[c]=b.message})})}}]),angular.module("quizApp").controller("AdminCtrl",["$scope","$http","Auth","User",function(a,b,c,d){a.users=d.query(),a["delete"]=function(b){d.remove({id:b._id}),a.users.splice(this.$index,1)}}]),angular.module("quizApp").config(["$routeProvider",function(a){a.when("/admin",{templateUrl:"app/admin/admin.html",controller:"AdminCtrl"})}]),angular.module("quizApp").config(["$routeProvider",function(a){a.when("/author",{templateUrl:"app/author/author.html"})}]),angular.module("quizApp").controller("MainCtrl",["$scope","$http","socket",function(a,b,c){a.awesomeThings=[],b.get("/api/things").success(function(b){a.awesomeThings=b,c.syncUpdates("thing",a.awesomeThings)}),a.addThing=function(){""!==a.newThing&&(b.post("/api/things",{name:a.newThing}),a.newThing="")},a.deleteThing=function(a){b["delete"]("/api/things/"+a._id)},a.$on("$destroy",function(){c.unsyncUpdates("thing")})}]),angular.module("quizApp").config(["$routeProvider",function(a){a.when("/main",{templateUrl:"app/main/main.html",controller:"MainCtrl"})}]),angular.module("quizApp").controller("MapCtrl",["$scope","leafletData","$http","socket","Auth",function(a,b,c,d,e){a.listAddress=[],a.isLoggedIn=e.isLoggedIn,angular.extend(a,{Madrid:{lat:40.395684,lng:-3.666904,zoom:15}}),b.getMap("map").then(function(b){var f=L.Icon.Default.extend({options:{iconUrl:"img/marker-question-icon.png",className:"question-icon"}}),g=new f;c.get("/api/maps").success(function(c){c.forEach(function(a,d){var e=L.latLng(a.lat,a.lng),f=L.marker(e);f.addTo(b),d==c.length-1&&b.setView(e)}),a.listAddress=c}),a.deleteAddress=function(b){c["delete"]("/api/maps/"+b._id).success(function(){var c=a.listAddress.indexOf(b);a.listAddress.splice(c,1),d.syncUpdates("listAddress",a.listAddress)}).error(function(b){console.log(b),a.errors=b.errors})},a.saveEditAddress=function(b,e){e.description=b.description.$modelValue,c.put("/api/maps/"+e._id,e).success(function(b){d.syncUpdates("listAddress",a.listAddress),b.edit=!1}).error(function(b){console.log(b),a.errors=b.errors})},a.editAddress=function(b){a.listAddress.forEach(function(a){a.edit=!1}),b.edit=!0},a.noEditAddress=function(a){console.log("noeditAddress"),a.edit=!1},a.searchAddress=function(b){a.searchResults=[],a.submitted=!0,console.log("http://nominatim.openstreetmap.org/search?format=json&q="+b.search+"&addressdetails=1&accept-language=es"),c.get("http://nominatim.openstreetmap.org/search?format=json&q="+b.search+"&addressdetails=1&accept-language=es").success(function(b){b.forEach(function(b){a.searchResults.push(b)})}).error(function(a,b,c,d){console.log("error")})},a.selectAddress=function(c){var d=L.latLng(Number(c.lat),Number(c.lon));a.submitted=!1,b.setView(d);var e=L.marker(d,{icon:g});e.addTo(b),e.bindPopup("<strong>"+c.address.road+" "+c.address.house_number+"</strong><br>"+c.display_name).openPopup(),a.edit=!0,a.address=c.address,a.address.lat=c.lat,a.address.lng=c.lon,a.deleteMarker=function(){b.removeLayer(e),a.edit=!1}},a.openPopup=function(a){var c=L.latLng(a.lat,a.lng);b.setView(c);var d=L.marker(c);d.addTo(b),d.bindPopup("<strong>"+a.road+" "+a.house_number+"</strong><br>"+a.description).openPopup()},a.saveAddress=function(b,e){e.description=b.description.$modelValue,console.log(e),c.post("/api/maps",e).success(function(b){a.listAddress.push(b),a.edit=!1,a.searchResults=[],a.formSearch=[],d.syncUpdates("listAddress",a.listAddress)}).error(function(b){console.log(b),a.errors=b.errors})},e.isLoggedIn()&&b.on("click",function(d){if(a.edit);else{var e=d.latlng;b.setView(e);var f=L.marker(e,{icon:g});f.addTo(b),c.get("http://nominatim.openstreetmap.org/reverse?format=json&lat="+e.lat+"&lon="+e.lng+"&addressdetails=1&accept-language=es").success(function(b){a.address={house_number:b.address.house_number,suburb:b.address.suburb,road:b.address.road,postcode:b.address.postcode,country:b.address.country,country_code:b.address.country_code,city:b.address.city,lat:e.lat,lng:e.lng},f.bindPopup("<strong>"+b.address.road+" "+b.address.house_number+"</strong><br>"+b.display_name).openPopup(),a.edit=!0}).error(function(a,b,c,d){console.log("error")})}a.deleteMarker=function(){b.removeLayer(f),a.edit=!1}})})}]),angular.module("quizApp").config(["$routeProvider",function(a){a.when("/map",{templateUrl:"app/map/map.html",controller:"MapCtrl"})}]),angular.module("quizApp").controller("QuizCtrl",["$scope","$routeParams","$http","socket","$location","Auth",function(a,b,c,d,e,f){a.quizes=[],a.quiz={},b.id?c.get("/api/quizzes/"+b.id).success(function(b){a.quiz=b,d.syncUpdates("quiz",a.quiz)}):(f.isLoggedIn()&&e.path("/quiz-admin"),c.get("/api/quizzes").success(function(b){a.quizes=b,d.syncUpdates("quizes",a.quizes)})),a.validateQuiz=function(b,c){a.submitted=!0,c.respuesta.toLowerCase()==b.respuesta.toLowerCase()?a.quizFB={ok:!0,id:c.quizId,respuesta:b.respuesta}:a.quizFB={ok:!1,id:c.quizId,respuesta:b.respuesta},b.respuesta=""},a.repeatQuiz=function(b){a.submitted=!1,b.respuesta="",a.quizFB=void 0},a.addComment=function(b,d){a.submitted=!0,a.classFeedback="alert-danger",b.active=!1,b.idQuiz=d._id,c.post("/api/comments",b).success(function(b){d.comments.push(b._id),c.put("/api/quizzes/"+d._id,d).success(function(b){a.msgComment="El comentario se ha dado de alta correctamente",a.classFeedback="alert-success",a.comment={},a.formComment={}}).error(function(b){a.msgComment="Se ha producido los siguientes errores:",a.errors=b.errors,a.classFeedback="alert-danger"})}).error(function(b){a.msgComment="Se ha producido los siguientes errores:",a.errors=b.errors,a.classFeedback="alert-danger"})},a.controlLength=function(a){angular.element(document.querySelector("#commentLength")).text(250-a.length)}}]),angular.module("quizApp").controller("QuizAdminCtrl",["$scope","$routeParams","$http","socket","$location","Auth",function(a,b,c,d,e,f){a.quizes=[],a.quiz={},a.stats=[],a.temas=["otro","humanidades","ocio","ciencia","tecnologia","Geografía"],f.isLoggedIn()||e.path("/quizzes"),c.get("/api/quizzes").success(function(b){a.quizes=b,a.stats=getStats(b)}),a.toggleComment=function(a){angular.element(document.querySelector("#comments_"+a)).toggleClass("hide")},a.showAddForm=function(){angular.element(document.querySelector("#add-quiz")).toggleClass("hide"),angular.element(document.querySelector(".showAddForm")).toggleClass("glyphicon-minus")},a.showStats=function(){angular.element(document.querySelector("#stats-quiz")).toggleClass("hide"),angular.element(document.querySelector(".showStats")).toggleClass("glyphicon-minus")},a.editQuiz=function(b){a.edit={edit:!0,quizId:b.quizId},angular.element(document.querySelectorAll(".comments")).addClass("hide")},a.noEditQuiz=function(b){a.edit=void 0},a["delete"]=function(b){c["delete"]("/api/quizzes/"+b._id).success(function(){var c=a.quizes.indexOf(b);a.quizes.splice(c,1),d.syncUpdates("quizes",a.quizes),a.stats=getStats(a.quizes),d.syncUpdates("stats",a.stats)})},a.activeComment=function(a){a.active=!a.active,c.put("/api/comments/"+a._id,a).success(function(){e.path("/quiz-admin")})},a.deleteComment=function(b,e){c["delete"]("/api/comments/"+b._id).success(function(){var c=e.comments.indexOf(b);e.comments.splice(c,1),c=a.quizes.indexOf(e),a.quizes[c]=e,d.syncUpdates("quizes",a.quizes),a.stats=getStats(a.quizes),d.syncUpdates("stats",a.stats)})},a.addQuiz=function(b){a.submitted=!0,c.post("/api/quizzes",b).success(function(b){a.quiz={},a.submitted=!1,a.quizes.push(b),d.syncUpdates("quizes",a.quizes),a.stats=getStats(a.quizes),d.syncUpdates("stats",a.stats)}).error(function(b){a.errors=b.errors})},a.saveEditQuiz=function(b){a.submitted=!1,c.put("/api/quizzes/"+b._id,b).success(function(b){a.quiz={},a.edit=void 0}).error(function(b){a.errors=b.errors})}}]),angular.module("quizApp").controller("QuizSearchCtrl",["$scope","$routeParams","$http","$location","Auth",function(a,b,c,d,e){a.title='Preguntas: "'+b.search+"'",a.quizes=[],a.search=b.search,b.search&&c.get("/api/quizzes/search/"+b.search).success(function(b){a.quizes=b})}]),angular.module("quizApp").config(["$routeProvider",function(a){a.when("/",{templateUrl:"app/quiz/quizzes.html",controller:"QuizCtrl"}),a.when("/search-quiz",{templateUrl:"app/quiz/quizzes.html",controller:"QuizSearchCtrl"}),a.when("/quizzes/:id",{templateUrl:"app/quiz/quiz.html",controller:"QuizCtrl"}),a.when("/quiz-admin",{templateUrl:"app/quiz/list-admin.html",controller:"QuizAdminCtrl"})}]),angular.module("quizApp").factory("Auth",["$http","User","$cookies","$q",function(a,b,c,d){var e=function(a){return angular.isFunction(a)?a:angular.noop},f={};return c.get("token")&&(f=b.get()),{login:function(g,h){return a.post("/auth/local",{email:g.email,password:g.password}).then(function(a){return c.put("token",a.data.token),f=b.get(),f.$promise}).then(function(a){return e(h)(null,a),a})["catch"](function(a){return this.logout(),e(h)(a.data),d.reject(a.data)}.bind(this))},logout:function(){c.remove("token"),f={}},createUser:function(a,d){return b.save(a,function(g){return c.put("token",g.token),f=b.get(),e(d)(null,a)},function(a){return this.logout(),e(d)(a)}.bind(this)).$promise},changePassword:function(a,c,d){return b.changePassword({id:f._id},{oldPassword:a,newPassword:c},function(){return e(d)(null)},function(a){return e(d)(a)}).$promise},getCurrentUser:function(a){if(0===arguments.length)return f;var b=f.hasOwnProperty("$promise")?f.$promise:f;return d.when(b).then(function(b){return e(a)(b),b},function(){return e(a)({}),{}})},isLoggedIn:function(a){return 0===arguments.length?f.hasOwnProperty("role"):this.getCurrentUser(null).then(function(b){var c=b.hasOwnProperty("role");return e(a)(c),c})},isAdmin:function(a){return 0===arguments.length?"admin"===f.role:this.getCurrentUser(null).then(function(b){var c="admin"===b.role;return e(a)(c),c})},getToken:function(){return c.get("token")}}}]),angular.module("quizApp").factory("User",["$resource",function(a){return a("/api/users/:id/:controller",{id:"@_id"},{changePassword:{method:"PUT",params:{controller:"password"}},get:{method:"GET",params:{id:"me"}}})}]),angular.module("quizApp").directive("footer",function(){return{templateUrl:"components/footer/footer.html",restrict:"E",link:function(a,b){b.addClass("footer")}}}),angular.module("quizApp").factory("Modal",["$rootScope","$modal",function(a,b){function c(c,d){var e=a.$new();return c=c||{},d=d||"modal-default",angular.extend(e,c),b.open({templateUrl:"components/modal/modal.html",windowClass:d,scope:e})}return{confirm:{"delete":function(a){return a=a||angular.noop,function(){var b,d=Array.prototype.slice.call(arguments),e=d.shift();b=c({modal:{dismissable:!0,title:"Confirm Delete",html:"<p>Are you sure you want to delete <strong>"+e+"</strong> ?</p>",buttons:[{classes:"btn-danger",text:"Delete",click:function(a){b.close(a)}},{classes:"btn-default",text:"Cancel",click:function(a){b.dismiss(a)}}]}},"modal-danger"),b.result.then(function(b){a.apply(b,d)})}}}}}]),angular.module("quizApp").directive("mongooseError",function(){return{restrict:"A",require:"ngModel",link:function(a,b,c,d){b.on("keydown",function(){return d.$setValidity("mongoose",!0)})}}}),angular.module("quizApp").controller("NavbarCtrl",["$scope","$location","Auth",function(a,b,c){c.isLoggedIn()?a.menu=[{title:"Inicio",link:"/quiz-admin"},{title:"Mapas",link:"/map"}]:a.menu=[{title:"Inicio",link:"/"},{title:"Mapas",link:"/map"}],a.isCollapsed=!0,a.isLoggedIn=c.isLoggedIn,a.isAdmin=c.isAdmin,a.getCurrentUser=c.getCurrentUser,a.search&&angular.element(document.querySelector("#li_search_quiz")).removeClass("hide"),a.logout=function(){c.logout(),b.path("/login")},a.isActive=function(a){return a===b.path()},a.searchQuiz=function(){""!=angular.element(document.querySelector("#search_input")).val()?angular.element(document.querySelector("#form_search_quiz")).submit():angular.element(document.querySelector("#li_search_quiz")).toggleClass("hide")}}]),angular.module("quizApp").directive("navbar",function(){return{templateUrl:"components/navbar/navbar.html",restrict:"E",controller:"NavbarCtrl"}}),angular.module("quizApp").factory("socket",["socketFactory",function(a){var b=io("",{path:"/socket.io-client"}),c=a({ioSocket:b});return{socket:c,syncUpdates:function(a,b,d){d=d||angular.noop,c.on(a+":save",function(a){var c=_.find(b,{_id:a._id}),e=b.indexOf(c),f="created";c?(b.splice(e,1,a),f="updated"):b.push(a),d(f,a,b)}),c.on(a+":remove",function(a){var c="deleted";_.remove(b,{_id:a._id}),d(c,a,b)})},unsyncUpdates:function(a){c.removeAllListeners(a+":save"),c.removeAllListeners(a+":remove")}}}]),angular.module("quizApp").run(["$templateCache",function(a){a.put("app/account/login/login.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class="container login"><div class=row><div class=col-sm-12><h1>Login</h1></div><div class="col-sm-12 login"><form class=form name=form ng-submit=login(form) novalidate><div class=form-group><label>Email</label><input type=email name=email class=form-control ng-model=user.email required></div><div class=form-group><label>Password</label><input type=password name=password class=form-control ng-model=user.password required></div><div class="form-group has-error"><p class=help-block ng-show="form.email.$error.required && form.password.$error.required && submitted">Los campos email y password son obligatorios.</p><p class=help-block ng-show="form.email.$error.email && submitted">El formato de el email no es correcto</p><p class=help-block>{{ errors.other }}</p></div><div><button class="btn btn-inverse btn-lg btn-login" type=submit>Login</button> <a class="btn btn-default btn-lg btn-register" href=/signup>Registro</a></div></form></div></div></div>'),a.put("app/account/settings/settings.html",'<navbar></navbar><div class="container login"><div class=row><div class=col-sm-12><h1>Cambio de password</h1></div><div class=col-sm-12><div class="alert alert-success" ng-if=message><p>{{message}}</p></div><form class=form name=form ng-submit=changePassword(form) novalidate><div class=form-group><label>Password actual</label><input type=password name=password class=form-control ng-model=user.oldPassword mongoose-error><p class=help-block ng-show=form.password.$error.mongoose>{{ errors.other }}</p></div><div class=form-group><label>Nuevo password</label><input type=password name=newPassword class=form-control ng-model=user.newPassword ng-minlength=3 required><p class=help-block ng-show="(form.newPassword.$error.minlength || form.newPassword.$error.required) && (form.newPassword.$dirty || submitted)">El password debe tener al menos 3 caracteres.</p></div><button class="btn btn-lg btn-primary" type=submit>Guardar</button></form></div></div></div>'),a.put("app/account/signup/signup.html",'<navbar></navbar><div class="container login"><div class=row><div class=col-sm-12><h1>Registro</h1></div><div class=col-sm-12><form class=form name=form ng-submit=register(form) novalidate><div class=form-group ng-class="{ \'has-success\': form.name.$valid && submitted,\n                                            \'has-error\': form.name.$invalid && submitted }"><label>Nombre<span>(Obligatorio)</span></label><input name=name class=form-control ng-model=user.name required><p class=help-block ng-show="form.name.$error.required && submitted">El nombre es obligatorio</p></div><div class=form-group ng-class="{ \'has-success\': form.email.$valid && submitted,\n                                            \'has-error\': form.email.$invalid && submitted }"><label>Email<span>(Obligatorio)</span></label><input type=email name=email class=form-control ng-model=user.email required mongoose-error><p class=help-block ng-show="form.email.$error.email && submitted">El email informado no es correcto</p><p class=help-block ng-show="form.email.$error.required && submitted">El email es un campo obligatorio</p><p class=help-block ng-show=form.email.$error.mongoose>{{ errors.email }}</p></div><div class=form-group ng-class="{ \'has-success\': form.password.$valid && submitted,\n                                            \'has-error\': form.password.$invalid && submitted }"><label>Password<span>(Obligatorio)</span></label><input type=password name=password class=form-control ng-model=user.password ng-minlength=3 required mongoose-error><p class=help-block ng-show="(form.password.$error.minlength || form.password.$error.required) && submitted">EL password debe tener al menos 3 caracteres.</p><p class=help-block ng-show=form.password.$error.mongoose>{{ errors.password }}</p></div><div><button class="btn btn-inverse btn-lg btn-register" type=submit>Registro</button> <a class="btn btn-default btn-lg btn-login" href=/login>Login</a></div></form></div></div></div>'),a.put("app/admin/admin.html",'<navbar></navbar><div class=container><div class=page-header><h1>Administración de usuarios</h1></div></div><div class=container><ul class="list-group users"><li class=list-group-item ng-repeat="user in users"><span class="glyphicon glyphicon-cog pull-left role" ng-if="user.role==\'admin\'"></span> <span class="glyphicon glyphicon-user pull-left role" ng-if="user.role==\'user\'"></span> <strong>{{user.name}}</strong><br><span class=text-muted>{{user.email}}</span> <a ng-click=delete(user)><span class="glyphicon glyphicon-remove pull-right"></span></a></li></ul></div>'),a.put("app/author/author.html",'<navbar></navbar><div class=container><div class=container><div class=page-header><h1>READ.ME</h1></div></div><div class=row><div class=col-lg-12><p>Este proyecto se ha generado con <a href=https://github.com/DaftMonk/generator-angular-fullstack target=_blank>Angular Full-Stack Generator</a> version 3.0.0-rc4 siguiendo el trabajo propuesto en el MOOC <a href=https://www.miriadax.net/web/javascript-node-js>Desarrollo de servicios en la nube con HTML5, Javascript y node.js</a></p><h3>Hosting</h3><ul><li>app <a href=https://heroku.com>heroku</a></li><li>bbdd <a href=https://mongolab.com>mongolab</a></li><li>src <a href=https://github.com/arturisimo/quiz_socket>github</a></li></ul><h3>Tecnologías</h3><ul><li><a href=https://git-scm.com target=_blank>Git</a> - control de versiones</li><li>Mean Stack - arquitectura de la aplicación</li><ul><li><a href="https://www.mongodb.org/" target=_blank>MongoDB</a> - bbdd noSQL</li><li><a href="http://expressjs.com/es/" target=_blank>express</a> - framework para nodejs</li><li><a href="https://angularjs.org/" target=_blank>angular</a> - framework MVC</li><li><a href=nodejs.org target=_blank>Node.js and NPM</a> >= v0.12.0 - backend de la aplicación</li><ul><li><a href=http://socket.io target=_blank>socket</a> - Para la comunicación web en tiempo real entre cliente y servidor.</li></ul></ul><li>Herramientas JS</li><ul><li><a href=bower.io target=_blank>bower</a> - <code>$ npm install --global bower</code></li><li><a href="http://gruntjs.com/" target=_blank>Grunt</a> - <code>$ npm install --global grunt-cli</code></li><li><a href=http://yeoman.io target=_blank>yeoman</a> - Generador de la aplicación</li><li><a href=https://mochajs.org target=_blank>mocha</a> - Test unitarios</li></ul><li>Herramientas CSS</li><ul><li><a href="http://getbootstrap.com/" target=_blank>bootstrap</a> - framework desarrollo web</li><li><a href="http://sass-lang.com/" target=_blank>[Sass]</a> - lenguaje de hoja de estilos</li><ul><li><a href=https://www.ruby-lang.org target=_blank>Ruby</a> - para instalar sass: <code>$ gem install sass</code></li></ul></ul></ul><h3>Desarrollar</h3><ul><li><code>$ yo angular-fullstack [nombre_app]</code> para generar la aplicación</li><li><code>$ npm install</code> para instalar las dependencias</li><li><code>$ bower install</code> para instalr las dependencias del front-end</li><li><code>$ grunt serve</code> para levantar el servidor de desarrollo</li></ul><h3>Build</h3><ul><li><code>$ grunt build</code> genera la version para hacer el deploy, en la carpeta "dist"</li></ul><h3>Test</h3><ul><li><code>$ npm test</code></li></ul><h3>Deploy</h3><ul><li></li></ul></div></div></div>'),a.put("app/main/main.html",'<navbar></navbar><div class=container><div class=row><div class=col-lg-12><h1 class=page-header>Features:</h1><ul class="nav nav-tabs nav-stacked col-md-4 col-lg-4 col-sm-6" ng-repeat="thing in awesomeThings"><li><a href=# tooltip={{thing.info}}>{{thing.name}}<button type=button class=close ng-click=deleteThing(thing)>&times;</button></a></li></ul></div></div><form class=thing-form><label>Syncs in realtime across clients</label><p class=input-group><input class=form-control placeholder="Add a new thing here." ng-model=newThing> <span class=input-group-btn><button type=submit class="btn btn-primary" ng-click=addThing()>Add New</button></span></p></form></div><footer></footer>'),a.put("app/map/map.html",'<navbar></navbar><div class=container><div class=row><div class=col-lg-12><h1 class=page-header>OSM: geolocalización</h1><div class="col-xs-8 col-sm-8 col-md-8 col-lg-8"><leaflet id=map center=Madrid></leaflet></div><div class="col-xs-4 col-sm-4 col-md-4 col-lg-4"><ul class="list-group address"><li class=list-group-item ng-repeat="address in listAddress"><div ng-if=!address.edit><a href=# ng-show=isLoggedIn() ng-click=deleteAddress(address) title="Eliminar dirección"><span class="glyphicon glyphicon-remove pull-right"></span></a> <a href=# ng-show=isLoggedIn() ng-click=editAddress(address) title="Editar dirección"><span class="glyphicon glyphicon-edit pull-right"></span></a> <strong ng-click=openPopup(address)>{{address.road}} {{address.house_number}}</strong><p ng-click=openPopup(address)>{{address.description}}</p></div><form name=formAddress ng-submit="saveEditAddress(formAddress, address)" ng-if=address.edit><a href=# ng-click=noEditAddress(address) title=Volver><span class="glyphicon glyphicon-repeat pull-right"></span></a> <strong>{{address.road}} {{address.house_number}}</strong><div class=form-group><input class=form-control name=description ng-model=description ng-value=description placeholder=Descripcion ng-change=changePopupMarker(formAddress)></div><button class="btn btn-primary">Guardar dirección</button> <button class="btn btn-primary" ng-click=noEditAddress(address)>Cancelar</button></form></li><!-- map click --><li class=list-group-item ng-if=edit><a href=# ng-click=deleteMarker(address) title="Eliminar dirección"><span class="glyphicon glyphicon-remove pull-right"></span></a><form name=formAddress ng-submit="saveAddress(formAddress, address)"><strong>{{address.road}} {{address.house_number}}</strong><div class=form-group><input class=form-control name=description ng-model=description ng-value=description placeholder=Descripcion ng-change=changePopupMarker(formAddress)></div><button class="btn btn-primary">Guardar dirección</button> <button class="btn btn-primary" ng-click=deleteMarker(address)>Cancelar</button></form></li></ul><!-- search address --><ul class=list-group ng-show=isLoggedIn()><li class=list-group-item><div id=search-address><form name=formSearch ng-submit=searchAddress(formSearch) novalidate><strong>Busqueda por dirección</strong><p class=input-group><input class=form-control placeholder="Calle de Peña Gorbea 1, Madrid" required ng-model=formSearch.search> <span class=input-group-btn><button type=submit class="btn btn-primary"><span class="glyphicon glyphicon-search"></span></button></span></p><ul class=list-group style=font-size:10px ng-if="searchResults.length > 0"><li class=list-group-item ng-repeat="result in searchResults"><span ng-click=selectAddress(result)>{{result.display_name}}</span></li><li></li></ul><ul class=list-group style=font-size:10px ng-if="searchResults.length == 0 && submitted"><li class=list-group-item>No hay resultados, cambia la dirección</li><li></li></ul></form></div></li></ul></div></div></div></div>'),a.put("app/quiz/list-admin.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><!-- Begin page content --><div class=container><div class=page-header><h1>Administración de preguntas</h1></div></div><div class=container><div class="col-xs-12 col-sm-12 col-md-8 col-lg-8"><ul class="list-group quizzes"><li class=list-group-item ng-repeat="quiz in quizes"><a href=/quizzes/{{quiz.quizId}} title=Consultar class="btn btn-xs btn-disabled pull-left" style=font-size:20px>#{{quiz.quizId}}</a><label ng-dblclick=editQuiz(quiz) ng-if="edit===undefined || (edit!==undefined && edit.quizId!=quiz.quizId)">{{quiz.pregunta}}<br><span>{{quiz.respuesta}}</span></label><form name=formQuiz class=form-inline ng-submit=saveEditQuiz(quiz) ng-if="edit!==undefined && edit.edit && edit.quizId==quiz.quizId" novalidate><div class=form-group><input name=pregunta class=form-control ng-model=quiz.pregunta placeholder="Aquí la pregunta" ng-value=quiz.pregunta required> <input name=respuesta class=form-control ng-model=quiz.respuesta placeholder="Aquí la respuesta" ng-value=quiz.respuesta required> <button type=submit class="btn btn-primary">Guardar</button> {{errors}}</div><a href=# ng-click=noEditQuiz(quiz) title=Editar><span class="glyphicon glyphicon-repeat pull-right"></span></a></form><a href=# ng-click=delete(quiz) title=Eliminar ng-if="edit===undefined || (edit!==undefined && edit.quizId!=quiz.quizId)"><span class="glyphicon glyphicon-remove pull-right"></span></a> <a href=# ng-click=editQuiz(quiz) title=Editar ng-if="edit===undefined || (edit!==undefined && edit.quizId!=quiz.quizId)"><span class="glyphicon glyphicon-edit pull-right"></span></a> <a href=# ng-click=toggleComment(quiz.quizId) ng-if="quiz.comments.length > 0" title="{{quiz.comments.length}} comentarios"><span class=pull-right style=padding:0px;font-size:10px>{{quiz.comments.length}}</span> <span class="glyphicon glyphicon-comment pull-right"></span></a><ul class="list-group comments hide" id=comments_{{quiz.quizId}} ng-if="quiz.comments.length > 0"><li class=list-group-item ng-repeat="comment in quiz.comments"><span class=muted>{{comment.createdAt | date:\'yy/MM/yyyy\'}}</span> <strong ng-if=comment.site><a href={{comment.site}}>{{comment.nombre}}...</a></strong> <strong ng-if=!comment.site>{{comment.nombre}}...</strong> {{comment.comentario}} <a href=# ng-click="deleteComment(comment, quiz)" title=Eliminar><span class="glyphicon glyphicon-remove pull-right"></span></a> <a href=# ng-click=activeComment(comment) class="glyphicon glyphicon-chevron-down pull-right" title="Deshabilitar comentario" ng-if=comment.active></a> <a href=# ng-click=activeComment(comment) class="glyphicon glyphicon-ban-circle pull-right" title="Habilitar comentario" ng-if=!comment.active></a><hr></li></ul></li></ul></div><div class="col-xs-12 col-sm-12 col-md-4 col-lg-4"><ul class=list-group><li class=list-group-item><strong>Nueva pregunta</strong> <a href=# ng-click=showAddForm()><span class="glyphicon glyphicon-plus pull-right showAddForm"></span></a><div id=add-quiz class=hide><form name=formQuiz ng-submit=addQuiz(quiz) novalidate><div class=form-group ng-class="{\'has-error\': formQuiz.pregunta.$invalid && submitted }"><input name=pregunta class=form-control ng-model=quiz.pregunta placeholder=Pregunta ng-value=quiz.pregunta required><p class=help-block ng-show="formQuiz.pregunta.$error.required && submitted">La pregunta es un campo obligatorio</p></div><div class=form-group ng-class="{\'has-error\': formQuiz.respuesta.$invalid && submitted }"><input name=respuesta class=form-control ng-model=quiz.respuesta placeholder=Respuesta ng-value=quiz.respuesta required><p class=help-block ng-show="formQuiz.respuesta.$error.required && submitted">La respuesta es un campo obligatorio</p></div><div class=form-group ng-class="{\'has-error\': formQuiz.tema.$invalid && submitted }"><select class=form-control name=tema ng-model=quiz.tema ng-value=quiz.tema required><option value="">Selecciona la temática</option><option ng-repeat="tema in temas" value={{tema}}>{{tema}}</option></select><p class=help-block ng-show="formQuiz.respuesta.$error.required && submitted">La temática es un campo obligatorio</p></div><button type=submit class="btn btn-primary">Enviar</button></form></div></li></ul><ul class=list-group><li class=list-group-item ng-click=showStats()><strong>Estadísticas</strong> <a href=#><span class="glyphicon glyphicon-plus pull-right showStats"></span></a><div id=stats-quiz class=hide><ul class=list-group><li class=list-group-item ng-repeat="stat in stats">{{stat}}</li></ul></div></li></ul></div></div>'),a.put("app/quiz/quiz.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><!-- Begin page content --><div class=container><div class=page-header><h1>Pregunta #{{quiz.quizId}}<span>Prueba tus conocimientos</span></h1></div></div><div class=container><div class=row><div class=col-lg-12><ul class="nav nav-stacked col-md-8 col-lg-6 col-sm-8"><li><form name=formQuiz ng-submit="validateQuiz(formQuiz, quiz)"><legend>{{quiz.pregunta}}<span class=tematica>{{quiz.tema}}<span></span></span></legend><p class=input-group ng-if="quizFB === undefined || quizFB.id!=quiz.quizId"><input class=form-control placeholder="responde aquí" required ng-model=formQuiz.respuesta> <span class=input-group-btn><button type=submit class="btn btn-primary">Contestar</button></span></p><div ng-if="quizFB !==undefined && !quizFB.ok && quizFB.id==quiz.quizId" class="alert alert-danger"><p><strong>{{quizFB.respuesta}}</strong> no es correcto! <a href=# ng-click=repeatQuiz(formQuiz) title="Intentar de nuevo" ng-if=!comment.active><span class="glyphicon glyphicon-repeat pull-right"></span></a></p></div><div ng-if="quizFB !==undefined && quizFB.ok && quizFB.id==quiz.quizId" class="alert alert-success"><p><strong>{{quizFB.respuesta}}</strong> es correcto</p></div></form><div class=comentario ng-repeat="comment in quiz.comments" ng-if=comment.active id=comentario{{comment._id}}><legend><strong ng-if=comment.site><a href={{comment.site}}>{{comment.nombre}}...</a></strong> <strong ng-if=!comment.site>{{comment.nombre}}...</strong> <span class=tematica>{{comment.createdAt | date:\'yy/MM/yyyy\'}}</span></legend><p>{{comment.comentario}}</p></div><div class=add-comentario><form name=formComment ng-submit=addComment(formComment,quiz) novalidate><legend>Añadir un comentario</legend><div class="alert {{classFeedback}}" ng-if=msgComment><p>{{msgComment}}</p><ul><li ng-repeat="error in errors">{{error.message}}</li></ul></div><div class=form-group><label for="">Nombre</label><input class=form-control placeholder=Nombre ng-model=formComment.nombre></div><div class=form-group ng-class="{\'has-error\': formComment.site.$invalid && submitted }"><label for="">Página web</label><input class=form-control placeholder="Página web" ng-model=formComment.site></div><div class=form-group ng-class="{\'has-error\': formComment.comentario.$invalid && submitted }"><label for="">Comentario <span>(Obligatorio)</span></label><textarea ng-model=formComment.comentario class=form-control rows=3 maxlength=250 ng-change=controlLength(formComment.comentario) required></textarea><p class="pull-right muted"><span id=commentLength>250</span> caracteres</p></div><button type=submit class="btn btn-primary">Enviar</button></form></div></li></ul></div></div></div>'),
a.put("app/quiz/quizzes.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><!-- Begin page content --><div class=container><div class=page-header><h1>Preguntas<span>Prueba tus conocimientos</span></h1></div></div><div class=container><div class=row><div class=col-lg-12><ul class="nav nav-stacked col-md-8 col-lg-8 col-sm-8" ng-repeat="quiz in quizes"><form name=formQuiz ng-submit="validateQuiz(formQuiz, quiz)"><legend><span><a href="{{ \'/quizzes/\' + quiz.quizId }}">#{{quiz.quizId}}</a></span> {{quiz.pregunta}} <span class=tematica>{{quiz.tema}}<span></span></span></legend><p class=input-group ng-if="quizFB === undefined || quizFB.id!=quiz.quizId"><input class=form-control placeholder="responde aquí" required ng-model=formQuiz.respuesta> <span class=input-group-btn><button type=submit class="btn btn-primary">Contestar</button></span></p><div ng-if="quizFB !==undefined && !quizFB.ok && quizFB.id==quiz.quizId" class="alert alert-danger"><p><strong>{{quizFB.respuesta}}</strong> no es correcto! <a href=# ng-click=repeatQuiz(formQuiz) title="Intentar de nuevo" ng-if=!comment.active><span class="glyphicon glyphicon-repeat pull-right"></span></a></p></div><div ng-if="quizFB !==undefined && quizFB.ok && quizFB.id==quiz.quizId" class="alert alert-success"><p><strong>{{quizFB.respuesta}}</strong> es correcto</p></div></form></ul></div></div></div>'),a.put("components/footer/footer.html",'<div class=container><p>Angular Fullstack v3.0.0-rc4 | <a href=https://twitter.com/tyhenkel>@tyhenkel</a> | <a href="https://github.com/DaftMonk/generator-angular-fullstack/issues?state=open">Issues</a></p></div>'),a.put("components/modal/modal.html",'<div class=modal-header><button ng-if=modal.dismissable type=button ng-click=$dismiss() class=close>&times;</button><h4 ng-if=modal.title ng-bind=modal.title class=modal-title></h4></div><div class=modal-body><p ng-if=modal.text ng-bind=modal.text></p><div ng-if=modal.html ng-bind-html=modal.html></div></div><div class=modal-footer><button ng-repeat="button in modal.buttons" ng-class=button.classes ng-click=button.click($event) ng-bind=button.text class=btn></button></div>'),a.put("components/navbar/navbar.html",'<div class="navbar navbar-default navbar-fixed-top" ng-controller=NavbarCtrl><div class=container><div class=navbar-header><button class=navbar-toggle type=button ng-click="isCollapsed = !isCollapsed"><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button> <a class=navbar-brand href="/" title="El portal donde puedes crear tus propios juegos"><img src="img/favicon.ico">Quiz</a></div><div collapse=isCollapsed class="navbar-collapse collapse" id=navbar-main><ul class="nav navbar-nav"><li ng-repeat="item in menu" ng-class="{active: isActive(item.link)}"><a ng-href={{item.link}}>{{item.title}}</a></li><li ng-show=isAdmin() ng-class="{active: isActive(\'/admin\')}"><a href=/admin>Usuarios</a></li></ul><ul class="nav navbar-nav navbar-right"><li id=li_search_quiz class=hide><form action=/search-quiz class="navbar-form navbar-right" id=form_search_quiz role=form><div class="form-group form-inline"><input class=form-control name=search value={{search}} id=search_input required placeholder="Busqueda de preguntas"></div></form></li><li><a href=# ng-click=searchQuiz() title="Busqueda de preguntas"><span class="glyphicon glyphicon-search"></span></a></li><li ng-hide=isLoggedIn() ng-class="{active: isActive(\'/author\')}"><a href=/author title=READ.me><span class="glyphicon glyphicon-file"></span></a></li><li ng-hide=isLoggedIn() ng-class="{active: isActive(\'/signup\')}"><a href=/signup title=Registro><span class="glyphicon glyphicon-log-in"></span></a></li><li ng-hide=isLoggedIn() ng-class="{active: isActive(\'/login\')}"><a href=/login title=Login><span class="glyphicon glyphicon-off"></span></a></li><li ng-show=isLoggedIn()><p class=navbar-text>Hola {{ getCurrentUser().name }}</p></li><li ng-show=isLoggedIn() ng-class="{active: isActive(\'/settings\')}"><a href=/settings><span class="glyphicon glyphicon-cog"></span></a></li><li ng-show=isLoggedIn() ng-class="{active: isActive(\'/logout\')}"><a href=# ng-click=logout() title=Logout><span class="glyphicon glyphicon-off"></span></a></li></ul></div></div></div>')}]);