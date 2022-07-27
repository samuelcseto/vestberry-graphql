'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BookHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      BookHistory.belongsTo(models.book)
    }
  }
  BookHistory.init({
    title: DataTypes.STRING,
    author: DataTypes.STRING,
    year: DataTypes.INTEGER,
    rating: DataTypes.INTEGER,
    genres: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'book_history',
  });
  return BookHistory;
};