<%--
/**
 * Copyright (c) 2000-2013 Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */
--%>

<%@page import="javax.portlet.RenderRequest"%>
<%@ include file="/html/portlet/asset_publisher/init.jsp" %>

<%
boolean geolocationEnabled = GetterUtil.getBoolean(portletPreferences.getValue("geolocationEnabled", null), false);
String searchtype = GetterUtil.getString(portletPreferences.getValue("searchtype", null), "must");
Double radioSearch = GetterUtil.getDouble(portletPreferences.getValue("radiosearch", null), 2.0);
%>
<aui:fieldset label="geolocation.info">

	<aui:input helpMessage="enabled-location-search-help" label="geolocation-search-enabled" name='preferences--geolocationEnabled--' type="checkbox" value="<%=geolocationEnabled %>" />

	
	<aui:select label="how-do-make-search" name='preferences--searchtype--'>
		<aui:option label="must" selected='<%= searchtype.equals("must") %>' value="must" />
		<aui:option label="mustno" selected='<%= searchtype.equals("mustno") %>' value="mustno" />
		<aui:option label="should" selected='<%= searchtype.equals("should") %>' value="should" />
	</aui:select>

	<aui:input helpMessage="radio-search-help" label="radio-search" name='preferences--radiosearch--' type="number"  value="<%=radioSearch %>"/>

</aui:fieldset>

