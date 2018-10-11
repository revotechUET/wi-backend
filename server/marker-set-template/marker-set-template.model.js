let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createNewMarkerSetTemplate(payload, done, dbConnection) {
    dbConnection.MarkerSetTemplate.create(payload).then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
}

function infoMarkerSetTemplate(payload, done, dbConnection) {
    dbConnection.MarkerSetTemplate.findById(payload.idMarkerSetTemplate, {include: [{model: dbConnection.MarkerTemplate}, {model: dbConnection.MarkerSet}]}).then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    })
}

function listMarkerSetTemplate(payload, done, dbConnection) {
    dbConnection.MarkerSetTemplate.findAll({include: [{model: dbConnection.MarkerTemplate}, {model: dbConnection.MarkerSet}]}).then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    })
}


function deleteMarkerSetTemplate(payload, done, dbConnection) {
    dbConnection.MarkerSetTemplate.findById(payload.idMarkerSetTemplate).then(zst => {
        if (zst) {
            zst.destroy().then(() => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Done", zst));
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
            })
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No marker set template found"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
}

function editMarkerSetTemplate(payload, done, dbConnection) {
    dbConnection.MarkerSetTemplate.findById(payload.idMarkerSetTemplate).then(zst => {
        if (zst) {
            Object.assign(zst, payload).save().then((zst_) => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Done", zst_));
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
            })
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No marker set template found"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
}

module.exports = {
    createNewMarkerSetTemplate,
    infoMarkerSetTemplate,
    deleteMarkerSetTemplate,
    editMarkerSetTemplate,
    listMarkerSetTemplate
};
