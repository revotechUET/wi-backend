"use strict";

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('histogram', {
        idHistogram: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'BlankHistogram',
            unique: 'name-idProject'
        },
        histogramTitle: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        hardCopyWidth: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        hardCopyHeight: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        intervalDepthTop: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        intervalDepthBottom: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        activeZone: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "All"
        },
        divisions: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 50
        },
        loga: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        showGrid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        flipHorizontal: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        plotType: {
            type: DataTypes.ENUM('Frequency', 'Percent'),
            defaultValue: 'Frequency',
            validate: {
                isIn: [['Frequency', 'Percent']]
            },
            allowNull: false
        },
        leftScale: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        rightScale: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        referenceTopDepth: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        referenceBottomDepth: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        referenceScale: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1000
        },
        referenceVertLineNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 7
        },
        referenceDisplay: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        referenceShowDepthGrid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        duplicated: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        colorBy: {
            type: DataTypes.STRING(15),
            allowNull: false,
            defaultValue: 'zone'
        },
        printSetting: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        createdBy: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        updatedBy: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    }, {
        paranoid: true
    })
}
