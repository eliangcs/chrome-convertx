module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            build: ['build'],
            dist: ['dist']
        },

        shell: {
            browserify: {
                options: { stdout: true },
                command: 'browserify main.js -o bundle.js'
            }
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

        compress: {
            dist: {
                options: {
                    archive: 'dist/<%= pkg.name %>-<%= pkg.version %>.crx',
                    mode: 'zip'
                },
                files: [
                    { cwd: 'build/', src: ['**'], dest: '', expand: true },
                    {
                        src: [
                            'bootstrap.min.css',
                            'style.css',
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

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-shell');

    // Default task(s).
    grunt.registerTask('default', ['clean', 'shell', 'uglify', 'compress']);

};
