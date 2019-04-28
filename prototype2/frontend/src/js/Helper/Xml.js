'use strict';

export default class Xml {
	static transformXslt(source, style) {
		if (window.ActiveXObject) {
			return source.transformNode(style);
		} else if (window.XSLTProcessor) {
			let xsltProcessor = new XSLTProcessor();
			xsltProcessor.importStylesheet(style);
			let resultDocument = xsltProcessor.transformToDocument(source);
			let xmls = new XMLSerializer();
			return xmls.serializeToString(resultDocument);
		} else {
			alert("XML-transform not supported");
			return null;
		}
	}

	static getXMLFromString (s) {
		if (window.ActiveXObject) {
			let xml;
			xml = new ActiveXObject("Microsoft.XMLDOM");
			xml.async = false;
			xml.loadXML(s);
			return xml;
		}
		else if (window.DOMParser) {
			let parser = new DOMParser();
			return parser.parseFromString(s, 'text/xml');
		} else {
			alert("XML load not supported");
			return null;
		}
	}
};

