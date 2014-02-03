module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify: {
            build: {
                files: {
                    'bundle.js': ['main.js']
                },
                options: {
                    'alias': ['native-buffer-browserify:buffer']
                }
            }
        },

        clean: {
            build: ['build'],
            dist: ['dist']
        },

        uglify: {
            build: {
                files: {
                    'build/background.js': ['background.js'],
                    'build/bundle.js': ['bundle.js'],
                    'build/s2t.js': ['s2t.js'],
                    'build/t2s.js': ['t2s.js']
                }
            }
        },

        htmlmin: {
            build: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: { 'build/index.html': 'index.html' }
            }
        },

        cssmin: {
            build: {
                files: { 'build/style.css': ['style.css'] }
            }
        },

        compress: {
            dist: {
                options: {
                    archive: 'dist/<%= pkg.name %>-<%= pkg.version %>.zip',
                    mode: 'zip'
                },
                files: [
                    { cwd: 'build/', src: ['**'], dest: '', expand: true },
                    {
                        src: [
                            '_locales/**',
                            'bootstrap.min.css',
                            'jquery.min.js',
                            'manifest.json',
                            'icon_16.png',
                            'icon_128.png'
                        ],
                        dest: ''
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('checkversion', 'Check version', function() {
        var manifest = grunt.file.readJSON('manifest.json');
        var pkg = grunt.config.get('pkg');
        if (manifest.version !== pkg.version) {
            console.error('Versions in manifest.json and package.json must be the same! ' +
                '(' + manifest.version + ' !== ' +  pkg.version + ')');
            return false;
        }
        console.log('Version: ' + pkg.version);
        return true;
    });

    grunt.registerTask('package', [
        'checkversion', 'clean', 'uglify', 'htmlmin', 'cssmin', 'compress'
    ]);

    // Default task(s)
    grunt.registerTask('default', [
        'browserify', 'package'
    ]);

};
