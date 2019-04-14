Helper.Fb2 = {
    /**
     * Формирует книгу из текста FB2.
     * @param text
     */
    getBookFromText(text){
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
        // console.log(xml);
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