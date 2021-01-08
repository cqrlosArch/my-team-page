//html
import htmlmin from 'gulp-htmlmin';
//css
import autoprefixer from 'autoprefixer';
import postcss from 'gulp-postcss';
import cssnano from 'cssnano';
//Js
import gulp from 'gulp';
import babel from 'gulp-babel';
import terser from 'gulp-terser';
//PUG
import pug from 'gulp-pug'
//Sass
import sass from 'gulp-sass'
//Clean CSS
import purgecss from 'gulp-purgecss'
//Caché bust
import cacheBust from 'gulp-cache-bust';
//Optimizacion Imagenes
import imageMin from 'gulp-imagemin';
//Browser-sync
import {init as server, stream, reload} from 'browser-sync'
//Gulp-plumber
import plumber from 'gulp-plumber';
//Common
import concat from 'gulp-concat';
import imagemin from 'gulp-imagemin';
const production=false
//Cariables/contantes
const cssPlugins= [
    cssnano(),
    autoprefixer()
]

//task html
gulp.task('html-min', () => {
    return gulp
        .src("./src/*.html")
        .pipe(plumber())
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(cacheBust({
            type: 'timestamp'
        }))
        .pipe(gulp.dest('./public'))
})

//task css
gulp.task('styles', () => {
    return gulp
        .src("./src/css/*.css")
        .pipe(plumber())
        //Quitar si no se quiere un .css único
            .pipe(concat('styles-min.css'))
        .pipe(postcss(cssPlugins))
        .pipe(gulp.dest('./public/css'))
        .pipe(stream())
})

//task Babel
gulp.task('babel', () => {
    return gulp
        .src("./src/js/*.js")
        .pipe(plumber())
        .pipe(concat('scripts-min.js'))
        .pipe(babel())
        .pipe(terser())
        .pipe(gulp.dest('./public/js'))
})

gulp.task('views', () => {
    return gulp
        .src('./src/views/pages/*.pug')
        .pipe(plumber())
        .pipe(pug({
            pretty: production ? false : true
        }))
        .pipe(cacheBust({
            type: 'timestamp'
        }))
        .pipe(gulp.dest('./public'))
})

gulp.task('sass', () => {
    return gulp
        .src('./src/scss/styles.scss')
        .pipe(plumber())
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(gulp.dest('./public/css'))
        .pipe(stream())
})

gulp.task('clean-css', () => {
    return gulp
        .src('./public/css/*.css')
        .pipe(plumber())
        .pipe(purgecss({
            content: ['./public/*.html']
        }))
        .pipe(gulp.dest('./public/css'))
})

gulp.task('imgMin',()=>{
    return gulp
        .src('./src/images/*')
        .pipe(plumber())
        .pipe(imageMin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(gulp.dest('./public/images'))
})


 
//Task Defaul (vigilante)
gulp.task('default', () =>{
    server({
        server:'./public'
    })
    //gulp.watch('./src/*.html', gulp.series('html-min')).on('change',reload)
    //gulp.watch('./src/css/*.css', gulp.series('styles'))
    gulp.watch('./src/views/**/*.pug', gulp.series('views')).on('change',reload)
    gulp.watch('./src/images/**/*.(svg|jpg|ico|png|jpeg)', gulp.series('imgMin'));
    gulp.watch('./src/scss/**/*.scss', gulp.series('sass'))
    gulp.watch('./src/js/*.js', gulp.series('babel')).on('change',reload)
})

export const build_html = gulp.series(gulp.series('styles','babel','html-min'), 'clean-css','imgMin');
export const build_pug = gulp.series(gulp.series('views','sass','babel'), 'clean-css','imgMin');
