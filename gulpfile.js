"use strict";

var gulp = require("gulp");  // Подключаем Gulp
var sass = require("gulp-sass");  // Подключаем Sass-пакет
var plumber = require("gulp-plumber"); //Подключаем Пламбер
var postcss = require("gulp-postcss"); //Подключаем postcss
var autoprefixer = require("autoprefixer");  //Подключаем автопрефиксы
var server = require("browser-sync"); //Подключаем браузер-синк(слежение в браузере)

gulp.task("style", function() { //Создаём таск "style"
  gulp.src("app/sass/style.scss")   //Берём источник для обработки
    .pipe(plumber()) //Следим за ошибками и не прерываем скрипт
    .pipe(sass())   //Преобразуем Sass в CSS
    .pipe(postcss([  //Добавляем префиксы под разные версии
      autoprefixer({browsers: [
        "last 2 version",
        "last 2 Chrome versions",
        "last 2 Firefox versions",
        "last 2 Opera versions",
        "last 2 Edge versions"
      ]})
    ]))
    .pipe(gulp.dest("app/css"))  //Выгружаем результаты в папку CSS
    .pipe(server.reload({stream: true})); //После сборки делаем перезагрузку страницы
});

gulp.task("serve", ["style"], function() {
  server.init({
    server: "app",
    notify: false,
    open: true,
    ui: false
  });

  gulp.watch("app/sass/**/*.{scss,sass}", ["style"]);  //Наблюдение за scss файлами в папке scss
  gulp.watch("app/js/**/*.js");  //Наблюдение за js файлами в папке проекта
  gulp.watch("app/*.html").on("change", server.reload); //Наблюдение за html файлами в папке проекта
});
