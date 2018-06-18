module.exports = function (sequelize, DataTypes) {
    return sequelize.define('marker_template', {
        idMarkerTemplate: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        template: {
            type: DataTypes.STRING(200),
            allowNull: false,
            unique: 'name-template'
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: 'name-template'
        },
        background: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        foreground: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: 'white'
        },
        pattern: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: 'none'
        }
    });
};
