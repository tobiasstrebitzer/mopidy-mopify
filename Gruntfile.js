module.exports = function ( grunt ) {

    /**
      * Load required Grunt tasks. These are installed based on the versions listed
      * in `package.json` when you do `npm install` in this directory.
      */
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-electron-packager');
    grunt.loadNpmTasks('grunt-ngmin');

    var os = require( 'os' )

     /**
      * Load in our build configuration file.
      */
    var userConfig = require( './build.config.js' );

    /**
      * This is the configuration object Grunt uses to give each plugin its
      * instructions.
      */
    var taskConfig = {

        /**
          * We read in our `package.json` file so we can access the package name and
          * version. It's already there, so we don't repeat ourselves here.
          */
        pkg: grunt.file.readJSON("package.json"),

        /**
          * The banner is the comment that is placed at the top of our compiled
          * source files. It is first processed as a Grunt template, where the `<%=`
          * pairs are evaluated based on this very configuration object.
          */
        meta: {
            banner:
                '/**\n' +
                ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                ' * <%= pkg.homepage %>\n' +
                ' *\n' +
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                ' * Licensed <%= pkg.licenses.type %> <<%= pkg.licenses.url %>>\n' +
                ' */\n'
        },

        /**
          * Creates a changelog on a new version.
          */
        changelog: {
            options: {
                dest: 'CHANGELOG.md',
                template: 'changelog.tmpl'
            }
        },

        /**
          * The `index` task compiles the `index.html` file as a Grunt template. CSS
          * and JS files co-exist here but they get split apart later.
          */
        index: {
            /**
              * During development, we don't want to have wait for compilation,
              * concatenation, minification, etc. So to avoid these steps, we simply
              * add all script files directly to the `<head>` of `index.html`. The
              * `src` property contains the list of included files.
            */
            build: {
                dir: '<%= build_dir %>',
                src: [
                    '<%= vendor_files.js %>',
                    '<%= build_dir %>/src/app/**/*.js',
                    '<%= html2js.app.dest %>',
                    '<%= vendor_files.css %>',
                    '<%= build_dir %>/src/css/**/*.css',
                ]
            },

             /**
              * When it is time to have a completely compiled application, we can
              * alter the above to include only a single JavaScript and a single CSS
              * file. Now we're back!
              */
            compile: {
                dir: '<%= compile_dir %>',
                src: [
                    '<%= concat.compile_js.dest %>',
                    '<%= concat.compile_css.dest %>'
                ]
            }
        },

        /**
          * The `copy` task just copies files from A to B. We use it here to copy
          * our project assets (images, fonts, etc.) and javascripts into
          * `build_dir`, and then to copy the assets to `compile_dir`.
          */
        copy: {
            build_app_assets: {
                files: [
                    {
                        src: [ '**' ],
                        dest: '<%= build_dir %>/assets/',
                        cwd: 'src/assets',
                        expand: true
                    }
                ]
            },
            build_vendor_assets: {
                files: [
                    {
                        src: [ '<%= vendor_files.assets %>' ],
                        dest: '<%= build_dir %>/assets/',
                        cwd: '.',
                        expand: true,
                        flatten: true
                    }
                ]
            },
            build_vendor_fonts: {
                files: [
                    {
                        src: [ '<%= vendor_files.fonts %>' ],
                        dest: '<%= build_dir %>/assets/webfonts/',
                        cwd: '.',
                        expand: true,
                        flatten: true
                    }
                ]
            },
            build_appjs: {
                files: [
                    {
                        src: [ '<%= app_files.js %>' ],
                        dest: '<%= build_dir %>/',
                        cwd: '.',
                        expand: true
                    }
                ]
            },
            build_appcss: {
                files: [
                    {
                        src: [ '<%= app_files.css %>' ],
                        dest: '<%= build_dir %>/',
                        cwd: '.',
                        expand: true
                    }
                ]
            },
            build_vendorjs: {
                files: [
                    {
                        src: [ '<%= vendor_files.js %>' ],
                        dest: '<%= build_dir %>/',
                        cwd: '.',
                        expand: true
                    }
                ]
            },
            build_vendorcss: {
                files: [
                    {
                        src: [ '<%= vendor_files.css %>' ],
                        dest: '<%= build_dir %>/',
                        cwd: '.',
                        expand: true
                    }
                ]
            },
            compile_assets: {
                files: [
                    {
                        src: [ '**' ],
                        dest: '<%= compile_dir %>/assets',
                        cwd: '<%= build_dir %>/assets',
                        expand: true
                    }
                ]
            },
            build_for_mopidy: {
                files: [
                    {
                        src: [ '**' ],
                        dest: '<%= mopidy_package_dir %>/static/min',
                        cwd: '<%= compile_dir %>',
                        expand: true
                    },
                    {
                        src: [ '**' ],
                        dest: '<%= mopidy_package_dir %>/static/debug',
                        cwd: '<%= build_dir %>',
                        expand: true
                    }
                ]
            },
            electron: {
                files: [
                    {
                        src: [ '**' ],
                        cwd: 'dist/assets/',
                        dest: 'electron/build/assets/',
                        expand: true
                    },
                ]
            }
        },


        /**
          * `grunt concat` concatenates multiple source files into a single file.
          */
        concat: {
            /**
              * The `build_css` target concatenates app CSS and vendor CSS
              * together.
              */
            compile_css: {
                options: {
                    stripBanners: {
                        block: true,
                        line: true
                    },
                    banner: '<%= meta.banner %>'
                },
                src: [
                    '<%= vendor_files.css %>',
                    '<%= app_files.css %>'
                ],
                dest: '<%= compile_dir %>/assets/css/<%= pkg.name %>-<%= pkg.version %>.css'
            },

            /**
              * The `compile_js` target is the concatenation of our application source
              * code and all specified vendor source code into a single file.
              */
            compile_js: {
                options: {
                    banner: '<%= meta.banner %>',
                    separator: ';',
                },
                src: [
                    '<%= vendor_files.js %>',
                    '<%= html2js.app.dest %>',
                    '<%= build_dir %>/src/**/*.js'
                ],
                dest: '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.js'
            },
        },

        /**
          * Minify all javascript sources
          */
        uglify: {
            compile: {
                options: {
                    sourceMap: true,
                    banner: '<%= meta.banner %>'
                },
                files: {
                    '<%= concat.compile_js.dest %>': '<%= concat.compile_js.dest %>'
                }
            }
        },

        /**
          * Minify all css sources
          */
        cssmin: {
            combine: {
                options: {
                    keepSpecialComments: '0',
                    banner: '<%= meta.banner %>'
                },
                files: {
                    '<%= concat.compile_css.dest %>': '<%= concat.compile_css.dest %>'
                }
            }
        },

        /**
          * The directories to delete when `grunt clean` is executed.
          */
        clean: {
            options: {
                force: true
            },
            build: [ '<%= build_dir %>' ],
            compile: [ '<%= compile_dir %>' ],
            mopidy: [ '<%= mopidy_package_dir %>/static', '<%= mopidy_package_dir %>/__init__.py', '<%= mopidy_package_dir %>/ext.conf' ]
        },

        /**
          * And for rapid development, we have a watch set up that checks to see if
          * any of the files listed below change, and then to execute the listed
          * tasks when they do. This just saves us from having to type "grunt" into
          * the command-line every time we want to see what we're working on; we can
          * instead just leave "grunt watch" running in a background terminal. Set it
          * and forget it, as Ron Popeil used to tell us.
          *
          * But we don't need the same thing to happen for all the files.
          */
        delta: {
            /**
            * By default, we want the Live Reload to work for all tasks; this is
            * overridden in some tasks (like this file) where browser resources are
            * unaffected. It runs by default on port 35729, which your browser
            * plugin should auto-detect.
            */
            options: {
                livereload: true
            },

            /**
            * When our JavaScript source files change, we want to run lint them and
            * run our unit tests.
            */
            jssrc: {
                files: [
                    '<%= app_files.js %>'
                ],
                tasks: [ 'jshint:src', 'copy:build_appjs' ]
            },

            /**
            * When the CSS files change, we need to compile and minify them.
            */
            css: {
                files: [ 'src/**/*.css' ],
                tasks: [ 'copy:build_appcss' ]
            },

            /**
              * When our templates change, we only rewrite the template cache.
              */
            tpls: {
                files: [
                    '<%= app_files.atpl %>'
                ],
                tasks: [ 'html2js' ]
            },

            /**
            * When assets are changed, copy them. Note that this will *not* copy new
            * files, so this is probably not very useful.
            */
            assets: {
                files: [
                    'src/assets/**/*'
                ],
                tasks: [ 'copy:build_app_assets' ]
            },

            /**
            * When index.html changes, we need to compile it.
            */
            html: {
                files: [ '<%= app_files.html %>' ],
                tasks: [ 'index:build' ]
            },
        },

        /**
          * HTML2JS is a Grunt plugin that takes all of your template files and
          * places them into JavaScript files as strings that are added to
          * AngularJS's template cache. This means that the templates too become
          * part of the initial payload as one JavaScript file. Neat!
          */
        html2js: {

            /**
            * These are the templates from `src/app`.
            */
            app: {
                options: {
                    base: 'src/app'
                },
                src: [ '<%= app_files.atpl %>' ],
                dest: '<%= build_dir %>/templates-app.js'
            }
        },

        /**
          * With connect we start a webserver on port 8000 which will have the build
          * directory as it's root
          */
        connect: {
            development: {
                options: {
                    port: 8000,
                    base: 'build',
                    hostname: '*'
                }
            },
            test: {
                options: {
                    port: 8000,
                    base: 'dist',
                    hostname: '*'
                }
            }
        },

      /**
		  * `jshint` defines the rules of our linter as well as which files we
		  * should check. This file, all javascript sources, and all our unit tests
		  * are linted based on the policies listed in `options`. But we can also
		  * specify exclusionary patterns by prefixing them with an exclamation
		  * point (!); this is useful when code comes from a third party but is
		  * nonetheless inside `src/`.
		  */
		jshint: {
			src: [
				'<%= app_files.js %>'
			],
			options: {
				jshintrc: '.jshintrc',
        browser: true
			}
		},

        /**
          * `ng-min` annotates the sources before minifying. That is, it allows us
          * to code without the array syntax.
          */
        ngmin: {
            compile: {
                files: [
                    {
                        src: [ '<%= app_files.js %>' ],
                        cwd: '<%= build_dir %>',
                        dest: '<%= build_dir %>',
                        expand: true
                    }
                ]
            }
        },

        'electron-packager': {
            build: {
                options:{
                    platform: os.platform(),
                    arch: os.arch(),
                    dir: './electron/build',
                    out: './electron/dist',
                    icon: './electron/resources/icon.icns',
                    name: 'Mopify',
                    asar: true,
                    overwrite: true
                }
            }
        }
    };

    grunt.initConfig( grunt.util._.extend( taskConfig, userConfig ) );

    /**
      * In order to make it safe to just compile or copy *only* what was changed,
      * we need to ensure we are starting from a clean, fresh build. So we rename
      * the `watch` task to `delta` (that's why the configuration var above is
      * `delta`) and then add a new task called `watch` that does a clean build
      * before watching for changes.
      */
    grunt.renameTask( 'watch', 'delta' );
    grunt.registerTask( 'watch', [ 'build', 'connect:development', 'delta' ] );

    /**
      * The `build` task gets your app ready to run for development and testing.
      */
    grunt.registerTask( 'build', [
        'clean:build', 'html2js', 'jshint:src',
        'copy:build_app_assets', 'copy:build_vendor_assets', 'copy:build_vendorcss',
        'copy:build_vendor_fonts',
        'copy:build_appjs', 'copy:build_appcss', 'copy:build_vendorjs', 'index:build'
    ]);

    /**
     * Register the tasks for Grunt
     */
    grunt.registerTask( 'compile', [
        'clean:compile', 'copy:compile_assets', 'ngmin', 'concat:compile_js', 'concat:compile_css', 'cssmin:combine', 'index:compile', 'uglify'
    ]);

     /**
      * The `build-mopidy-extension` task builds Mopidy extension package
      */
    grunt.registerTask( 'package', [ 'clean:mopidy', 'build', 'compile', 'copy:build_for_mopidy', 'mopidypackageversion' ] );

    /**
     * Task to start a webserver on the dist directory
     */
    grunt.registerTask( 'run', [ 'build', 'compile', 'connect:test:keepalive' ] );

    /**
     * The default tasks to run.
     */
    grunt.registerTask( 'default', [ 'build', 'compile' ] );

    /**
     * Package electron standalone app.
     */
    grunt.registerTask( 'electron', [ 'default', 'copy:electron', 'electron-packager:build' ] );

    /**
      * The index.html template includes the stylesheet and javascript sources
      * based on dynamic names calculated in this Gruntfile. This task assembles
      * the list into variables for the template to use and then runs the
      * compilation.
    */
    grunt.registerMultiTask( 'index', 'Process index.html template', function () {
        var dirRE = new RegExp( '^(' + grunt.config('build_dir') + '|' + grunt.config('compile_dir') + ')\/', 'g' );

        var jsFiles = filterForJS( this.filesSrc ).map( function ( file ) {
            return file.replace( dirRE, '' );
        });

        var cssFiles = filterForCSS( this.filesSrc ).map( function ( file ) {
            return file.replace( dirRE, '' );
        });

        grunt.file.copy('src/index.html', this.data.dir + '/index.html', {
            process: function ( contents, path ) {
                return grunt.template.process( contents, {
                    data: {
                        scripts: jsFiles,
                        styles: cssFiles,
                        version: grunt.config( 'pkg.version' )
                    }
                });
            }
        });
    });

    grunt.registerTask( 'mopidypackageversion', 'Create a mopidy package', function () {
        grunt.file.copy('__init__.py.tmpl', grunt.config( 'mopidy_package_dir' ) + '/__init__.py', {
            process: function ( contents, path ) {
                return grunt.template.process( contents, {
                    data: {
                        version: grunt.config( 'pkg.version' )
                    }
                });
            }
        });
        grunt.file.copy('ext.conf', grunt.config( 'mopidy_package_dir' ) + '/ext.conf');
    });


    /**
      * A utility function to get all app JavaScript sources.
      */
    function filterForJS ( files ) {
        return files.filter( function ( file ) {
            return file.match( /\.js$/ );
        });
    }

    /**
      * A utility function to get all app CSS sources.
      */
    function filterForCSS ( files ) {
        return files.filter( function ( file ) {
            return file.match( /\.css$/ );
        });
    }
};