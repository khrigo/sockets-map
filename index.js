jQuery(function($) {
    var map, userPosition, CreatePoint, Markers, 
        $body = $('body');

    function initialize() {
        var i,
            mapOptions = {
                zoom: 13,
                center: userPosition,
                zoomControl: true,
                disableDefaultUI: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.SMALL,
                    position: google.maps.ControlPosition.RIGHT_TOP
                }
            };

        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

        google.maps.event.addListener(map, 'bounds_changed', $.debounce(function() {
            var sw = map.getBounds().getSouthWest(),
                ne = map.getBounds().getNorthEast(),
                center = map.getCenter();

            $.ajax({
                type: 'GET',
                url: 'points/list.json',
                dataType: "json",
                success: function(response) {
                    var items;
                    items = response.response.items;
                    items.forEach(function(item, k) {

                                setTimeout(function() {
                                    Markers.add({
                                        id: item.point.id,
                                        description: item.point.name + "\n" + item.point.description,
                                        lat: item.point.location.lat,
                                        lng: item.point.location.lng
                                    });
                                }, 100 * k);
                            
                    });
                }
            });
            
        }, 100));

        //  TODO: geolocate(); получние геолокации
        
        $body.addClass('page_init_yes');
    }

    function escapeHTML(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        // 4sq
    }

    var image = {
        url: 'images/icon.png?v=2',
        size: new google.maps.Size(24, 24),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(24, 24)
    };
    Markers = {
        cache: {},
        infoWindow: null,

        // TODO: Кнопка "добавить розетку"
        
        add: function(data) {
            var marker,
                that = this,
                cacheKey = data.src + '_' + data.id;

            if (!this.cache.hasOwnProperty(cacheKey)) {
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(data.lat, data.lng),
                    map: map,
                    icon: image,
                    animation: google.maps.Animation.DROP
                });

                google.maps.event.addListener(marker, 'click', function() {
                    that.showHint(cacheKey);
                });

                data.marker = marker;
                this.cache[cacheKey] = data;
            }
        },

        showHint: function(cacheKey) {
            var data;

            if (this.cache.hasOwnProperty(cacheKey)) {
                data = this.cache[cacheKey];

                this.getInfoWindow().setContent(escapeHTML(data.description).replace("\n", "<br />"));
                this.getInfoWindow().open(map, data.marker);
            }
        },

        getInfoWindow: function() {
            return this.infoWindow || (this.infoWindow = new google.maps.InfoWindow({
                content: 'test'
            }));
        }
    };

    userPosition = new google.maps.LatLng(50.45015, 30.52651); // Нчальные координаты
    google.maps.event.addDomListener(window, 'load', initialize);
});