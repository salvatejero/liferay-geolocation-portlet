package salvatejero.liferay.hook.indexers.util;

import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.search.BooleanClauseOccur;
import com.liferay.portal.kernel.search.BooleanQuery;
import com.liferay.portal.kernel.search.BooleanQueryFactoryUtil;
import com.liferay.portal.kernel.search.Document;
import com.liferay.portal.kernel.search.SearchContext;
import com.liferay.portal.model.BaseModel;

public class GeolocationIndexerUtil {

	private static final Log _log = LogFactoryUtil.getLog(GeolocationIndexerUtil.class);

	private static final double GRAD_KM = 360.0 / 12742.0;
	
	/**
	 * Add location to Document
	 * @param document
	 * @param obj
	 * @return
	 */
	public static Document addGeolocationToDocument(Document document, BaseModel<?> obj){
		
		try{
			if(obj.getExpandoBridge().getAttribute("MAPIT_LAT") != null  && !obj.getExpandoBridge().getAttribute("MAPIT_LAT").toString().equals("") 
					&& obj.getExpandoBridge().getAttribute("MAPIT_LON") != null && !obj.getExpandoBridge().getAttribute("MAPIT_LON").toString().equals("")){
				Double latDouble = Double.valueOf(obj.getExpandoBridge().getAttribute("MAPIT_LAT").toString());
				Double lonDouble = Double.valueOf(obj.getExpandoBridge().getAttribute("MAPIT_LON").toString());
				Long latLong = Math.round(latDouble* 100000);
				Long lonLong = Math.round(lonDouble* 100000);
				_log.debug("ADDING LOCATION TO DOCUMENT " + latLong + " - "+ lonLong + " - "+ obj.getModelClassName());
				document.addNumber("MAPIT_LAT", latLong);
				document.addNumber("MAPIT_LON", lonLong);
			}
		}catch(Exception e){
			e.printStackTrace();
			_log.error(e.getLocalizedMessage());
		}
		return document;
	}
	
	
	public static BooleanQuery addGeolocationQuery(SearchContext searchContext, BooleanQuery contextQuery) throws Exception{
		
		if(searchContext.getAttribute("MAPIT_LAT") != null && !searchContext.getAttribute("MAPIT_LAT").equals("") 
				&& searchContext.getAttribute("MAPIT_LON") != null && !searchContext.getAttribute("MAPIT_LON").equals("")){
			
			Double radioSearch = (Double)searchContext.getAttribute("RADIOSEARCH");
			if(radioSearch == null){
				radioSearch = 2.0;
			}
			String searchType = (String)searchContext.getAttribute("SEARCHTYPE");
			BooleanClauseOccur occur = BooleanClauseOccur.MUST; 
			if(searchType != null && searchType.equals("must")){
				occur = BooleanClauseOccur.MUST;
			}else if(searchType != null && searchType.equals("mustno")){
				occur = BooleanClauseOccur.MUST_NOT;
			}else if(searchType != null && searchType.equals("should")){
				occur = BooleanClauseOccur.SHOULD;
			}
			
			Double lat = Double.valueOf(searchContext.getAttribute("MAPIT_LAT").toString())*100000;
			Double lon = Double.valueOf(searchContext.getAttribute("MAPIT_LON").toString())*100000;
			
			Double latMinDouble = lat - (radioSearch*GRAD_KM*100000);
			Double latMaxDouble = lat + (radioSearch*GRAD_KM*100000);
			
			Double lonMinDouble = lon - (radioSearch*GRAD_KM*100000);
			Double lonMaxDouble = lon + (radioSearch*GRAD_KM*100000);
			
			BooleanQuery latQuery = BooleanQueryFactoryUtil.create(
					searchContext);
			
			_log.debug(Math.round(latMinDouble) +" ---- "+Math.round(latMaxDouble));
			if(latMaxDouble > 0){
				latQuery.addRangeTerm("MAPIT_LAT", Math.round(latMinDouble),  Math.round(latMaxDouble));
			}else{
				latQuery.addRangeTerm("MAPIT_LAT", Math.round(latMaxDouble), Math.round(latMinDouble));
			}
			BooleanQuery lonQuery = BooleanQueryFactoryUtil.create(
					searchContext);
			_log.debug(Math.round(lonMinDouble) +" ---- "+Math.round(lonMaxDouble));
			if(lonMinDouble > 0){
				lonQuery.addRangeTerm("MAPIT_LON",  Math.round(lonMinDouble),  Math.round(lonMaxDouble));
			}else{
				lonQuery.addRangeTerm("MAPIT_LON", Math.round(lonMaxDouble), Math.round(lonMinDouble));
			}
				
			contextQuery.add(latQuery, occur);
			contextQuery.add(lonQuery, occur);
		}
		return contextQuery;
	}
}
