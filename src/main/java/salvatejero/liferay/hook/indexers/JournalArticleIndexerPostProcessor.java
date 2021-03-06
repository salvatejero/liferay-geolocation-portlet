package salvatejero.liferay.hook.indexers;

import salvatejero.liferay.hook.indexers.util.GeolocationIndexerUtil;

import com.liferay.portal.kernel.search.BaseIndexerPostProcessor;
import com.liferay.portal.kernel.search.BooleanQuery;
import com.liferay.portal.kernel.search.Document;
import com.liferay.portal.kernel.search.SearchContext;
import com.liferay.portlet.journal.model.JournalArticle;

public class JournalArticleIndexerPostProcessor extends BaseIndexerPostProcessor{

	
	@Override
	public void postProcessDocument(Document document, Object obj)
			throws Exception {

		JournalArticle journal = (JournalArticle)obj;
		document = GeolocationIndexerUtil.addGeolocationToDocument(document, journal);
		
		super.postProcessDocument(document, obj);
	}

	@Override
	public void postProcessContextQuery(BooleanQuery contextQuery,
			SearchContext searchContext) throws Exception {
		
		contextQuery = GeolocationIndexerUtil.addGeolocationQuery(searchContext, contextQuery);
		super.postProcessContextQuery(contextQuery, searchContext);
	}

	@Override
	public void postProcessFullQuery(BooleanQuery fullQuery,
			SearchContext searchContext) throws Exception {
		
		super.postProcessFullQuery(fullQuery, searchContext);
	}

	@Override
	public void postProcessSearchQuery(BooleanQuery searchQuery,
			SearchContext searchContext) throws Exception {

		searchQuery = GeolocationIndexerUtil.addGeolocationQuery(searchContext, searchQuery);
		super.postProcessSearchQuery(searchQuery, searchContext);
	}

}
