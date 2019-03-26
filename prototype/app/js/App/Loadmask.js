App.Loadmask ={
    getEl(){
        return document.getElementById('loadmask');
    },
    show(text){
        if (text){
            this.setMessage(text);
        }
        this.getEl().classList.remove('hidden');
    },
    hide(){
        this.getEl().classList.add('hidden');
    },
    setMessage(text){
        this.getEl().querySelector('.loadmask-message').innerHTML = text;
    }
};
