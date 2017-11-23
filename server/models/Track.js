module.exports = function (sequelize, DataTypes) {
    return sequelize.define('track', {
        idTrack: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        orderNum: {
            type: DataTypes.STRING(200),
            allowNull: false,
            defaultValue: 'zz'
        },
        showTitle: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        title: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: "Track 1"
        },
        topJustification: {
            type: DataTypes.ENUM('Left', 'Center', 'Right'),
            allowNull: false,
            defaultValue: 'Center'
        },
        bottomJustification: {
            type: DataTypes.ENUM('Left', 'Center', 'Right'),
            allowNull: false,
            defaultValue: 'Center'
        },
        showLabels: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        showValueGrid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        majorTicks: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        minorTicks: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 5
        },
        showDepthGrid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        width: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 2
        },
        color: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'white'
        },
        showEndLabels: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        labelFormat: {
            type: DataTypes.STRING(150),
            allowNull: true
        },
        zoomFactor: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 1.0
        }

        // name:{
        //     type:DataTypes.STRING(50),
        //     allowNull:false
        // },
        // option:{
        //     type:DataTypes.STRING(250),
        //     allowNull:false
        // }
    });
};
