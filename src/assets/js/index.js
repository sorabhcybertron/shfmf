var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    // deviceready Event Handler
    // Bind any cordova events here. Common events are: 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
        window.cordova = cordova;
        window.cordova.socialsharing = window.plugins.socialsharing;
        window.cordova.facebookConnectPlugin = facebookConnectPlugin;
        window.cordova.FirebasePlugin = FirebasePlugin;
        console.log('window.plugins');
        console.log(window.plugins);
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        document.addEventListener("backbutton", function(e){
            // e.preventDefault();
            console.log('back');
            console.log(window.history);
            /*if(window.localStorage.getItem('login') === 'true' && window.history.length == 2){
                console.log(true);
                navigator.app.exitApp();
            } else {
                console.log(false);
                navigator.app.backHistory();
            }*/
        });
    }
};
console.log('events work!');
app.initialize();