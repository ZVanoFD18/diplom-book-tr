'use strict';

Helper.Xml = {};

Helper.Xml.transformXslt = function (source, style) {
	if (window.ActiveXObject) {
		return source.transformNode(style);
	} else if (window.XSLTProcessor) {
		var xsltProcessor = new XSLTProcessor();
		xsltProcessor.importStylesheet(style);
		var resultDocument = xsltProcessor.transformToDocument(source);
		var xmls = new XMLSerializer();
		return xmls.serializeToString(resultDocument);
	} else {
		alert("XML-transform not supported");
		return null;
	}
};

Helper.Xml.getXMLFromString = function (s) {
	if (window.ActiveXObject) {
		var xml;
		xml = new ActiveXObject("Microsoft.XMLDOM");
		xml.async = false;
		xml.loadXML(s);
		return xml;
	}
	else if (window.DOMParser) {
		var parser = new DOMParser();
		return parser.parseFromString(s, 'text/xml');
	} else {
		alert("XML load not supported");
		return null;
	}
};