module.exports = () => {
  return {
    path: 'classes/example.js',
    data: `\
import SyncanoClass from '../settings/class';

class Book extends SyncanoClass {
  static schema() {
    return [
      {"name": "book_title", "type": "string"}
    ]
  }
}

module.exports = Book;\
  `}
};
