var models = require('../models');
var PointSet = models.PointSet;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewPointSet(pointSetInfo, done) {
    PointSet.sync()
        .then(function () {
            delete pointSetInfo.idPointSet;
            PointSet.build(pointSetInfo)
                .save()
                .then(function (aPointSet) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Create new pointset success", aPointSet));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new pointset" + err));
                })
        }, function () {
            done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
        });
}
function editPointSet(pointSetInfo, done) {
    PointSet.findById(pointSetInfo.idPointSet)
        .then(function (pointSet) {
            delete pointSetInfo.idPointSet;
            delete pointSetInfo.idCrossPlot;
            Object.assign(pointSet,pointSetInfo)
                .save()
                .then(function (result) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit pointset success", result));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit poinset" + err));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "PointSet not found for edit"));
        })
}
function deletePointSet(pointSetInfo, done) {
    PointSet.findById(pointSetInfo.idPointSet)
        .then(function (pointSet) {
            pointSet.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "PointSet is deleted", pointSet));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete PointSet " + err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS,"PointSet not found for delete"))
        })
}
function getPointSetInfo(pointSetInfo, done) {
    PointSet.findById(pointSetInfo.idPointSet)
        .then(function (pointSet) {
            if (!pointSet) throw 'not exists';
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get PointSetInfo success", pointSet));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS,"PointSet not found for get info"))
        })
}

module.exports={
    createNewPointSet:createNewPointSet,
    editPointSet:editPointSet,
    deletePointSet:deletePointSet,
    getPointSetInfo:getPointSetInfo
}