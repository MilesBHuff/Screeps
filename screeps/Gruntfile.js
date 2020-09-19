//git update-index --skip-worktree Gruntfile.js
//NOTE:  Make sure to run the above command before saving an email or password in this file!
module.exports = grunt => {
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
