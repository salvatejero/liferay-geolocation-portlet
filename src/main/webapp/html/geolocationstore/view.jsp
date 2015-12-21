<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet" %>
<%@ taglib uri="http://liferay.com/tld/portlet" prefix="liferay-portlet" %>
<%@ taglib uri="http://liferay.com/tld/aui" prefix="aui" %>
<portlet:defineObjects />

<liferay-portlet:resourceURL var="storeLocation" portletName="geolocationstore_WAR_geolocationportlet"></liferay-portlet:resourceURL>

<aui:script use="aui-base">

	function success(position) {
		
		A.io.request('<%=storeLocation %>',
		{
			dataType: 'json',
			data: {
				<portlet:namespace />latitude: position.coords.latitude,
				<portlet:namespace />longitude: position.coords.longitude
			},
			on: {
	        	success: function() {
	        		var data = this.get('responseData');
	        		try{
	        			if(data != null && data.lat != null && data.lon != null){
	        				A.all('.portlet-boundary_101_').each(
	        						  function (node) {
	        							  console.log(node.get('id'));
	        							  Liferay.Portlet.refresh('#'+node.get('id'), {});
	        					
	        				});
	        				executePostStoreLocation(data.lat, data.lon);
	        			}
	        		}catch(e){}
	        		
	        		
	        	},
	        	error: function(){
	        		console.log(this);
	        	}
			}
		});
		
	}

	function error(msg) {
		alert(msg);
		console.log(msg);
	}

AUI().ready(function() {
	if (navigator.geolocation) {
	  	navigator.geolocation.getCurrentPosition(success, error);
	} else {
	  	error('not supported');
	}
});
</aui:script>
