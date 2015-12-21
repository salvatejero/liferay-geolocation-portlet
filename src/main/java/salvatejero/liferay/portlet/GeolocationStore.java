package salvatejero.liferay.portlet;

import java.io.IOException;

import javax.portlet.PortletException;
import javax.portlet.PortletPreferences;
import javax.portlet.PortletSession;
import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;
import javax.portlet.ResourceRequest;
import javax.portlet.ResourceResponse;

import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.exception.SystemException;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.kernel.util.PrefsPropsUtil;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.model.User;
import com.liferay.portal.theme.ThemeDisplay;
import com.liferay.portlet.expando.model.ExpandoTableConstants;
import com.liferay.portlet.expando.service.ExpandoValueLocalServiceUtil;
import com.liferay.util.bridges.mvc.MVCPortlet;

/**
 * Portlet implementation class GeolocationStore
 */
public class GeolocationStore extends MVCPortlet {

	@Override
	public void doView(RenderRequest renderRequest,
			RenderResponse renderResponse) throws IOException, PortletException {

		PortletPreferences preference =  renderRequest.getPreferences();
		preference.setValue("portletSetupShowBorders", String.valueOf(Boolean.FALSE));
		preference.store();
		super.doView(renderRequest, renderResponse);
	}

	@Override
	public void serveResource(ResourceRequest resourceRequest,
			ResourceResponse resourceResponse) throws IOException,
			PortletException {
		
		String longitude = ParamUtil.getString(resourceRequest, "longitude", "0");
		String latitude = ParamUtil.getString(resourceRequest, "latitude", "0");
		
		Double lon = Double.valueOf(longitude);
		Double lat = Double.valueOf(latitude);
		
		ThemeDisplay themeDisplay = (ThemeDisplay)resourceRequest.getAttribute(WebKeys.THEME_DISPLAY);
		
		boolean reloadPage = true;
		
		try {
			String storeType = PrefsPropsUtil.getString(themeDisplay.getCompanyId(), "geolocation.store.type", "session");
			if(storeType.equals("session")){
				reloadPage = storeInSession(resourceRequest, lat, lon);
			}else{
				reloadPage = storeInUser(resourceRequest, lat, lon);
			}
		} catch (SystemException e) {
			e.printStackTrace();
		}
		
		System.out.println("STORE");
		if(reloadPage){
			JSONObject jsonObject = JSONFactoryUtil.createJSONObject();
			jsonObject.put("lat", lat);
			jsonObject.put("lon", lon);
			writeJSON(resourceRequest, resourceResponse, jsonObject);
		}
	}
 
	private boolean storeInUser(ResourceRequest resourceRequest, Double lat, Double lon) throws SystemException{
		boolean reloadPage = true;
		
		User user = (User)resourceRequest.getAttribute(WebKeys.USER);
		if(user != null){
			if(user.getExpandoBridge().hasAttribute("MAPIT_LAT") && user.getExpandoBridge().hasAttribute("MAPIT_LON")){//No es guest
				Double dlastLat = Double.valueOf(user.getExpandoBridge().getAttribute("MAPIT_LAT").toString());
				Double dlastLon = Double.valueOf(user.getExpandoBridge().getAttribute("MAPIT_LON").toString());
				if(Math.abs(dlastLat - lat) < 10 && Math.abs(dlastLon - lon) < 10)
					reloadPage = false;
			}
			try {
				ExpandoValueLocalServiceUtil.addValue(user.getCompanyId(), User.class.getName(), ExpandoTableConstants.DEFAULT_TABLE_NAME, "MAPIT_LAT", user.getPrimaryKey(), ""+lat);
				ExpandoValueLocalServiceUtil.addValue(user.getCompanyId(), User.class.getName(), ExpandoTableConstants.DEFAULT_TABLE_NAME, "MAPIT_LON", user.getPrimaryKey(), ""+lon);
			} catch (PortalException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			//UserLocalServiceUtil.updateUser(user);
		}
		
		return reloadPage;
	}
	
	private boolean storeInSession(ResourceRequest resourceRequest, Double lat, Double lon){
		boolean reloadPage = true;
		
		long actualLat = Math.round(lat);
		long actualLon = Math.round(lon);
		PortletSession portletSession = resourceRequest.getPortletSession();
		if(portletSession.getAttribute("APP_SHARED_latitude", PortletSession.APPLICATION_SCOPE) != null 
				&& portletSession.getAttribute("APP_SHARED_longitude", PortletSession.APPLICATION_SCOPE) != null){
			Double lastLat = (Double)portletSession.getAttribute("APP_SHARED_latitude", PortletSession.APPLICATION_SCOPE);
			Double lastLon = (Double)portletSession.getAttribute("APP_SHARED_longitude", PortletSession.APPLICATION_SCOPE);
			
			if(Math.abs(lastLat - actualLat) < 10 && Math.abs(lastLon - actualLon) < 10)
				reloadPage = false;
		}
			
		portletSession.setAttribute("APP_SHARED_latitude", lat, PortletSession.APPLICATION_SCOPE);
		portletSession.setAttribute("APP_SHARED_longitude",  lon, PortletSession.APPLICATION_SCOPE);
		return reloadPage;
	}

}
