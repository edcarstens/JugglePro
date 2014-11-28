module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-concat-sourcemap');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-watch');
    
    grunt.loadTasks('tasks');

    // Source files
    var srcFiles = [
	'<%= dirs.src %>/Jpro.js',
	'<%= dirs.src %>/gui/Gui.js',
	'<%= dirs.src %>/hands/Hand.js',
	'<%= dirs.src %>/hands/Handfun.js',
	'<%= dirs.src %>/math/Vec.js',
	'<%= dirs.src %>/math/Matrix.js',
	'<%= dirs.src %>/math/Rmatrix.js',
	'<%= dirs.src %>/patterns/ThrowSeq.js',
	'<%= dirs.src %>/patterns/Pattern.js',
	'<%= dirs.src %>/patterns/Routine.js',
	'<%= dirs.src %>/patterns/State.js',
	'<%= dirs.src %>/props/Prop.js',
	'<%= dirs.src %>/props/Ball.js',
	'<%= dirs.src %>/viewer/View.js',
	'<%= dirs.src %>/viewer/Viewer.js'
    ];
    banner = [
        '/**',
        ' * @license',
        ' * <%= pkg.name %> - v<%= pkg.version %>',
        ' * Copyright (c) 2014, Ed Carstens',
        ' * <%= pkg.homepage %>',
        ' *',
        ' * Compiled: <%= grunt.template.today("yyyy-mm-dd") %>',
        ' *',
        ' * <%= pkg.name %> is licensed under the <%= pkg.license %> License.',
        ' * <%= pkg.licenseUrl %>',
        ' */',
        ''
    ].join('\n');
    
    // Project configuration.
    grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	dirs: {
	    build: 'bin',
	    src: 'src',
	    test: 'test'
	},
	files: {
	    srcBlob: '<%= dirs.src %>/**/*.js',
	    testBlob: '<%= dirs.test %>/**/*.js',
	    testConf: '<%= dirs.test %>/karma.conf.js',
	    build: '<%= dirs.build %>/jpro.dev.js',
	    buildMin: '<%= dirs.build %>/pixi.js'
	},
	concat: {
	    options: {
		banner: banner
	    },
	    dist: {
		src: srcFiles,
		dest: '<%= files.build %>'
	    }
	},
        /* jshint -W106 */
        concat_sourcemap: {
            dev: {
                files: {
                    '<%= files.build %>': srcFiles
                },
                options: {
                    sourceRoot: '../'
                }
            }
        },
        jshint: {
            options: {
                jshintrc: './.jshintrc'
            },
            source: {
                src: srcFiles.concat('Gruntfile.js'),
                options: {
                    ignores: '<%= dirs.src %>/**/{Intro,Outro,Spine,Pixi}.js'
                }
            },
            test: {
                src: ['<%= files.testBlob %>'],
                options: {
                    ignores: '<%= dirs.test %>/lib/resemble.js',
                    jshintrc: undefined, //don't use jshintrc for tests
                    expr: true,
                    undef: false,
                    camelcase: false
                }
            }
        },
	uglify: {
	    options: {
		banner: banner
	    },
            dist: {
                src: '<%= files.build %>',
                dest: '<%= files.buildMin %>'
            }
	},
        connect: {
            test: {
                options: {
                    port: grunt.option('port-test') || 9002,
                    base: './',
                    keepalive: true
                }
            }
        },
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                logo: '<%= pkg.logo %>',
                options: {
                    paths: '<%= dirs.src %>',
                    outdir: '<%= dirs.docs %>'
                }
            }
        },
	
    });
    
    grunt.registerTask('default', ['build', 'test']);

    grunt.registerTask('build', ['jshint:source', 'concat', 'uglify']);
    grunt.registerTask('build-debug', ['concat_sourcemap', 'uglify']);

    grunt.registerTask('test', ['concat', 'jshint:test', 'karma']);

    grunt.registerTask('docs', ['yuidoc']);
    grunt.registerTask('travis', ['build', 'test']);

    grunt.registerTask('default', ['build', 'test']);
    
    grunt.registerTask('debug-watch', ['concat_sourcemap', 'watch:debug']);
};
