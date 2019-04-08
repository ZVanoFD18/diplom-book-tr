Helper.Fb2 = {
    /**
     * Формирует книгу из текста FB2.
     * @param text
     */
    getBookFromText(text){
        // Вариант 1. Чтение сырого XML. Не катит, ибо требуется XSLT-преобразование.
        // let x2js = new X2JS();
        // let json = x2js.xml_str2json(document.querySelector('pre.fb2').innerText);
        // console.log('json', json);
        // document.querySelector('pre.json').innerText = JSON.stringify(json);

        // Вариант 2. Через спец.объекты современных браузеров.
        let tplBook = {
                image: undefined,
                title: [],
                sections: []
            },
            tplBookSection = {
                title: [],
                p: []
            },
            book = Object.assign({}, tplBook);
        book.title = [];
        book.sections = [];
        let xml = Helper.Xml.getXMLFromString(text);
        console.log(xml);
        book.image = xml.querySelector('body').querySelector('image');
        if (book.image) {
            book.image = xml.querySelector('binary[id="' + book.image.getAttribute('l:href').substr(1) + '"');
            if (book.image) {
                book.image = book.image.innerHTML;
            }
        }
        xml.querySelector('body').querySelector('title').querySelectorAll('p').forEach((elP) => {
            book.title.push(elP.innerHTML);
        });
        xml.querySelector('body').querySelectorAll('section').forEach((elSection) => {
            let section = Object.assign({}, tplBookSection);
            section.title = [];
            section.p = [];
            elSection.querySelector('title').querySelectorAll('p').forEach((elP) => {
                section.title.push(elP.innerHTML);
            });
            elSection.querySelectorAll('p').forEach((elP) => {
                let text = '';
                elP.childNodes.forEach((node)=>{
                   if (node.nodeType === 3){
                       text += node.textContent;
                   }
                });
                section.p.push(text);
            });
            book.sections.push(section);
        });
        return book;
    }
};