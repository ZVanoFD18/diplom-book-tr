'use strict';
/**
 * Помошник для работы с XML.
 */
export default class Xml {
	/**
	 * Выполняет XSLT-преобразование и возвращает результат в виде строки текста.
	 * @param source
	 * @param style
	 * @return {String|null}
	 */
	static transformXslt(source, style) {
		let result = null;
		if (window.ActiveXObject) {
			result  = source.transformNode(style);
		} else if (window.XSLTProcessor) {
			let xsltProcessor = new XSLTProcessor();
			xsltProcessor.importStylesheet(style);
			let resultDocument = xsltProcessor.transformToDocument(source);
			let xmls = new XMLSerializer();
			result = xmls.serializeToString(resultDocument);
		} else {
			alert("XML-transform not supported");
		}
		return result;
	}

	/**
	 * Возвращает XMLDocument из XML-текста.
	 * @param {String} s - XML-текст
	 * @return {Document|null}
	 */
	static getXMLFromString (s) {
		let result = null;
		if (window.ActiveXObject) {
			let xml;
			xml = new ActiveXObject("Microsoft.XMLDOM");
			xml.async = false;
			xml.loadXML(s);
			result = xml;
		}
		else if (window.DOMParser) {
			let parser = new DOMParser();
			result = parser.parseFromString(s, 'text/xml');
		} else {
			alert("XML load not supported");
		}
		return result;
	}
};

