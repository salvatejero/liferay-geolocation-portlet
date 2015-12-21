<%@ include file="/html/portlet/portal_settings/init.jsp" %>

<%

String geolocationEnabled = PrefsPropsUtil.getString(company.getCompanyId(), "geolocation.enabled", "false");
String geolocationStoreLocation = PrefsPropsUtil.getString(company.getCompanyId(), "geolocation.store.type", "session");
String geolocationAudienceEnabled = PrefsPropsUtil.getString(company.getCompanyId(), "geolocation.audience.enabled", "false");
%>

<liferay-ui:error-marker key="errorSection" value="general" />

<h3><liferay-ui:message key="geolocation" /></h3>

<aui:fieldset>

	<aui:input helpMessage="enabled-location-help" label="geolocation-enabled" name='<%= "settings--" + "geolocation.enabled" + "--" %>' type="checkbox" value="<%= geolocationEnabled %>" />

	
	<aui:select label="how-do-users-authenticate" name='<%= "settings--" + "geolocation.store.type" + "--" %>'>
		<aui:option label="store-session" selected='<%= geolocationStoreLocation.equals("session") %>' value="session" />
		<aui:option label="store-user" selected='<%= geolocationStoreLocation.equals("user-store") %>' value="user-store" />
	</aui:select>
	
	<aui:input helpMessage="enabled-location-audience-help" label="geolocation-audience-enabled" name='<%= "settings--" + "geolocation.audience.enabled" + "--" %>' type="checkbox" value="<%= geolocationAudienceEnabled %>" />
	
</aui:fieldset>
