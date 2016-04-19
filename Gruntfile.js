module.exports = function (grunt) {
  // ��Ŀ����
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.file %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'xmprint.js',
        dest: 'dest/xmprint.min.js'
      }
    }
  });
  // �����ṩ"uglify"����Ĳ��
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // Ĭ������
  grunt.registerTask('default', ['uglify']);
}