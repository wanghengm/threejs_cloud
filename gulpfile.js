const { src, dest, parallel } = require('gulp');
const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const inject = require('gulp-inject');
const browserSync = require('browser-sync').create();
const del = require('del');
const cssnano = require('gulp-cssnano') //压缩css 
const imagemin = require('gulp-imagemin'); //图片压缩
const concat = require('gulp-concat') //合并js 
const uglify = require('gulp-uglify') //压缩js

const serverConfig = { 
    port: 8888, // 端口号
};

//监视文件， 自动执行
gulp.task('js', async () => {
    await gulp.src(['src/js/*/*.js', 'src/js/*.js', '!src/js/home.js']).pipe(babel()).pipe(dest('.tmp/js'));
});

// gulp.task('toes6', () => {
//     gulp.src('./.rjs/index.js') //把已经require化的所有js文件的入口文件index.js 进行 browserify 处理和 babel处理 ，最终实现对es6语法的编译
//         .pipe(browserify({
//             insertGlobals: true,
//             debug: !gulp.env.production,
//             ignore: ['jquery-3.2.1.min.js']
//         }))
//         .pipe(babel({
//             babelrc: false,
//             presets: ['es2015', 'es2016', 'es2017', 'stage-0', 'react'],
//             plugins: ['transform-decorators-legacy']
//         }))
//         .pipe(uglify())
//         .pipe(gulp.dest('js'))
// })　　

// //监视文件， 自动执行
// gulp.task('images', async () => {
//     gulp.src(['src/images/*.+(png| jpg | jpeg | gif | svg)', 'src/images/*/*.jpg']) 
//     .pipe(dest('.tmp/images'))         
//     .pipe(browserSync.reload({ 
//         stream: true }) 
//     );
// });

const html = () => {
    return gulp.src('./src/index.html').pipe(inject(src(['.tmp/js/*.js'], { read: false, }),{
        ignorePath: ['.tmp'], //去除tmp
        addRootSlash: false,
    })).pipe(dest('.tmp/')).pipe(browserSync.reload({
        stream: true,
    }));
}

// //监视文件， 自动执行
// gulp.task('scss', async () => {
//     gulp.src('./src/index.scss') 
//     .pipe(sass()) 
//     .pipe(dest('./.tmp/')) 
//     .pipe(browserSync.reload({
//      stream: true 
//     })); 
// });

const scss = () => {
    return gulp.src('./src/index.scss') 
    .pipe(sass()) 
    .pipe(dest('./.tmp/')) 
    .pipe(browserSync.reload({
     stream: true 
    })); 
}

const images = () => {
    return gulp.src(['src/images/*.+(png| jpg | jpeg | gif | svg)', 'src/images/*/*.jpg', 'src/images/*/*.png']) 
    .pipe(dest('.tmp/images'))         
    .pipe(browserSync.reload({ 
        stream: true }) 
    );
}

gulp.task('watchs', async () => {
    gulp.watch('src/index.html', html);
    gulp.watch(['src/scss/*.scss', 'src/*.scss'], scss);
    gulp.watch('src/js/*.js',async ()=>{ js });
    gulp.watch(['src/images/*.*','src/images/*/*.*'], images);
    await browserSync.init(Object.assign({
        files: "**",
        server: { baseDir: '.tmp' }
    }, serverConfig));
});

const baleJs = () => {
    return gulp.src('src/js/*.js').pipe(concat('index.js')).pipe(babel({
        "presets": ["env"] 
    })).pipe(uglify())//压缩js 
    .pipe(dest('dist/'));
}

const baleScss = () => {
    return gulp.src('./src/index.scss') 
    .pipe(sass()) 
    .pipe(cssnano())//压缩css 
    .pipe(dest('./dist/'));
}

const baleImages = () => {
    return gulp.src(['src/images/*', 'src/images/*/*'])
    .pipe(imagemin())//压缩图片
    .pipe(dest('dist/images'));
}

const baleHtml = () => {
    return gulp.src('src/index.html') 
    .pipe(inject(src(['dist/index.js']), { 
    ignorePath: ['dist'], //去除dist 
    addRootSlash: false, //去除/ 
    })).pipe(dest('dist/'));
}

const naleDelete=()=> del(['dist']);
//启动开发环境
gulp.task('default', gulp.series(gulp.parallel('js', scss, images), html, 'watchs'));
gulp.task('build', gulp.series(naleDelete, parallel(baleJs, baleScss, baleImages), baleHtml));