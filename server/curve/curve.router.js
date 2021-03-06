'use strict';
const fs = require('fs');
const express = require('express');
const router = express.Router();
const multer = require('multer');
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let path = require('path');
let curveModel = require('./curve.model');
let convertUnit = require('./convert-unit');
let uploadDir = process.env.BACKEND_USER_UPLOAD_PATH || require('config').uploadPath;
const byline = require('byline');



let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname);
	}
});

let upload = multer({ storage: storage });

router.post('/curve/copy', (req, res) => {
	res.send({
		code: 512,
		content: "This function has been moved to client",
		reason: "This function has been moved to client"
	});
});

router.post('/curve/move', (req, res) => {
	res.send({
		code: 512,
		content: "This function has been moved to client",
		reason: "This function has been moved to client"
	});
});

router.delete('/curve/delete', function (req, res) {
	curveModel.deleteCurve(req.body, (status) => {
		res.send(status);
	}, req.dbConnection, req.decoded.username);
});

router.post('/curve/info', function (req, res) {
	//console.log("Get info");
	curveModel.getCurveInfo(req.body, function (status) {
		res.send(status);
	}, req.dbConnection, req.decoded.username);
});

router.post('/curve/new', function (req, res) {
	curveModel.createNewCurve(req.body, function (status) {
		res.send(status);
	}, req.dbConnection)

});

router.post('/curve/edit', function (req, res) {
	curveModel.editCurve(req.body, function (status) {
		res.send(status);
	}, req.dbConnection, req.decoded.username)

});

router.post('/curve/export', function (req, res) {
	curveModel.exportData(req.body, function (code, fileResult) {
		res.status(code).sendFile(fileResult, function (err) {
			if (err) console.log('Export curve: ' + err);
			fs.unlinkSync(fileResult);
		});
	}, function (code) {
		res.send(code);
	}, req.dbConnection, req.decoded.username)
});

router.post('/curve/getData', function (req, res) {
	req.body.isRaw = false;
	curveModel.getData(req.body, function (resultStream) {
		if (resultStream) {
			res.setHeader('content-type', 'text/javascript');
			resultStream.pipe(res);
		}
	}, function (status) {
		res.send(status);
	}, req.dbConnection, req.decoded.username);
});

router.post('/curve/getRawData', function (req, res) {
	req.body.isRaw = true;
	curveModel.getData(req.body, function (resultStream) {
		if (resultStream) {
			res.setHeader('content-type', 'text/javascript');
			resultStream.pipe(res);
		}
	}, function (status) {
		res.send(status);
	}, req.dbConnection, req.decoded.username);
});

router.post('/curve/getDataFile', function (req, res) {
	curveModel.getDataFile(req.body, function (resultFile) {
		if (resultFile) {
			// res.send(returnFile);
			res.setHeader('content-type', 'text/javascript');
			resultFile.pipe(res);
		}
	}, function (status) {
		res.send(status);
	}, req.dbConnection, req.decoded.username)
})

function writeToTmpFile(data, callback) {
	let name = Date.now();
	let tmpPath = path.join(__dirname, name + '.txt');
	let text = "";
	let count = 0;
	data.forEachDone(function (row) {
		if (Array.isArray(row)) {
			row.forEach(value => {
				text += value + " ";
			});
			text += "\n";
		} else {
			text += (count++ + " " + row + "\n");
		}
	}, function () {
		fs.writeFileSync(tmpPath, text);
		callback(tmpPath);
	});
}

router.post('/curve/scale', function (req, res) {
	curveModel.getScale(req, function (status) {
		res.send(status);
	}, req.dbConnection);
});

router.post('/curve/processing', upload.single('data'), function (req, res) {
	console.log(req.createdBy, "===", req.updatedBy);
	fs.readFile(req.file.path, function (err, data) {
		if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
		if (err) return res.send(err);
		writeToTmpFile(JSON.parse(data.toString()), function (tmpPath) {
			req.tmpPath = tmpPath;
			curveModel.processingCurve(req, function (result) {
				res.send(result);
			}, req.dbConnection, req.createdBy, req.updatedBy);
		});
	})
});

router.post('/curve/import-from-inventory', function (req, res) {
	let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
	curveModel.getCurveDataFromInventory(req.body, token, function (err, successful) {
		if (err) {
			res.send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err));
		} else {
			res.send(ResponseJSON(ErrorCodes.SUCCESS, "Done", successful))
		}
	}, req.dbConnection, req.decoded.username);
});

router.post('/curve/duplicate', function (req, res) {
	curveModel.duplicateCurve(req.body, function (done) {
		res.send(done);
	}, req.dbConnection, req.decoded.username);
});

router.post('/curve/is-existed', function (req, res) {
	curveModel.checkCurveExisted(req.body, function (status) {
		res.send(status);
	}, req.dbConnection)
});

router.post('/curve/get-parents', function (req, res) {
	curveModel.getCurveParents(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});

router.post('/curve/convert-unit', function (req, res) {
	convertUnit(req.body, function (status) {
		res.send(status);
	}, req.dbConnection, req.decoded.username)
});

router.post('/curve/info-by-name', function (req, res) {
	curveModel.getCurveByName(req.body.name, req.body.idDataset, function (err, curve) {
		if (err) {
			res.send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err));
		} else {
			res.send(ResponseJSON(ErrorCodes.SUCCESS, "SUCCESSFULLY", curve));
		}
	}, req.dbConnection);
});

router.post('/curve/resync-family', (req, res) => {
	curveModel.resyncFamily(req.body, (status => {
		res.send(status);
	}), req.dbConnection);
});

router.post('/curve/processing-array-data-curve', upload.single('data'), (req, res) => {
	fs.readFile(req.file.path, function (err, data) {
		if (err) return res.send(err);
		try {
			req.tmpData = JSON.parse(data.toString());
			curveModel.processingArrayCurve(req, function (result) {
				res.send(result);
				if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
			}, req.dbConnection, req.createdBy, req.updatedBy);
		} catch (e) {
			res.send({
				code: 512,
				reason: e,
				content: e
			});
		}

	});
});

router.post('/curve/merge-curve', (req, res) => {
	console.log(req.createdBy, "===", req.updatedBy);
	curveModel.mergeCurvesIntoArrayCurve(req.body, (status) => {
		res.send(status);
	}, req.dbConnection, req.decoded.username);
});

router.post('/curve/split-curve', (req, res) => {
	curveModel.splitArrayCurve(req.body, (status) => {
		res.send(status);
	}, req.dbConnection, req.decoded.username);
});

router.post('/curve/new-raw-curve', upload.single('data'), (req, res) => {
	try {
		if (req.body.idFamily === "null") delete req.body.idFamily;
		curveModel.saveCurveData(req, function (result) {
			res.send(result);
			if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
		}, req.dbConnection, req.createdBy, req.updatedBy);
	} catch (e) {
		console.log(e);
		res.send({
			code: 512,
			reason: e,
			content: e
		});
	}
});
router.post('/curve/list', function (req, res) {
	curveModel.getCurveList(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});

module.exports = router;
