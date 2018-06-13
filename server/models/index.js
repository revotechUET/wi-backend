"use strict";
let modelMaster = require('../models-master/index');
let User = modelMaster.User;
let Sequelize = require('sequelize');
let config = require('config').Database;
let configCommon = require('config');

let wiImport = require('wi-import');
let hashDir = wiImport.hashDir;

let sequelizeCache = new Object();

function SequelizeCache() {
}

SequelizeCache.prototype.put = function (dbName, dbInstance) {
    this[dbName] = dbInstance;
}

SequelizeCache.prototype.get = function (dbName) {
    return this[dbName];
}

SequelizeCache.prototype.remove = function (dbName) {
    delete this[dbName];
}

let __CACHE = new SequelizeCache();
//console.log('start batch job', __CACHE);
setInterval(function () {
    //watchDog
    Object.keys(__CACHE).forEach(function (cache) {
        let dbConnect = __CACHE.get(cache);
        if (Date.now() - dbConnect.timestamp > 1000 * 15 * 60) {
            //delete cache and close sequelize connection if not working for 5 mins
            __CACHE.remove(cache);
            console.log("CLOSED CONNECTION TO : " + cache);
            try {
                dbConnect.instance.sequelize.close();
            } catch (err) {
                console.log("ERR WHILE CLOSE INSTANCE");
            }
        }
    });
}, 1000 * 60);
module.exports = function (dbName, callback, isDelete) {
    if (isDelete) {
        return __CACHE.remove(dbName);
    } else {
        let cacheItem = __CACHE.get(dbName);
        if (cacheItem) {
            cacheItem.timestamp = Date.now();
            return cacheItem.instance;
        } else {
            // No existing dbInstance in the __CACHE ! Create a new one
            cacheItem = {
                instance: null,
                timestamp: Date.now()
            }
            cacheItem.instance = newDbInstance(dbName, callback);
            __CACHE.put(dbName, cacheItem);
            console.log("START CONNECT TO : ", dbName);
            return cacheItem.instance;
        }
    }
}

function newDbInstance(dbName, callback) {
    let object = new Object();
    const sequelize = new Sequelize(dbName, config.user, config.password, {
        define: {
            freezeTableName: true
        },
        dialect: config.dialect,
        port: config.port,
        logging: config.logging,
        dialectOptions: {
            charset: 'utf8'
        },
        paranoid: true,
        pool: {
            max: 2,
            min: 0,
            idle: 200
        },
        operatorsAliases: Sequelize.Op,
        storage: config.storage
    });
    sequelize.sync()
        .catch(function (err) {
            //console.log(err.message);
            callback(err);
        });

    let models = [
        'Annotation',
        'CombinedBox',
        'CombinedBoxTool',
        'CrossPlot',
        'Curve',
        'Dataset',
        'DepthAxis',
        'Family',
        'FamilyCondition',
        'FamilySpec',
        'FamilyUnit',
        'Flow',
        'Groups',
        'Histogram',
        'Image',
        'ImageOfTrack',
        'ImageTrack',
        'Line',
        'Marker',
        'ObjectOfTrack',
        'ObjectTrack',
        'OverlayLine',
        'Plot',
        'PointSet',
        'Polygon',
        'Project',
        'ReferenceCurve',
        'RegressionLine',
        'SelectionTool',
        'Shading',
        'Task',
        'TaskSpec',
        'Ternary',
        'Track',
        'UnitGroup',
        'UserDefineLine',
        'Well',
        'WellHeader',
        'Workflow',
        'WorkflowSpec',
        'Zone',
        'ZoneSet',
        'ZoneTemplate',
        'ZoneTrack'
    ];
    models.forEach(function (model) {
        object[model] = sequelize.import(__dirname + '/' + model);
    });

    (function (m) {
        m.Project.hasMany(m.Well, {
            foreignKey: {
                name: "idProject",
                allowNull: false,
                unique: "name-idProject"
            }, onDelete: 'CASCADE'
        });
        m.Project.hasMany(m.Groups, {
            foreignKey: {
                name: "idProject",
                allowNull: false,
                unique: "name-idProject"
            }, onDelete: 'CASCADE'
        });
        m.Groups.hasMany(m.Well, {
            foreignKey: {
                name: "idGroup",
                allowNull: true
            }
        });

        m.Groups.hasMany(m.Groups, {
            foreignKey: {
                name: "idParent",
                allowNull: true
            }, onDelete: 'CASCADE'
        });

        m.Well.hasMany(m.Dataset, {
            foreignKey: {
                name: "idWell",
                allowNull: false,
                unique: "name-idWell"
            }, onDelete: 'CASCADE', hooks: true
        });
        // m.Well.hasMany(m.Plot, {
        //     foreignKey: {name: "idWell", allowNull: false, unique: "name-idWell"},
        //     onDelete: 'CASCADE'
        // });
        m.Project.hasMany(m.Plot, {
            foreignKey: {name: "idProject", allowNull: false, unique: "name-idProject"},
            onDelete: 'CASCADE'
        });
        m.Well.hasMany(m.ZoneSet, {
            foreignKey: {name: "idWell", allowNull: false, unique: "name-idWell"},
            onDelete: 'CASCADE'
        });
        m.Project.hasMany(m.CrossPlot, {
            foreignKey: {name: "idProject", allowNull: false, unique: "name-idProject"},
            onDelete: 'CASCADE'
        });
        m.Project.hasMany(m.Histogram, {
            foreignKey: {name: "idProject", allowNull: false, unique: "name-idProject"},
            onDelete: 'CASCADE'
        });
        m.Well.hasMany(m.CombinedBox, {
            foreignKey: {name: "idWell", allowNull: false, unique: "name-idWell"},
            onDelete: 'CASCADE'
        });
        m.Well.hasMany(m.WellHeader, {
            foreignKey: {name: "idWell", allowNull: false},
            onDelete: 'CASCADE'
        });

        m.Dataset.hasMany(m.Curve, {
            foreignKey: {
                name: "idDataset",
                allowNull: false,
                unique: "name-idDataset"
            }, onDelete: 'CASCADE', hooks: true
        });
        m.Plot.hasMany(m.Track, {foreignKey: {name: "idPlot", allowNull: false}, onDelete: 'CASCADE'});
        m.Plot.hasMany(m.DepthAxis, {
            foreignKey: {name: "idPlot", allowNull: false},
            onDelete: 'CASCADE'
        });
        m.Plot.hasMany(m.ImageTrack, {foreignKey: {name: "idPlot", allowNull: false}, onDelete: 'CASCADE'});
        m.ImageTrack.hasMany(m.ImageOfTrack, {
            foreignKey: {name: "idImageTrack", allowNull: false},
            onDelete: 'CASCADE'
        });
        m.Plot.hasMany(m.ObjectTrack, {foreignKey: {name: "idPlot", allowNull: false}, onDelete: 'CASCADE'});
        m.ObjectTrack.hasMany(m.ObjectOfTrack, {
            foreignKey: {name: "idObjectTrack", allowNull: false},
            onDelete: 'CASCADE'
        });
        m.Plot.hasMany(m.ZoneTrack, {foreignKey: {name: "idPlot", allowNull: false}, onDelete: 'CASCADE'});
        m.ZoneTrack.belongsTo(m.ZoneSet, {foreignKey: {name: "idZoneSet", allowNull: true}});//TODO allowNull??
        m.ZoneSet.hasMany(m.Zone, {foreignKey: {name: "idZoneSet", allowNull: false}, onDelete: 'CASCADE'});
        m.Plot.belongsTo(m.Curve, {foreignKey: 'referenceCurve'});

        m.Track.hasMany(m.Line, {foreignKey: {name: "idTrack", allowNull: false}, onDelete: 'CASCADE'});
        m.Track.hasMany(m.Shading, {foreignKey: {name: "idTrack", allowNull: false}, onDelete: 'CASCADE'});
        // m.Track.hasMany(m.Image, {foreignKey: {name: "idTrack", allowNull: false}, onDelete: 'CASCADE'});
        m.Track.hasMany(m.Marker, {foreignKey: {name: 'idTrack', allowNull: false}, onDelete: 'CASCADE'});
        m.Track.hasMany(m.Annotation, {foreignKey: {name: 'idTrack', allowNull: false}, onDelete: 'CASCADE'});
        m.Line.belongsTo(m.Curve, {foreignKey: {name: "idCurve", allowNull: false}, onDelete: 'CASCADE'});

        m.FamilyCondition.belongsTo(m.Family, {foreignKey: 'idFamily'});
        m.Family.hasMany(m.FamilySpec, {as: 'family_spec', foreignKey: 'idFamily'});
        m.FamilySpec.belongsTo(m.UnitGroup, {foreignKey: 'idUnitGroup'});
        m.UnitGroup.hasMany(m.FamilyUnit, {foreignKey: 'idUnitGroup'});
        m.Curve.belongsTo(m.Family, {as: 'LineProperty', foreignKey: 'idFamily'});

        m.Shading.belongsTo(m.Line, {foreignKey: 'idLeftLine', as: 'leftLine', onDelete: 'CASCADE'});
        m.Shading.belongsTo(m.Line, {foreignKey: 'idRightLine', as: 'rightLine', onDelete: 'CASCADE'});
        m.Shading.belongsTo(m.Curve, {foreignKey: 'idControlCurve'});

        m.CrossPlot.hasMany(m.Polygon, {foreignKey: {name: 'idCrossPlot', allowNull: false}, onDelete: 'CASCADE'});
        m.CrossPlot.hasMany(m.RegressionLine, {
            foreignKey: {name: 'idCrossPlot', allowNull: false},
            onDelete: 'CASCADE'
        });
        m.CrossPlot.hasMany(m.ReferenceCurve, {
            foreignKey: {name: 'idCrossPlot', allowNull: true},
            onDelete: 'CASCADE'
        });
        m.CrossPlot.hasMany(m.Ternary, {foreignKey: {name: 'idCrossPlot', allowNull: false}, onDelete: 'CASCADE'});
        m.CrossPlot.hasMany(m.PointSet, {foreignKey: {name: 'idCrossPlot', allowNull: false}, onDelete: 'CASCADE'});
        m.CrossPlot.hasMany(m.UserDefineLine, {
            foreignKey: {
                name: 'idCrossPlot',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        });

        m.PointSet.belongsTo(m.Curve, {foreignKey: {name: 'idCurveX', allowNull: true}});
        m.PointSet.belongsTo(m.Curve, {foreignKey: {name: 'idCurveY', allowNull: true}});
        m.PointSet.belongsTo(m.Curve, {foreignKey: {name: 'idCurveZ', allowNull: true}});
        m.PointSet.belongsTo(m.Well, {foreignKey: {name: 'idWell', allowNull: false}, onDelete: 'CASCADE'});
        m.PointSet.belongsTo(m.ZoneSet, {foreignKey: {name: 'idZoneSet', allowNull: true}});
        m.PointSet.belongsTo(m.OverlayLine, {foreignKey: {name: 'idOverlayLine', allowNull: true}});


        m.Histogram.belongsTo(m.Curve, {foreignKey: 'idCurve'});
        m.Histogram.belongsTo(m.ZoneSet, {foreignKey: {name: 'idZoneSet', allowNull: true}});
        m.Histogram.hasMany(m.ReferenceCurve, {
            foreignKey: {name: 'idHistogram', allowNull: true},
            onDelete: 'CASCADE'
        });

        m.Polygon.belongsToMany(m.RegressionLine, {
            through: 'Polygon_RegressionLine',
            foreignKey: 'idPolygon'
        });
        m.RegressionLine.belongsToMany(m.Polygon, {
            through: 'Polygon_RegressionLine',
            foreignKey: 'idRegressionLine'
        });
        //combined box
        m.CombinedBox.hasMany(m.CombinedBoxTool, {
            foreignKey: {name: "idCombinedBox", allowNull: true},
            onDelete: 'CASCADE'
        });
        m.CombinedBox.belongsToMany(m.Plot, {
            through: 'combined_box_plot',
            foreignKey: 'idCombinedBox'
        });
        m.CombinedBox.belongsToMany(m.CrossPlot, {
            through: 'combined_box_crossplot',
            foreignKey: 'idCombinedBox'
        });
        m.CombinedBox.belongsToMany(m.Histogram, {
            through: 'combined_box_histogram',
            foreignKey: 'idCombinedBox'
        });
        m.Plot.belongsToMany(m.CombinedBox, {
            through: 'combined_box_plot',
            foreignKey: 'idPlot'
        });
        m.CrossPlot.belongsToMany(m.CombinedBox, {
            through: 'combined_box_crossplot',
            foreignKey: 'idCrossPlot'
        });
        m.Histogram.belongsToMany(m.CombinedBox, {
            through: 'combined_box_histogram',
            foreignKey: 'idHistogram'
        });

        //end combined box
        m.ReferenceCurve.belongsTo(m.Curve, {
            foreignKey: {name: 'idCurve', allowNull: false},
            onDelete: 'CASCADE'
        });

        m.CombinedBox.hasMany(m.SelectionTool, {
            foreignKey: {name: 'idCombinedBox', allowNull: false},
            onDelete: 'CASCADE'
        });
        m.CombinedBoxTool.hasOne(m.SelectionTool, {
            foreignKey: {name: 'idCombinedBoxTool', allowNull: false},
            onDelete: 'CASCADE'
        });

        // m.Project.hasMany(m.WorkflowSpec, {
        //     foreignKey: {name: 'idProject', allowNull: false},
        //     onDelete: 'CASCADE'
        // });
        m.Project.hasMany(m.Workflow, {
            foreignKey: {name: 'idProject', allowNull: false, unique: 'name-idProject'},
            onDelete: 'CASCADE'
        });
        m.Plot.hasOne(m.Workflow, {
            foreignKey: {name: 'idPlot', allowNull: true}
        });
        m.WorkflowSpec.hasMany(m.Workflow, {
            foreignKey: {name: 'idWorkflowSpec', allowNull: true},
            onDelete: 'CASCADE'
        });
        m.Project.hasMany(m.Flow, {
            foreignKey: {name: 'idProject', allowNull: false, unique: 'name-idProject'},
            onDelete: 'CASCADE'
        });
        m.Flow.hasMany(m.Task, {
            foreignKey: {name: 'idFlow', allowNull: false, unique: 'name-idFlow'},
            onDelete: 'CASCADE'
        });
        m.TaskSpec.hasMany(m.Task, {
            foreignKey: {name: 'idTaskSpec', allowNull: true},
            onDelete: 'CASCADE'
        });
    })(object);

    object.sequelize = sequelize;
    //Register hook
    let Family = object.Family;
    let FamilySpec = object.FamilySpec;
    let FamilyCondition = object.FamilyCondition;
    let Dataset = object.Dataset;
    let Well = object.Well;
    let WellHeader = object.WellHeader;
    let Curve = object.Curve;
    let Histogram = object.Histogram;
    let CrossPlot = object.CrossPlot;
    let Plot = object.Plot;
    let ZoneSet = object.ZoneSet;
    let Zone = object.Zone;
    let username = dbName.substring(dbName.indexOf("_") + 1);
    let async = require('async');
    let rename = require('../utils/function').renameObjectForDustbin;
    let curveFunction = require('../utils/curve.function');
    require('../models-hooks/index')(object);
    Curve.hook('afterCreate', function (curve) {
        if (!curve.idFamily) {
            ((curveName, unit) => {
                FamilyCondition.findAll()
                    .then(conditions => {
                        let result = conditions.find(function (aCondition) {
                            let regex;
                            try {
                                regex = new RegExp("^" + aCondition.curveName + "$", "i").test(curveName) && new RegExp("^" + aCondition.unit + "$", "i").test(unit);
                            } catch (err) {
                                console.log(err);
                            }
                            return regex;
                        });
                        if (!result) {
                            return;
                        }
                        result.getFamily()
                            .then(aFamily => {
                                curve.setLineProperty(aFamily);
                            })
                    })
            })(curve.name, curve.unit);
        } else {
            Family.findById(curve.idFamily, {include: {model: FamilySpec, as: 'family_spec'}}).then(family => {
                curve.unit = family.family_spec[0].unit;
                curve.save();
            }).catch(err => {
                console.log("err while update curve unit ", err);
            });
        }
    });
    Curve.hook('beforeDestroy', function (curve, options) {
        return new Promise(async function (resolve) {
            let parents = await curveFunction.getFullCurveParents(curve, object);
            parents.username = username;
            if (options.permanently) {
                hashDir.deleteFolder(configCommon.curveBasePath, username + parents.project + parents.well + parents.dataset + parents.curve, parents.curve + '.txt');
                resolve(curve, options);
            } else {
                rename(curve, function (err, newCurve) {
                    if (!err) {
                        curveFunction.moveCurveData(parents, {
                            username: username,
                            project: parents.project,
                            well: parents.well,
                            dataset: parents.dataset,
                            curve: newCurve.name
                        }, function () {
                            object.Line.findAll({where: {idCurve: curve.idCurve}}).then(lines => {
                                async.each(lines, function (line, nextLine) {
                                    line.destroy({hooks: false}).then(() => {
                                        nextLine();
                                    });
                                }, function () {
                                    object.ReferenceCurve.findAll({where: {idCurve: curve.idCurve}}).then(refs => {
                                        async.each(refs, function (ref, nextRef) {
                                            ref.destroy({hooks: false}).then(() => {
                                                nextRef();
                                            }).catch(() => {
                                                nextRef();
                                            });
                                        }, function () {
                                            resolve(curve, options);
                                        });
                                    });
                                });
                            });
                        });
                    }
                }, 'delete');
            }
        });
    });


    Well.hook('afterCreate', function (well) {
        console.log("Hook after create well");
        let headers = {
            STRT: well.topDepth,
            STOP: well.bottomDepth,
            STEP: well.step,
            TOP: well.topDepth,
        };
        for (let header in headers) {
            WellHeader.create({
                idWell: well.idWell,
                header: header,
                createdBy: well.createdBy,
                updatedBy: well.updatedBy,
                value: headers[header]
            });
        }
    });

    Well.hook('beforeUpdate', async function (well, options) {
        console.log("Hook before update well");
        let headers = {
            STRT: well.topDepth,
            STOP: well.bottomDepth,
            STEP: well.step,
            TOP: well.topDepth,
        };
        for (let header in headers) {
            let h = await WellHeader.findOne({where: {idWell: well.idWell, header: header}});
            if (h) {
                await h.update({value: headers[header]});
            } else {
                await WellHeader.create({
                    header: header,
                    value: headers[header],
                    idWell: well.idWell,
                    createdBy: well.createdBy,
                    updatedBy: well.updatedBy
                })
            }
        }
    });

    Well.hook('beforeDestroy', function (well, options) {
        console.log("Hooks delete well");
        return new Promise(function (resolve) {
            if (well.permanently) {
                resolve(well, options);
            } else {
                let oldName = well.name;
                rename(well, function (err, success) {
                    Dataset.findAll({where: {idWell: well.idWell}}).then(datasets => {
                        async.each(datasets, function (dataset, nextDataset) {
                            Curve.findAll({where: {idDataset: dataset.idDataset}}).then(curves => {
                                async.each(curves, function (curve, nextCurve) {
                                    curveFunction.getFullCurveParents(curve, object).then(curveParents => {
                                        curveParents.username = username;
                                        let srcCurve = {
                                            username: curveParents.username,
                                            project: curveParents.project,
                                            well: oldName,
                                            dataset: curveParents.dataset,
                                            curve: curveParents.curve
                                        };
                                        curveFunction.moveCurveData(srcCurve, curveParents, function () {
                                            object.Line.findAll({where: {idCurve: curve.idCurve}}).then(lines => {
                                                async.each(lines, function (line, nextLine) {
                                                    line.destroy({hooks: false}).then(() => {
                                                        nextLine();
                                                    });
                                                }, function () {
                                                    object.ReferenceCurve.findAll({where: {idCurve: curve.idCurve}}).then(refs => {
                                                        async.each(refs, function (ref, nextRef) {
                                                            ref.destroy({hooks: false}).then(() => {
                                                                nextRef();
                                                            }).catch(() => {
                                                                nextRef();
                                                            })
                                                        }, function () {
                                                            nextCurve();
                                                        })
                                                    });
                                                });
                                            });
                                        });
                                    })
                                }, function () {
                                    nextDataset();
                                });
                            })
                        }, function () {
                            resolve(well, options);
                        })
                    })
                }, 'delete');
            }
        });
    });

    Dataset.hook('beforeDestroy', function (dataset, options) {
        console.log("Hooks delete dataset");
        return new Promise(function (resolve, reject) {
            if (dataset.permanently) {
                resolve(dataset, options);
            } else {
                let oldName = dataset.name;
                rename(dataset, async function (err, success) {
                    let curves = await Curve.findAll({where: {idDataset: dataset.idDataset}});
                    async.each(curves, function (curve, nextCurve) {
                        curveFunction.getFullCurveParents(curve, object).then(curveParents => {
                            curveParents.username = username;
                            let srcCurve = {
                                username: curveParents.username,
                                project: curveParents.project,
                                well: curveParents.well,
                                dataset: oldName,
                                curve: curveParents.curve
                            };
                            curveFunction.moveCurveData(srcCurve, curveParents, function () {
                                object.Line.findAll({where: {idCurve: curve.idCurve}}).then(lines => {
                                    async.each(lines, function (line, nextLine) {
                                        line.destroy({hooks: false}).then(() => {
                                            nextLine();
                                        });
                                    }, function () {
                                        object.ReferenceCurve.findAll({where: {idCurve: curve.idCurve}}).then(refs => {
                                            async.each(refs, function (ref, nextRef) {
                                                ref.destroy({hooks: false}).then(() => {
                                                    nextRef();
                                                }).catch(() => {
                                                    nextRef();
                                                })
                                            }, function () {
                                                nextCurve();
                                            })
                                        });
                                    });
                                });
                            });
                        });
                    }, function () {
                        resolve(dataset, options);
                    });
                }, 'delete');
            }
        })

    });

    Histogram.hook('beforeDestroy', function (histogram, options) {
        console.log("Hooks delete histogram");
        if (histogram.deletedAt) {

        } else {
            rename(histogram, null, 'delete');
        }
    });

    CrossPlot.hook('beforeDestroy', function (crossplot, options) {
        console.log("Hooks delete crossplot");
        if (crossplot.deletedAt) {

        } else {
            rename(crossplot, null, 'delete');
        }
    });

    Plot.hook('beforeDestroy', function (plot, options) {
        return new Promise(function (resolve, reject) {
            console.log("Hooks delete plot ", options);
            if (options.permanently) {
                resolve(plot, options);
            } else {
                rename(plot, function () {
                    resolve(plot, options);
                }, 'delete');
            }
        });


    });

    ZoneSet.hook('beforeDestroy', function (zoneset, options) {
        console.log("Hooks delete zoneset");
        if (zoneset.deletedAt) {

        } else {
            rename(zoneset, null, 'delete');
        }
    });

    Zone.hook('beforeDestroy', function (zone, options) {
        console.log("Hooks delete zone");
        if (zone.deletedAt) {

        } else {
            rename(zone, null, 'delete');
        }
    });
    //End register hook
    return object;
}
