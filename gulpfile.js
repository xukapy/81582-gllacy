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
var concat = require("gulp-concat") // для конкатинации файлов
var uglify = require("gulp-uglifyjs") //для сжатия всех скриптов
var mqpacker = require("css-mqpacker");
var run = require("run-sequence"); //Плагин для последовательной работы тасков
var del = require("del"); //Плагин для удаления файлов
var server = require("browser-sync"); //Подключаем браузер-синк(слежение в браузере)

gulp.task("style", function() { //Создаём таск "style"
  gulp.src("app/css/normalize.css")
    .pipe(gulp.dest("build/css"));
  gulp.src("app/sass/style.scss")   //Берём файл sass для обработки
    .pipe(plumber()) //Запрещаем ошибкам прерывать скрипт
    .pipe(sass())   //Преобразуем Sass в CSS
    .pipe(postcss([  //Добавляем префиксы под разные версии
      autoprefixer({browsers: [
        "last 1 version",
        "last 2 Chrome versions",
        "last 2 Firefox versions",
        "last 2 Opera versions",
        "last 2 Edge versions"
      ]}),
      mqpacker({
        sort: true //соеденяем все медиазапросы
      })
    ]))
    .pipe(gulp.dest("build/css"))  //Выгружаем результаты в папку CSS
    .pipe(minify())  //Делаем минификацию кода
    .pipe(rename("style.min.css")) //переименовываем файл style в style.min
    .pipe(gulp.dest("build/css")) //выгружаем в build/css
    .pipe(server.reload({stream: true})); //После сборки делаем перезагрузку страницы
});

gulp.task("serve",  function() {
  server.init({
    server: "build",
    notify: false,
    open: true,
    ui: false
  });
  gulp.watch("app/sass/**/*.{scss,sass}", ["style"]);  //Наблюдение за scss файлами в папке scss
  gulp.watch("app/js/**/*.js");  //Наблюдение за js файлами в папке проекта
  gulp.watch("app/*.html").on("change", server.reload); //Наблюдение за html файлами в папке проекта
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
// Подключаем минифицированные js-библиотеки
gulp.task("scripts", function() {
  return gulp.src([
    "app/libs/jquery/dist/jquery.min.js",
    "app/libs/magnific-popup/dist/jquery.magnific-popup.min.js",
  ])
  .pipe(concat("libs.min.js"))
  .pipe(uglify())
  .pipe(gulp.dest("app/js"));
});
//Подключаем минифицированные css-библиотеки
gulp.task("css-libs", function() {
  return gulp.src("app/css/libs.css") //берём файл в app/css
  .pipe(minify())
  .pipe(rename("libs.min.css")) //переименовываем файл style в style.min
  .pipe(gulp.dest("app/css")) //выгружаем в app/css
})
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
