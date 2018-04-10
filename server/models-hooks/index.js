module.exports = function (dbConnection) {
    let models = [
        //     'Annotation',
        //     'CombinedBox',
        //     'CrossPlot',
        'Curve',
        'Dataset',
        //     'DepthAxis',
        //     'Histogram',
        //     'ImageOfTrack',
        //     'ImageTrack',
        //     'Line',
        //     'Marker',
        //     'ObjectOfTrack',
        //     'ObjectTrack',
        'Plot',
        //     'PointSet',
        //     'Polygon',
        //     'ReferenceCurve',
        //     'RegressionLine',
        //     'Shading',
        //     'Ternary',
        //     'Track',
        //     'UserDefineLine',
        'Well',
        //     'Zone',
        //     'ZoneSet',
        //     'ZoneTrack'
    ];
    // let models = [];
    models.forEach(function (model) {
        require(__dirname + '/' + model)(dbConnection);
    });
};