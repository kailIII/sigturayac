var map_id = 'examples.map-4l7djmvo',
    features = [],
    interaction,
    map = mapbox.map('map');
var recursos_search = [];
map.addLayer(mapbox.layer().id(map_id));

/*window.setTimeout(function() {
 mm_recurso(mm_hotel(mapData));//call the all funtions
 }, 4000);
 */
mm_hotel(mm_recurso(mapData)); //call the all funtions

map.centerzoom({
    lat: -13.16048,
    lon: -74.22565
}, 15);
map.setZoomRange(0, 18);

function mapData(f) {
    features = f;
    //console.log('ultimopor aqui' + features);
    markerLayer = mapbox.markers.layer().features(features);
    markerLayer.factory(function(m) {

        //var elem = mapbox.markers.simplestyle_factory(m);
        var elem = simplestyle_factory_rub(m);
        MM.addEvent(elem, 'click', function(e) {
            map.ease.location({
                lat: m.geometry.coordinates[1],
                lon: m.geometry.coordinates[0]
            }).zoom(map.zoom()).optimal();
        });

        return elem;
    });


    interaction = mapbox.markers.interaction(markerLayer);
    map.addLayer(markerLayer);
    map.ui.zoomer.add();
    map.ui.zoombox.add();
    map.ui.hash.add();
    interaction.formatter(function(feature) {
        var o = '<h5 class="popover-geo-title">' + feature.nombre + '</h5>' +
            '<p>' + feature.descripcion.substring(0, 100) + '...</p>' +
            '<div class="well-toltip">' +
            '<img style="height: 120px; width:120px;   margin-right: 3px;" src="' + feature.imagenes[0].url + '">' +
            '<img style="height: 120px; width:120px;" src="' + feature.imagenes[1].url + '">' +
            '</div>';
        var a_button = '';
        var a = feature.clase.replace(/\s/g, "");

        if (a == 'RecursoTurístico') {
            a_button = '<a  role="button" class="btn"  href="#detail" onclick="call_detaill_recurso(\'' + feature.idproducto + '\')"> Más Detalle</a>';

        } else if (a == 'Hotel') {
            a_button = '<a  role="button" class="btn"  href="#detail" onclick="call_detail_hotel(\'' + feature.idproducto + '\')"> Más Detalle</a>';

        }
        return o + a_button;
    });
    $('#map').removeClass('loading');


    fill_search(features);
    grid_images(features);
}


function newMarker() {
    if (window.location.hash == '#new') {
        $('#new').fadeIn('slow');
        window.location.hash = '';
        window.setTimeout(function() {
            $('#new').fadeOut('slow');
        }, 4000)
    }
}

function fill_search(f) {
    _.each(f, function(value, key) {
        var feature_search = {
            title: f[key].nombre,
            categoria: f[key].clase
        };
        recursos_search.push(feature_search);
    });
    // console.log(recursos_search);
}


function buscarproducto(id) {
    var producto;
    _.each(features, function(value, key) {

        if (features[key].idproducto == id) {
            producto = features[key];

        }
    });
    return producto;

};


simplestyle_factory_rub = function(feature) {

    var sizes = {
        small: [20, 50],
        medium: [30, 70],
        large: [35, 90]
    };

    var fp = feature.properties || {};

    var size = fp['marker-size'] || 'medium';
    //var symbol = (fp['marker-symbol']) ? '-' + fp['marker-symbol'] : '';
    var symbol = fp['marker-symbol'];
    //console.log(symbol);
    var color = fp['marker-color'] || '7e7e7e';
    color = color.replace('#', '');

    var d = document.createElement('img');
    d.width = sizes[size][0];
    d.height = sizes[size][1];
    d.className = 'simplestyle-marker';
    d.alt = fp.title || '';
    d.src = 'http://dl.dropbox.com/u/43116811/icon-tur/' + symbol + '-l.png';
    //console.log(d.src);

    /* (mapbox.markers.marker_baseurl || 'http://a.tiles.mapbox.com/v3/marker/') +
     'pin-' +
     // Internet Explorer does not support the `size[0]` syntax.
     
     size.charAt(0) + symbol + '+' + color +
     ((window.devicePixelRatio === 2) ? '@2x' : '') +
     '.png';*/
    // Support retina markers for 2x devices

    var ds = d.style;
    ds.position = 'absolute';
    ds.clip = 'rect(auto auto ' + (sizes[size][1] * 0.75) + 'px auto)';
    ds.marginTop = -((sizes[size][1]) / 2) + 'px';
    ds.marginLeft = -(sizes[size][0] / 2) + 'px';
    ds.cursor = 'pointer';
    ds.pointerEvents = 'all';

    return d;
};



var bandera = false;


$(document).on('ready', function() {

    $('#btn-full-with').click(function(e) {
        $('#full-width').css({
            'width': '1020px',
            /*80%*/
            'margin-top': '-5%',
            'margin-left': function() {
                return -($(this).width() / 2);
            }
        });
    });



    //alert('tttttttt');
    $('#play_s').click(function(e) {

        bandera = true;

        function ignorePopups(markers) {
            var clean = [];
            for (var j = 0; j < markers.length; j++) {
                if (markers[j].showTooltip) clean.push(markers[j]);
            }
            return clean;
        }
        var i = 0;

        function loop() {
            if (bandera) {
                window.setTimeout(function() {
                    var markers = ignorePopups(markerLayer.markers());
                    //console.log(markers[i]);
                    if (++i > markers.length - 1) i = 0;
                    map.center(markers[i].location, true);
                    markers[i].showTooltip();
                    loop();
                }, 3000);
            } else {
                return false;
            }

        }
        loop();
    });


    $('#stop_s').click(function(e) {
        bandera = false;
    });


    /*-----------------------------------
    close popover
    -------------------------------------*/
    $("#butoon_close").live('click', function(event) {
        $('#close').trigger('click');
    });
    $('#close').click(function(e) {
        e.preventDefault();
        $('#backdrop').fadeOut(200);
        $('#detail').hide(200);
        $('#detail').empty();
        $('#close').hide(200);
    });

    /*-----------------------------------
    Selecion de Recurso turistico
    -------------------------------------*/
    $('.select_recurso a').click(function(e) {
        var categoria = $(this).text().toLowerCase().replace(/\s/g, "");
        if (categoria === 'todos') {
            markerLayer.filter(function(features) {
                if (features.clase.toLowerCase().replace(/\s/g, "") === 'recursoturístico') {
                    map.ease.location({
                        lat: features.geometry.coordinates[1],
                        lon: features.geometry.coordinates[0]
                    }).zoom(10).optimal();
                    return true;
                }

            });
        } else {
            markerLayer.filter(function(features) {
                if (features.categoria.toLowerCase().replace(/\s/g, "") === categoria) {

                    map.ease.location({
                        lat: features.geometry.coordinates[1],
                        lon: features.geometry.coordinates[0]
                    }).zoom(10).optimal();
                    return true;
                }

            });

        }
    });

    /*-----------------------------------
    Seleccion de Hoteles
    -------------------------------------*/
    $('.select_hotel a').click(function(e) {
        var categoria = $(this).text().toLowerCase().replace(/\s/g, "");
        if (categoria === 'todos') {
            markerLayer.filter(function(features) {
                if (features.clase.toLowerCase().replace(/\s/g, "") === 'hotel') {
                    /*map.ease.location({
                        lat: features.geometry.coordinates[1],
                        lon: features.geometry.coordinates[0]
                    }).zoom(10).optimal();*/
                    return true;
                }
            });
        } else {
            markerLayer.filter(function(features) {
                if (features.categoria.toLowerCase().replace(/\s/g, "") === categoria) {
                    /*map.ease.location({
                        lat: features.geometry.coordinates[1],
                        lon: features.geometry.coordinates[0]
                    }).zoom(10).optimal();*/
                    return true;
                }

            });
        }
    });

    $('.select_corredor a').click(function(e) {
        var corredor = $(this).text().toLowerCase().replace(/\s/g, "");

        //alert(corredor);
        markerLayer.filter(function(features) {

            if (features.clase.toLowerCase().replace(/\s/g, "") === 'recursoturístico') {

                //console.log(features.corredor.toLowerCase().replace(/\s/g, ""));
                if (features.corredor.toLowerCase().replace(/\s/g, "") === corredor) {
                    map.ease.location({
                        lat: features.geometry.coordinates[1],
                        lon: features.geometry.coordinates[0]
                    }).zoom(10).optimal();
                    return true;
                }
            }


        });


    });



    // Search
    $('#search').betterAutocomplete('init',
    recursos_search, {
        cacheLimit: 128,
        selectKeys: [13],
        crossOrigin: true
    }, {
        /*processRemoteData: function(data) {
         if ($.type(data) == 'object' && $.isArray(data.geonames))
         return data.geonames;
         else
         return [];
         },*/
        themeResult: function(result) {
            output = '' + result.title + '';
            /*output += '<p>' + result.categoria +'</p>';*/
            return output;
        },
        select: function(result, $input) {
            $input.blur();
            $('#search').val(result.title);
            markerLayer.filter(function(features) {
                if (features.nombre === result.title) {
                    map.ease.location({
                        lat: features.geometry.coordinates[1],
                        lon: features.geometry.coordinates[0]
                    }).zoom(18).optimal();
                    return true;

                }

            });
            window.setTimeout(function() {
                $('#search').val("");
            }, 3000);

        },
        getGroup: function(result) {
            if ($.type(result.categoria) == 'string' && result.categoria.length) return result.categoria;
        }
    });
});