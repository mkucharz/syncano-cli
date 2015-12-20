module.exports = () => {
  return {
    path: 'index.js',
    data: `\
module.exports = {
  'class' : function(className) {
    return require("./classes/" + className);
  },
  'codebox' : function(codeboxName) {
    return require("./codebox/" + codeboxName);
  }
};\
  `}
};
