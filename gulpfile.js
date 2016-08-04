"use strict";

var gulp = require("gulp");  // Подключаем Gulp
var sass = require("gulp-sass");  // Подключаем Sass-пакет
var plumber = require("gulp-plumber"); //Подключаем Пламбер
var postcss = require("gulp-postcss"); //Подключаем postcss
var autoprefixer = require("autoprefixer");  //Подключаем автопрефиксы
var gutil = require("gulp-util");
var minify = require("gulp-csso"); //Подключаем плагин для сжатия css
var rename = require("gulp-rename"); //Подключаем плагин для переименования
var imagemin = require("gulp-imagemin"); //Подключаем плагин для сжатия картинок
var svgmin = require("gulp-svgmin"); //Подключаем плагин для сжатия svg
var svgstore = require("gulp-svgstore"); //Подключаем для создания svg-спрайта

var mqpacker = require("css-mqpacker");
var run = require("run-sequence"); //Плагин для последовательной работы тасков
var del = require("del"); //Плагин для удаления файлов
var server = require("browser-sync"); //Подключаем браузер-синк(слежение в браузере)

// Компиляция таска style
gulp.task("style", function() { //Создаём таск "style"
  gulp.src("app/sass/style.scss")   //Берём все файлы sass для обработки
    .pipe(plumber()) //Запрещаем ошибкам прерывать скрипт
    .pipe(sass())   //Преобразуем Sass в CSS
    .pipe(postcss([  //Добавляем префиксы под разные версии
      autoprefixer({browsers: [
        "last 2 version",  // IE 10+
        "last 2 Chrome versions",
        "last 2 Firefox versions",
        "last 2 Opera versions",
        "last 2 Edge versions"
      ]}),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(gulp.dest("build/css"))  //Выгружаем результаты в папку CSS
    .pipe(minify())  //Делаем минификацию кода
    .pipe(rename("style.min.css")) //переименовываем файл style в style.min
    .pipe(gulp.dest("build/css")) //выгружаем в build/css
    .pipe(server.reload({stream: true})); //После сборки делаем перезагрузку страницы
});

// Компиляция таска serve
gulp.task("serve", function() {
  server.init({
    server: "build",
    notify: false,
    open: true,
    ui: false
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"]);  //Наблюдение за scss файлами в папке scss
  gulp.watch("js/**/*.js");  //Наблюдение за js файлами в папке проекта
  gulp.watch("*.html").on("change", server.reload); //Наблюдение за html файлами в папке проекта
});
// ====================================================
// ====================================================
// ================= Сборка проекта BUILD =============

// Чистка папки
gulp.task("clean", function () {
  return del("build");
});

// Копируем файлы в папку build
gulp.task("copy", function () {
  return gulp.src([
    "app/js/**",
    "app/fonts/**/*.{woff,woff2}",
    "app/img/**/*",
    "app/*.html",
    "app/libs/**"
  ], {
    base: "app"
  })
    .pipe(gulp.dest("build"));
});
// Оптимизация картинок
gulp.task("images", function () {
  return gulp.src("build/img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest("build/img"));
});


// Оптимизируем svg картинки и собираем спрайт
gulp.task("symbols", function() {
  return gulp.src("build/img/icons/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("build/img"));
});

// Остальные файлы, такие как favicon.ico и пр.
gulp.task("extras", function () {
  return gulp.src([
    "app/*.*",
    "!app/*.html"
  ])
  .pipe(gulp.dest("build"));
});

// Собираем папку BUILD
gulp.task("build", function (fn) {
  run(
    "clean",
    "copy",
    "style",
    "images",
    "symbols",
    "extras",
    fn
  );
});
