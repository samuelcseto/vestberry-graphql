'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Genre extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Genre.belongsToMany(models.book, { through: 'book_genre' })
    }
  }
  Genre.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'genre',
  });
  return Genre;
};