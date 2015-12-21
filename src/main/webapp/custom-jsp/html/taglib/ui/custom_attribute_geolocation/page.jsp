
<%@page import="com.liferay.portal.kernel.language.LanguageUtil"%>
<%@page import="com.liferay.portal.util.PortalUtil"%>
<%@page import="org.apache.commons.io.IOUtils"%>
<%@page import="java.net.URL"%>
<%@page import="java.io.InputStream"%>
<%@page import="java.util.Random"%>
<%
	String portalUrl = PortalUtil.getPortalURL(request);
	String initFile = "";
	String endFile = "";
	InputStream input = new URL( portalUrl + "/tref-mapit-map-portlet/js/mapit_map.js" ).openStream();
    try {
    	String textFile = IOUtils.toString( input );
    	initFile = textFile.substring(0, textFile.indexOf("render:"));
    	endFile = textFile.substring(textFile.indexOf("render:"), textFile.length());
    } finally {
        IOUtils.closeQuietly(input);
    }
%>
<style>

.aui .inputLarge{
	width: 95%;
	margin-top: 3px;
}
.customFieldSearch .control-group-inline{
	width: 80%;
}
</style>
<script type="text/javascript">
<!--
<%=initFile%>
getOl: function(){
	var instance = this;
	return _map[instance.mapId];
},
<%=endFile%>
//-->
</script>

<script type="text/javascript" src="/html/js/geolocation-main.js"></script>
<h4><%=LanguageUtil.get(themeDisplay.getLocale(), "location.locate.content") %></h4>
<div class="customFieldSearch">
	<aui:fieldset>
	
		<div class="" id="" style="width: 98%"> 
			<div class="control-group control-group-inline"> 
				<label class="control-label" for="<portlet:namespace />streetnameId"> <%=LanguageUtil.get(themeDisplay.getLocale(), "location.include.address.search") %> </label> 
				<input data-exclude="yes" placeholder="<%=LanguageUtil.get(themeDisplay.getLocale(), "location.address.placeholder") %>" class="field inputLarge" id="<portlet:namespace />streetnameId" name="streetname" type="text" value="" autocomplete="off">  
			</div>
			<button class="btn" id="<portlet:namespace />search" type="button" title="search" inlinefield="true"> <%=LanguageUtil.get(themeDisplay.getLocale(), "add.location") %> </button>
		</div>
	</aui:fieldset>
</div>
<div id="<portlet:namespace />map" style="width:99%; height:400px"> </div>

<%
String apiKey = "";
String centerLatitude = "37,356412";
String centerLongitude = "-5,981688";
String centerZoom = "12";
String geoBrowser = "true";
String saveLastPosition = "false";
%>
<aui:script use="liferay-geolocation-map,liferay-mapit-map">
 
var mapType = Liferay.GeolocationMap.MAP_TYPE.OPEN_STREET_MAP;

var zoomType = Liferay.MapItMap.ZOOM_TYPE.PAN_ZOOM_BAR;
var aLat;
var aLon;
var mapitMap2 = new Liferay.GeolocationMap({
	id: '<portlet:namespace />map',
	portletId: '<%= themeDisplay.getPortletDisplay().getId() %>',
	mapType: mapType,
	apiKey: '<%= apiKey %>',
	center: {
		latitude: '<%= centerLatitude %>',
		longitude: '<%= centerLongitude %>',
		zoom: '<%= centerZoom %>',
		geoLocation: <%= geoBrowser %>
	},
	saveLastPosition: <%= saveLastPosition %>,
	controls: {
		layerSwitch: false,
		fullScreen: false,
		navToolbar: false,
		mousePosition: true,
		scale: false,
		zoomType: zoomType,
	},
	on: {
		featureSelected: function(event) {
		 	var mapItMap = Liferay.GeolocationMap.get('<%= themeDisplay.getPortletDisplay().getId() %>');
		 	var feature = event.feature;
		 	mapItMap.showPopup({
    			layerId: feature.layer.id,
    			featureId: feature.id,
    			latitude: feature.latitude,
    			longitude: feature.longitude,
   				url: '',
   				parameters: {
   					<portlet:namespace/>classNameId: feature.attributes.classNameId,
					<portlet:namespace/>classPK: feature.attributes.classPK
   				}
    		});
		},
		featureUnselected: function(event) {
			var mapItMap = Liferay.GeolocationMap.get('<%= themeDisplay.getPortletDisplay().getId() %>');
	 		mapItMap.hidePopup({layerId: event.feature.layer.id, featureId: event.feature.id});
		},
		ready: function(event) {
			
			var elementLat = document.getElementsByName("<portlet:namespace />ExpandoAttribute--MAPIT_LAT--")[0]; 
			var elementLon = document.getElementsByName("<portlet:namespace />ExpandoAttribute--MAPIT_LON--")[0]; 
			
			aLat = A.one('#'+elementLat.getAttribute('id'));
			aLon = A.one('#'+elementLon.getAttribute('id'));
			
			aLat.ancestor().hide();
			aLon.ancestor().hide();
			Liferay.once(
				'formNavigator:reveal<portlet:namespace />customFields',
				function() {
					var mapItMap = Liferay.GeolocationMap.get('<%= themeDisplay.getPortletDisplay().getId() %>');
		    		var map  = mapItMap.getOl();
		    		var timeoutId = setTimeout(function(){
			    		map.updateSize();
		    		},2000);
				}
			);
			
			if(aLon.val() != null && aLon.val() != '' 
				&& aLat.val() != null && aLat.val() != ''){
				
				var mapItMap = Liferay.GeolocationMap.get('<%= themeDisplay.getPortletDisplay().getId() %>');
				mapItMap._addMyPosition(aLon.val(), aLat.val(), true);
				mapItMap.centerToPosition(aLon.val(), aLat.val());
			}
			
		}
	}
}).render();



if(A.one('#<portlet:namespace/>fm1')){
	A.one('#<portlet:namespace/>fm1').on('submit',function(event) {
    
	    savePositions();
		event.halt();
	});

}

if(A.one('#<portlet:namespace/>search')){
	A.one('#<portlet:namespace/>search').on('click',function(event) {
		var mapItMap = Liferay.GeolocationMap.get('<%= themeDisplay.getPortletDisplay().getId() %>');
		var map  = mapItMap.getOl();	
		layers = map.getLayersBy('name', 'mapItPositionLayer');
		if (layers.length > 0 && confirm('<%=LanguageUtil.get(themeDisplay.getLocale(), "location.sure.remove") %>')) {
			try{
				mapItMap._removeMyPosition();
			}catch(e){}
			var streetName = A.one('#<portlet:namespace />streetnameId').val()
			if(streetName != null && streetName.length > 10){
				mapItMap.findByStreet(streetName);
			}
		}else{
			var streetName = A.one('#<portlet:namespace />streetnameId').val()
			if(streetName != null && streetName.length > 10){
				mapItMap.findByStreet(streetName);
			}
		}
	});
}

function savePositions(){

	var mapItMap = Liferay.GeolocationMap.get('<%= themeDisplay.getPortletDisplay().getId() %>');
    var map  = mapItMap.getOl();
	var layers = map.getLayersBy('mapItType', 'mapItPositionLayer');
	if (layers.length > 0) {
		layers[0].destroy();
	}else{
		layers = map.getLayersBy('name', 'mapItPositionLayer');
		if (layers.length > 0) {
			x = layers[0].features[0].geometry.x;
			y = layers[0].features[0].geometry.y;
			
		    var lonlatObject = new OpenLayers.LonLat(x, y).transform(
					map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326')
				);
			aLon.val(lonlatObject.lon);
			aLat.val(lonlatObject.lat);
		}
	}
}

if(A.one('#<portlet:namespace/>fm')){
	A.one('#<portlet:namespace/>fm').on('submit',function(event) {
		//event.halt();
	    savePositions();
	});

}


AUI().use('autocomplete-list','aui-base','aui-io-request','autocomplete-filters','autocomplete-highlighters',function (A) {
	var testData;
	var autocomplete = new A.AutoCompleteList({
		allowBrowserAutocomplete: 'true',
		activateFirstItem: 'true',
		inputNode: '#<portlet:namespace />streetnameId',
		render: 'true',
		resultTextLocator: 'display_name',
		resultHighlighter: 'phraseMatch',
		resultFilters: function(query, results) {
			return results;
		},
		source:function(){
			var streetName = Liferay.Util.escapeHTML(A.one('#<portlet:namespace />streetnameId').val());
			if(streetName != null && streetName.length > 10){
				var ajaxRequest = A.io.request(
					'http://nominatim.openstreetmap.org/search/'+streetName+'?format=json&addressdetails=1&limit=14&polygon_svg=1',
					{
						autoLoad:false,
						sync:false,
						dataType: 'json',
						on: {
				        	success: function() {
				        		var data = this.get('responseData');
				        		if(data != null){
					        		testData = data;
				        		}else{
				        			testData = [];
				        		}
				        	}
						}
					}
				);
				ajaxRequest.start();
			}
			
			return testData;
		},
	});
	
});


</aui:script>