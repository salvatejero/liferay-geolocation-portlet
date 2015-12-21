
AUI.add(
	'liferay-geolocation-map',
	function(A) {
		
		var _cache = {};
		var _map = {};

		var GeolocationMap = A.Component.create(
			{
				EXTENDS: Liferay.MapItMap,
				
				NAME: 'geolocation-map',
				
				ATTRS: {
					id: {
						value: ''
					},
					portletId: {
						value: ''
					},
					mapType: {
						value: 1
					},
					apiKey: {
						value: ''
					},
					center: {
						value: {
							latitude: 0,
							longitude: 0,
							zoom: 2,
							geoLocation: false
						}
					},
					saveLastPosition: {
						value: false
					},
					controls: {
						value: {
							layerSwitch: false,
							fullScreen: false,
							navToolbar: false,
							mousePosition: false,
							scale: false,
							zoomType: 1
						}
					}
				},
				
				MAP_TYPE: {
					OPEN_STREET_MAP: 1,
					GOOGLE_MAP: 2,
					BING_MAP: 3,
					BASE: 4,
					BASE_LABEL: 5
				},
			
				ZOOM_TYPE: {
					ZOOM: 1,
					PAN_ZOOM: 2,
					PAN_ZOOM_BAR: 3,
				},
				
				DEFAULT_MARKER: '/tref-mapit-map-portlet/open_layers/img/marker.png',
				
				OPEN_LAYERS_LANG_JS: '/tref-mapit-map-portlet/open_layers/lang/',
	
				get: function(portletId) {
					var instance = this;
					return Liferay.MapItMap.get(portletId);
				},

				prototype: {
					
					initializer: function(config) {
						var instance = this;
						
						instance.config = config;
						
						GeolocationMap.superclass.initializer.apply(instance, config);
					},
					getOl: function(){
						var instance = this;
						return GeolocationMap.superclass.getOl.apply(instance);
					},
					render: function() {
						var instance = this;
						
						var language = themeDisplay.getLanguageId().split('_');
						
						var languageJs = Liferay.MapItMap.OPEN_LAYERS_LANG_JS + language[0] + '.js';
						
						GeolocationMap.superclass.render.apply(instance);
						
				    },
				    
				    addLayerPoints: function(layerName, points, clear, options) {
				    	var instance = this;		
				    	
				    	GeolocationMap.superclass.addLayerPoints.apply(instance, layerName, points, clear, options);
				    },
				    
				    addBasicLayer: function(layer, options){
				    	var instance = this;						    	
							    		
						instance._addLayer(layer, options);
				    },
				    
				    addLayer: function(layerName, url, params, options) {
				    	var instance = this;
				    
				    	GeolocationMap.superclass.addLayer.apply(instance, layerName, url, params, options);
				    	
					},
					
					moveMap: function(longitude, latitude, zoom) {
						var instance = this;
						
						GeolocationMap.superclass.moveMap.apply(instance, longitude, latitude, zoom);
						
					},
					
					scrollIntoView: function() {
						var instance = this;
						
						A.one('#' + instance.get('id')).scrollIntoView();
					},
					
					showPopup: function(options) {
						var instance = this;
						
						return GeolocationMap.superclass.showPopup.apply(instance, options);
					},
					
					hidePopup: function(options) {
						var instance = this;
						
						GeolocationMap.superclass.hidePopup.apply(instance, options);
					},
					
					getCurrentZoom: function() {
						var instance = this;
						
						return _map[instance.mapId].getZoom();
					},
					
					zoomToExtent: function(bounds,closest){
						var instance = this;	
						
						var map = _map[instance.mapId];
						
						map.zoomToExtent(bounds,closest);
					},
					
					zoomToDataExtent: function(layerName){
						var instance = this;
						
						GeolocationMap.superclass.zoomToDataExtent.apply(instance, layerName);
						
					},
					
					attachDrag: function(layerName, options) {
						var instance = this;
						GeolocationMap.superclass.attachDrag.apply(instance, layerName, options);
						
					},
					
					addButton: function(icon) {
						var instance = this;
						
						GeolocationMap.superclass.addButton.apply(instance, icon);
						
					},
					
					activateDrag: function(layerName) {
						var instance = this;
						
						instance._enableDrag(layerName, false);
					},
					
					deactivateDrag: function(layerName) {
						var instance = this;
					
						instance._enableDrag(layerName, true);
					},
					
					register: function(event, scope, callback) {
						var instance = this;
						
						instance.on(event, function(event) {
							callback.call(scope, event.obj);
						});
					},
					
					refreshLayer: function(layerName) {
						var instance = this;
						
						var map = _map[instance.mapId];
						
						var layers = map.getLayersByName(layerName);
						if (layers.length > 0) {
							layers[0].refresh();
						}
					},
					
					showLayer: function(layerName) {
						var instance = this;
						
						var map = _map[instance.mapId];
						
						var layers = map.getLayersByName(layerName);
						if (layers.length > 0) {
							layers[0].show();
						}
					},
					
					hideLayer: function(layerName) {
						var instance = this;
						
						var map = _map[instance.mapId];
						
						var layers = map.getLayersByName(layerName);
						if (layers.length > 0) {
							layers[0].hide();
						}
					},
					
					getMapProjectionObject: function(){
						var instance = this;						
						var map = _map[instance.mapId];
						return map.getProjectionObject();
					},
					
					_enableDrag: function(layerName, disabled) {
						var instance = this;
						
						var map = _map[instance.mapId];
						
						var layers = map.getLayersByName(layerName);
						if (layers.length > 0) {	
							var controls = map.getControlsByClass(OpenLayers.Control.DragFeature.prototype.CLASS_NAME)
							for (var i=0; i<controls.length; i++) {
								if (controls[i] && controls[i].layer && controls[i].layer.name == layerName) {
									if (!disabled) {
										controls[i].activate();
									}
									else {
										controls[i].deactive();
									}
									break;
								}
							}
						}
					},
					
					_addLayer: function(layer, options) {
						var instance = this;
						
						var map = _map[instance.mapId];
						
						layer.events.register('visibilitychanged', layer, function(event) {
							var map = this.map;
							var popups = map.popups;
							for (var i = 0; i < popups.length && popups[i]; i++) {
								var popup = popups[i];
								var feature = popup.feature;
								if (feature && feature.layer && feature.layer.mapItId == this.mapItId) {
									if (this.mapItType == 'mapItSelectLayer') {
					                	var selectControl = map.getControlsBy('mapItId', 'mapItSelectFeature')[0];
					                	selectControl.unselect(feature);
					                } else { 
					                	instance.hidePopup({
											layerId: feature.layer.mapItId,
											featureId: feature.mapItId
										});
					                }
								}
							}
						});
						
						if (layer.protocol && layer.protocol.CLASS_NAME == OpenLayers.Protocol.HTTP.prototype.CLASS_NAME) {
							
							layer.events.register('loadend', layer, function(event) {
				    			var map = this.map;
				    			var extent = map.getExtent();
				    			var obj = map.mapItTmpMoveObject;
				    			var i = 0;
								while (i < obj.length) {
									if (obj[i].layerId == this.mapItId) {
										var feature = null;
										if (obj[i].feature.geometry && obj[i].feature.geometry.getBounds()) {
											if (extent.intersectsBounds(obj[i].feature.geometry.getBounds())) {
												for (var j = 0; j < this.features.length && feature == null; j++) {
													if (this.features[j].mapItId == obj[i].feature.mapItId) {
														feature = this.features[j];
													}
												}
											}
										}
										if (feature) {
											var popups = map.popups;
											for (var k = 0; k <popups.length && popups[k]; k++) {
												var popup = popups[k];
												if (popup.feature && popup.feature.mapItId == feature.mapItId) {
													feature.layer = this
													popup.hide();
													popup.feature = feature;
													feature.popup = popup;
													if (this.mapItType == 'mapItSelectLayer') {
														this.events.unregister('featureselected', instance, instance._featureSelected);
														var selectControl = map.getControlsBy('mapItId', 'mapItSelectFeature')[0];
														selectControl.select(feature);
														this.events.register('featureselected', instance, instance._featureSelected);
													}
													popup.show();
													break;
												}
											}
										}
										else {
											feature = obj[i].feature;
											feature.layer = this
											if (this.mapItType == 'mapItSelectLayer') {
												var selectControl = map.getControlsBy('mapItId', 'mapItSelectFeature')[0];
												selectControl.unselect(feature);
											} else {
												instance.hidePopup({
													layerId: feature.layer.mapItId,
													featureId: feature.mapItId
												});
											}
										}
										obj.splice(i, 1);
									}
									else {
										i++;
									}
								}
				            });
						} 
						else {
				    		
				    		map.events.register('moveend', layer, function(event) {
								var map = this.map;
							    var extent = map.getExtent();
							    var obj = map.mapItTmpMoveObject;
							    var i = 0;
								while (i < obj.length) {
									if (obj[i].layerId == this.mapItId) {
										var feature = null;
										if (obj[i].feature.geometry && obj[i].feature.geometry.getBounds()) {
											if (!extent.intersectsBounds(obj[i].feature.geometry.getBounds())) {
												for (var j = 0; j < this.features.length && feature == null; j++) {
													if (this.features[j].mapItId == obj[i].feature.mapItId) {
														feature = this.features[j];
													}
												}
											}
										}
										if (feature) {
											feature.layer = this;
											if (this.mapItType == 'mapItSelectLayer') {
												var selectControl = map.getControlsBy('mapItId', 'mapItSelectFeature')[0];
												selectControl.unselect(feature);
											} else {
												instance.hidePopup({
													layerId: feature.layer.mapItId,
													featureId: feature.mapItId
												});
											}
										}
								        obj.splice(i, 1);
									} else {
							        	i++;
							        }
								}
							});
				    	}
						
						map.addLayer(layer);
						
						var selectable = true;
						
						if (options && typeof options.selectable != 'undefined') {
							selectable = options.selectable;
						}
									
				    	if (selectable) {
				    		
				    		layer.mapItType = 'mapItSelectLayer';
				    		
				    		layer.events.on({
							    'featureselected': instance._featureSelected,
							    'featureunselected': instance._featureUnselected,
							    scope: instance
							});
				    		
				    		if (options && typeof options.on != 'undefined') {
				    			if (!(typeof options.on.scope != 'undefined')) {
				    				options.on.scope = window;
				    			}
				    			instance.on(('featureselected_' + layer.mapItId), function(event) {
				    				options.on.featureSelected.call(options.on.scope, event.obj);
				    			});
				    			instance.on(('featureunselected_' + layer.mapItId), function(event) {
				    				options.on.featureUnselected.call(options.on.scope, event.obj);
				    			});
				    		}
				    		else {
				    			instance.on(('featureselected_' + layer.mapItId), function(event) {
				    				instance.fire('featureSelected', event.obj);
				    			});
				    			instance.on(('featureunselected_' + layer.mapItId), function(event) {
				    				instance.fire('featureUnselected', event.obj);
				    			});
				    		}
							
							var selectControl = map.getControlsBy('mapItId', 'mapItSelectFeature');
							
							if (selectControl.length == 0) {
								selectControl = new OpenLayers.Control.SelectFeature([layer], {
									mapItId: 'mapItSelectFeature'
								});
								map.addControl(selectControl);
								selectControl.activate();
							}
							else {
								var layers = map.getLayersBy('mapItType', 'mapItSelectLayer');
								selectControl[0].setLayer(layers);
							}
				    	}
				    	else {
				    		layer.mapItType = '';
				    	}
					},
					
					_loadMap: function() {
						var instance = this;
						
						GeolocationMap.superclass._loadMap.apply(instance);
					},
						
					_center: function() {
						var instance = this;
						
						GeolocationMap.superclass._center.apply(instance);
						
						
					},
					
					centerToPosition: function(lon, lat) {
						var instance = this;
						
						var map = GeolocationMap.superclass.getOl.apply(instance);
						var zoom = instance.get('center.zoom');
						var lonlatObject = new OpenLayers.LonLat(lon, lat).transform(
								new OpenLayers.Projection('EPSG:4326'), map.getProjectionObject()
							);
						map.setCenter(new OpenLayers.LonLat(lonlatObject.lon, lonlatObject.lat), zoom);
						
					},
					
					_addControls: function() {
						var instance = this;
						
						GeolocationMap.superclass._addControls.apply(instance);
						
						var map = GeolocationMap.superclass.getOl.apply(instance);
						
						var id = instance.get('id');
						
						var portletId = instance.get('portletId');
						var namespace = Liferay.Util.getPortletNamespace(portletId);
						
						var buttonAux = [];
						
						var contentPosition = new OpenLayers.Control.Button({
							displayClass: 'mapit-map-button mapit-map-addFeatureButton', 
							type: OpenLayers.Control.TYPE_TOGGLE, 
							eventListeners: {
								'activate': function() { 
									
									navigator.geolocation.getCurrentPosition(function(location) {
										var zoom = instance.get('center.zoom');
										instance._addMyPosition(location.coords.longitude, location.coords.latitude, true);
										var lonlatObject = new OpenLayers.LonLat(location.coords.longitude, location.coords.latitude).transform(
												new OpenLayers.Projection('EPSG:4326'), map.getProjectionObject()
											);
										map.setCenter(new OpenLayers.LonLat(lonlatObject.lon, lonlatObject.lat), zoom);
									}, function(err) {
										var latitude = instance.get('center.latitude');
										var longitude = instance.get('center.longitude');
										var zoom = instance.get('center.zoom');
										var lonlatObject = new OpenLayers.LonLat(longitude, latitude).transform(
											new OpenLayers.Projection('EPSG:4326'), map.getProjectionObject()
										);
										map.setCenter(new OpenLayers.LonLat(lonlatObject.lon, lonlatObject.lat), zoom);
									});

								}, 
								'deactivate': function() { 
									instance._removeMyPosition();
								}
							}
						});	
							
						buttonAux.push(contentPosition);
						var position = new OpenLayers.Control.Button({
						    displayClass: 'mapit-map-button mapit-map-originalPositionButton', 
						    trigger: function() {
						    	var latitude = instance.get('center.latitude');
								var longitude = instance.get('center.longitude');
								var zoom = instance.get('center.zoom');
								var lonlatObject = new OpenLayers.LonLat(longitude, latitude).transform(
									new OpenLayers.Projection('EPSG:4326'), map.getProjectionObject()
								);
						    	map.setCenter(new OpenLayers.LonLat(lonlatObject.lon, lonlatObject.lat), zoom);
						    }
						});
						buttonAux.push(position);
						
						
						var panelButton2 = new OpenLayers.Control.Panel({
							displayClass: 'mapit-map-controlPanel',
							mapItId: 'mainControlPanel'
						});
						
						panelButton2.addControls(buttonAux);
						map.addControl(panelButton2);
						panelButton2.addControls(buttonAux);
						
						// add events
						instance._click();
					},
					
					findByStreet: function(address){
						var instance = this;
						var map = GeolocationMap.superclass.getOl.apply(instance);
						address = encodeURIComponent(address);
						A.io.request(
							'http://nominatim.openstreetmap.org/search/'+address+'?format=json&addressdetails=1&limit=1&polygon_svg=1',
							{
								//autoLoad:false,
								//sync:false,
								dataType: 'json',
								on: {
						        	success: function() {
						        		var data = this.get('responseData');
						        		if(data != null ){
						        			instance._addMyPosition(data[0].lon, data[0].lat, true);
						        			instance.centerToPosition(data[0].lon, data[0].lat);
						        		}else{
						        			alert('No se ha encontrado información');
						        		}
						        	},
						        	error: function(){
						        		console.log(this);
						        	}
								}
							});
						
					},
					
					_addMyPosition: function(longitude, latitude, movible) {
						var instance = this;
						if(!movible){
							movible = false;
						}
												
						var map = GeolocationMap.superclass.getOl.apply(instance);
						//var map = _map[instance.mapId];
						
						var vectors = new OpenLayers.Layer.Vector("mapItPositionLayer");
						map.addLayers([ vectors ]);

						var lonlatObject = new OpenLayers.LonLat(longitude, latitude).transform(
								new OpenLayers.Projection('EPSG:4326'), map.getProjectionObject()
							);
						
						var point = new OpenLayers.Geometry.Point(lonlatObject.lon, lonlatObject.lat);
						var feature_point = new OpenLayers.Feature.Vector(point, null, {
							fid : 'mapitfeature',
							externalGraphic : Liferay.MapItMap.DEFAULT_MARKER,
							graphicWidth : 21,
							graphicHeight : 25,
							graphicYOffset : -32,
							graphicOpacity : 0,
							attributes:{
								mapItType: 'mapItPositionLayer'
							}
						});

						vectors.addFeatures([ feature_point ]);

						
						var drag = new OpenLayers.Control.DragFeature(vectors, {
							onComplete : function() {
								//tomarPosicion();
								
								myLayer = map.getLayersByName("mapItPositionLayer");

								x = myLayer[0].features[0].geometry.x;
								y = myLayer[0].features[0].geometry.y;
								
								var lonlatObject = new OpenLayers.LonLat(x, y).transform(
										map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326')
									);
								
								//document.getElementById("eada_null_null_MAPIT__LON").value = lonlatObject.lon;
								//document.getElementById("pqai_null_null_MAPIT__LAT").value = lonlatObject.lat;
							}
						});
						map.addControl(drag);
						drag.activate();

							//tomarPosicion();
						
						/*
						var myPositionLayer = new OpenLayers.Layer.Markers(
							Liferay.Language.get('label-mapitmap-my-position'), {
								mapItType: 'mapItPositionLayer',
								displayInLayerSwitcher: false
						});	
						
						var size = new OpenLayers.Size(21, 25);
			            var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
			            var icon = new OpenLayers.Icon(MapItMap.DEFAULT_MARKER, size, offset);
			            
			            var lonlatObject = new OpenLayers.LonLat(longitude, latitude).transform(
							new OpenLayers.Projection('EPSG:4326'), map.getProjectionObject()
						);
			            
			            myPositionLayer.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(
			            	lonlatObject.lon, lonlatObject.lat), icon));
						
						map.addLayer(myPositionLayer);
						
						if(movible){
							var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
			                renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

			                vectors = new OpenLayers.Layer.Vector("Vector Layer", {
			                    renderers: renderer
			                });
			                vectors.addFeatures([ myPositionLayer ]);
			                map.addLayers([vectors]);
							
							//instance.attachDrag(Liferay.Language.get('label-mapitmap-my-position'), null);
							//instance.activateDrag(Liferay.Language.get('label-mapitmap-my-position'));
							
							var drag = new OpenLayers.Control.DragFeature(vectors, {
								onComplete : function() {
									alert('');
								}
							});
							map.addControl(drag);
							drag.activate();
						}*/
					},
					
					_removeMyPosition: function() {
						var instance = this;
						
						GeolocationMap.superclass._removeMyPosition.apply(instance);
						
						var map = GeolocationMap.superclass.getOl.apply(instance);
						
						var layers = map.getLayersBy('mapItType', 'mapItPositionLayer');
						if (layers.length > 0) {
							layers[0].destroy();
						}else{
							layers = map.getLayersBy('name', 'mapItPositionLayer');
							if (layers.length > 0) {
								layers[0].destroy();
							}
						}
						
					},
					
					_ready: function() {
						var instance = this;
						
						var portletId = instance.get('portletId');
						
						instance.fire('ready', {portletId: portletId});
					},
					
					_featureSelected: function(event) {
						var instance = this;
				    	
						GeolocationMap.superclass._featureSelected.apply(instance, event);
					},
					
					_featureUnselected: function(event) {
						var instance = this;
						
						var map = _map[instance.mapId];
						
						var feature = event.feature;
						var layer = feature.layer;
			    		var lonLat = feature.geometry.getBounds().getCenterLonLat();
			    		
		    			var lonlatObject = new OpenLayers.LonLat(lonLat.lon, lonLat.lat).transform(
							map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));	
				    	
				    	instance.fire(('featureunselected_' + layer.mapItId), {
				    		obj: {
		    					feature: {
				    				id: feature.mapItId,
				    				layer: { 
				    					id: layer.mapItId,
				    				},
					    			latitude: lonlatObject.lat,
					    			longitude: lonlatObject.lon,
					    			attributes: feature.attributes
					    		}
		    				}
			    		});
					},
					
					_moveEvents: function() {
						var instance = this;
						
						GeolocationMap.superclass._moveEvents.apply(instance);
					},
					
					_click: function() {
						var instance = this;
						
						GeolocationMap.superclass._click.apply(instance);
					},
					
					_resizePopup: function(iframeId, popupId) {
						var instance = this;
						
						GeolocationMap.superclass._resizePopup.apply(instance, iframeId, popupId);
					},
					
					_setCookie: function(name, value, expires, path, domain, secure) {
						
						var instance = this;
						var today = new Date();
						today.setTime(today.getTime());
	
						if (expires) {
							expires = expires * 1000 * 60 * 60 * 24;
						}
						
						var d = new Date(today.getTime() + (expires));
						
						var options = {
							path: path,
							domain: domain,
							expires: d.toGMTString(),
							secure: secure
						};
							
						A.Cookie.set(name, value, options);
					},
					
					_getCookie: function(name) {
						
						return A.Cookie.get(name);
					}
				}
			}
		);
		
		Liferay.GeolocationMap = GeolocationMap;
		
		/**
		 * Open Layers
		 */

		OpenLayers.Popup.MapItFramedCloud = OpenLayers.Class(OpenLayers.Popup.FramedCloud, {

		    /**
		     * Property: positionBlocks
		     * {Object} Hash of differen position blocks, keyed by relativePosition
		     *     two-character code string (ie "tl", "tr", "bl", "br")
		     */
		    positionBlocks: {
		    	 "tl": {
		             'offset': new OpenLayers.Pixel(44, 0),
		             'padding': new OpenLayers.Bounds(8, 40, 8, 9),
		             'blocks': [
		                 { // top-left
		                     size: new OpenLayers.Size('auto', 'auto'),
		                     anchor: new OpenLayers.Bounds(0, 51, 22, 0),
		                     position: new OpenLayers.Pixel(0, 0)
		                 },
		                 { //top-right
		                     size: new OpenLayers.Size(22, 'auto'),
		                     anchor: new OpenLayers.Bounds(null, 50, 0, 0),
		                     position: new OpenLayers.Pixel(-1238, 0)
		                 },
		                 { //bottom-left
		                     size: new OpenLayers.Size('auto', 19),
		                     anchor: new OpenLayers.Bounds(0, 32, 22, null),
		                     position: new OpenLayers.Pixel(0, -633)
		                 },
		                 { //bottom-right
		                     size: new OpenLayers.Size(22, 18),
		                     anchor: new OpenLayers.Bounds(null, 32, 0, null),
		                     position: new OpenLayers.Pixel(-1238, -634)
		                 },
		                 { // stem
		                     size: new OpenLayers.Size(81, 35),
		                     anchor: new OpenLayers.Bounds(null, 0, 0, null),
		                     position: new OpenLayers.Pixel(0, -708)
		                 }
		             ]
		         },
		         "tr": {
		             'offset': new OpenLayers.Pixel(-45, 0),
		             'padding': new OpenLayers.Bounds(8, 40, 8, 9),
		             'blocks': [
		                 { // top-left
		                     size: new OpenLayers.Size('auto', 'auto'),
		                     anchor: new OpenLayers.Bounds(0, 51, 22, 0),
		                     position: new OpenLayers.Pixel(0, 0)
		                 },
		                 { //top-right
		                     size: new OpenLayers.Size(22, 'auto'),
		                     anchor: new OpenLayers.Bounds(null, 50, 0, 0),
		                     position: new OpenLayers.Pixel(-1238, 0)
		                 },
		                 { //bottom-left
		                     size: new OpenLayers.Size('auto', 19),
		                     anchor: new OpenLayers.Bounds(0, 32, 22, null),
		                     position: new OpenLayers.Pixel(0, -633)
		                 },
		                 { //bottom-right
		                     size: new OpenLayers.Size(22, 19),
		                     anchor: new OpenLayers.Bounds(null, 32, 0, null),
		                     position: new OpenLayers.Pixel(-1238, -633)
		                 },
		                 { // stem
		                     size: new OpenLayers.Size(81, 35),
		                     anchor: new OpenLayers.Bounds(0, 0, null, null),
		                     position: new OpenLayers.Pixel(-215, -707)
		                 }
		             ]
		         },
		        "bl": {
		            'offset': new OpenLayers.Pixel(45, 0),
		            'padding': new OpenLayers.Bounds(8, 9, 8, 20),
		            'blocks': [
		                { // top-left
		                    size: new OpenLayers.Size('auto', 'auto'),
		                    anchor: new OpenLayers.Bounds(0, 21, 22, 12),
		                    position: new OpenLayers.Pixel(0, 0)
		                },
		                { //top-right
		                    size: new OpenLayers.Size(22, 'auto'),
		                    anchor: new OpenLayers.Bounds(null, 21, 0, 12),
		                    position: new OpenLayers.Pixel(-1238, 0)
		                },
		                { //bottom-left
		                    size: new OpenLayers.Size('auto', 21),
		                    anchor: new OpenLayers.Bounds(0, 0, 22, null),
		                    position: new OpenLayers.Pixel(0, -629)
		                },
		                { //bottom-right
		                    size: new OpenLayers.Size(22, 21),
		                    anchor: new OpenLayers.Bounds(null, 0, 0, null),
		                    position: new OpenLayers.Pixel(-1238, -629)
		                },
		                { // stem
		                    size: new OpenLayers.Size(81, 13),
		                    anchor: new OpenLayers.Bounds(null, null, 0, 0),
		                    position: new OpenLayers.Pixel(-101, -674)
		                }
		            ]
		        },
		        "br": {
		            'offset': new OpenLayers.Pixel(-44, 0),
		            'padding': new OpenLayers.Bounds(8, 9, 8, 20),
		            'blocks': [
		                { // top-left
		                    size: new OpenLayers.Size('auto', 'auto'),
		                    anchor: new OpenLayers.Bounds(0, 21, 22, 12),
		                    position: new OpenLayers.Pixel(0, 0)
		                },
		                { //top-right
		                    size: new OpenLayers.Size(22, 'auto'),
		                    anchor: new OpenLayers.Bounds(null, 21, 0, 12),
		                    position: new OpenLayers.Pixel(-1238, 0)
		                },
		                { //bottom-left
		                    size: new OpenLayers.Size('auto', 21),
		                    anchor: new OpenLayers.Bounds(0, 0, 22, null),
		                    position: new OpenLayers.Pixel(0, -629)
		                },
		                { //bottom-right
		                    size: new OpenLayers.Size(22, 21),
		                    anchor: new OpenLayers.Bounds(null, 0, 0, null),
		                    position: new OpenLayers.Pixel(-1238, -629)
		                },
		                { // stem
		                    size: new OpenLayers.Size(81, 13),
		                    anchor: new OpenLayers.Bounds(0, null, null, 0),
		                    position: new OpenLayers.Pixel(-311, -674)
		                }
		            ]
		        }
		    },
		    
		    /**
		     * APIMethod: updateSizeByDimension
		     */
		    updateSizeByDimension: function(width, height) {
		        
		        // determine actual render dimensions of the contents by putting its
		        // contents into a fake contentDiv (for the CSS) and then measuring it
		        var preparedHTML = "<div class='" + this.contentDisplayClass+ "'>" + 
		            this.contentDiv.innerHTML + 
		            "</div>";
		 
		        var containerElement = (this.map) ? this.map.div : document.body;
		        var realSize = new OpenLayers.Size(width, height);

		        // is the "real" size of the div is safe to display in our map?
		        var safeSize = this.getSafeContentSize(realSize);

		        var newSize = null;
		        if (safeSize.equals(realSize)) {
		            //real size of content is small enough to fit on the map, 
		            // so we use real size.
		            newSize = realSize;

		        } else {
		            // make a new 'size' object with the clipped dimensions 
		            // set or null if not clipped.
		            var fixedSize = {
		                w: (safeSize.w <= realSize.w) ? safeSize.w : null,
		                h: (safeSize.h <= realSize.h) ? safeSize.h : null
		            };
		        
		            if (fixedSize.w && fixedSize.h) {
		                //content is too big in both directions, so we will use 
		                // max popup size (safeSize), knowing well that it will 
		                // overflow both ways.                
		                newSize = safeSize;
		            } else {
		                //content is clipped in only one direction, so we need to 
		                // run getRenderedDimensions() again with a fixed dimension
		                var clippedSize = OpenLayers.Util.getRenderedDimensions(
		                    preparedHTML, fixedSize, {
		                        displayClass: this.contentDisplayClass,
		                        containerElement: containerElement
		                    }
		                );
		                
		                //if the clipped size is still the same as the safeSize, 
		                // that means that our content must be fixed in the 
		                // offending direction. If overflow is 'auto', this means 
		                // we are going to have a scrollbar for sure, so we must 
		                // adjust for that.
		                //
		                var currentOverflow = OpenLayers.Element.getStyle(
		                    this.contentDiv, "overflow"
		                );
		                if ( (currentOverflow != "hidden") && 
		                     (clippedSize.equals(safeSize)) ) {
		                    var scrollBar = OpenLayers.Util.getScrollbarWidth();
		                    if (fixedSize.w) {
		                        clippedSize.h += scrollBar;
		                    } else {
		                        clippedSize.w += scrollBar;
		                    }
		                }
		                
		                newSize = this.getSafeContentSize(clippedSize);
		            }
		        }                        
		        this.setSize(newSize);     
		    },

		    CLASS_NAME: 'OpenLayers.Popup.MapItFramedCloud'
		});

		OpenLayers.Control.MapItClick = OpenLayers.Class(OpenLayers.Control, {
			
			defaultHandlerOptions: {
				'single': true,
				'double': false,
				'pixelTolerance': 0,
				'stopSingle': false,
				'stopDouble': false
			},
			
			handleRightClicks: true,
			
			initialize: function(options) {
				this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
				OpenLayers.Control.prototype.initialize.apply(this, arguments);
				this.handler = new OpenLayers.Handler.Click(this, {'rightclick': this.trigger}, this.handlerOptions);
			},
			
			CLASS_NAME: 'OpenLayers.Control.MapItClick'
		});

		OpenLayers.Format.MapItJSON = OpenLayers.Class(OpenLayers.Format.JSON, {

			
			/**
		     * APIProperty: defaultStyle
		     * defaultStyle allows one to control the default styling of the features.
		     *    It should be a symbolizer hash. By default, this is set to match the
		     *    Layer.Text behavior, which is to use the default OpenLayers Icon.
		     */
		    defaultStyle: null,
		     
		    /**
		     * APIProperty: extractStyles
		     * set to true to extract styles from the TSV files, using information
		     * from the image or icon, iconSize and iconOffset fields. This will result
		     * in features with a symbolizer (style) property set, using the
		     * default symbolizer specified in <defaultStyle>. Set to false if you
		     * wish to use a styleMap or OpenLayers.Style options to style your
		     * layer instead.
		     */
		    extractStyles: true,
		    
		    /**
		     * Constructor: OpenLayers.Format.MapItJSON
		     * Create a new parser for JSON.
		     *
		     * Parameters:
		     * options - {Object} An optional object whose properties will be set on
		     *     this instance.
		     */
		    initialize: function(options) {
		        options = options || {};

		        if(options.extractStyles !== false) {
		            options.defaultStyle = {
		                'externalGraphic': OpenLayers.Util.getImageLocation("marker.png"),
		                'graphicWidth': 21,
		                'graphicHeight': 25,
		                'graphicXOffset': -10.5,
		                'graphicYOffset': -12.5
		            };
		        }
		        
		        OpenLayers.Format.prototype.initialize.apply(this, [options]);
		    }, 

		    /**
		     * APIMethod: read
		     * Deserialize a MapItJSON string.
		     *
		     * Parameters:
		     * json - {String} A MapItJSON string
		     *
		     * Returns: 
		     * Array({<OpenLayers.Feature.Vector>})
		     */
		    read: function(json) {
		        var results = [];
		        var obj = null;
		        if (typeof json == "string") {
		            obj = OpenLayers.Format.JSON.prototype.read.apply(this, [json]);
		        } else { 
		            obj = json;
		        }    
		        if(!obj) {
		            OpenLayers.Console.error("Bad JSON: " + json);
		        } else if (!obj.features) {
		        	OpenLayers.Console.error("No features: " + json);
		        } else {
		            for(var i=0, len=obj.features.length; i<len; ++i) {
		                try {

		                	var object = obj.features[i];
		                	
		                	if (object.latitude && object.longitude && object.pk) {
		                		
		                		var geometry = new OpenLayers.Geometry.Point(
			        		    	parseFloat(object.longitude), parseFloat(object.latitude));

			    			    var attributes = {
			    					title: object.title,
			    					description: object.description,
			    					classNameId: object.classNameId,
			    					classPK: object.classPK
			    				}; 
			    			 
			    			    var styles = null;
			    			    
			    			    if (object.icon) {					    	
			    			    	styles = {
			    		    			externalGraphic: object.icon, 
			    						graphicHeight: 25, 
			    						graphicWidth: 21, 
			    						graphicXOffset:-12, 
			    						graphicYOffset:-25,
			    						cursor: 'pointer'
			    					};
			    			    }
		     
		    			    	if (this.internalProjection && this.externalProjection) {
		                            geometry.transform(this.externalProjection, this.internalProjection); 
		                        }
		    			    	
		    			    	var feature = new OpenLayers.Feature.Vector(geometry, attributes, styles);
		    			    	feature.mapItId = object.pk;
		    			    	results.push(feature);
		    			    }
		                } catch(err) {
		                    results = null;
		                    OpenLayers.Console.error(err);
		                }
		            }
		        }
		        return results;
		    },

		    CLASS_NAME: 'OpenLayers.Format.MapItJSON'
		}); 
	},
	'',
	{
		requires: ['aui-base', 'aui-base-lang', 'aui-component', 'aui-io-request', 'aui-loading-mask-deprecated', 'event-contextmenu', 'cookie', 'open-layers','liferay-mapit-map']
	}
);