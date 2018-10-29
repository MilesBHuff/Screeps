module.exports = function(grunt) {
    grunt.loadNpmTasks("grunt-screeps");
    grunt.initConfig({
        screeps: {
            dist: {
//              expand: true,
//              filter: "",
//              cwd: "./",
                src: "bin/*.js",
//              dest: "/dist",
//              rename: (dest, src) => "",
            },
            options: {
                email: "",
                password: "",
                branch: "minified",
                ptr: false,
            },
        },
    });
};
