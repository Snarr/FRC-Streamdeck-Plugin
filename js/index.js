var websocket = null;
var pluginUUID = null;
var settingsCache = {};

let robotSocket;

const connectAction = {

    type : "com.team1640.connect.action",

    onKeyUp : function(context, settings, coordinates, userDesiredState) {
        let ip = "";
		let port = "";
		
        if(settings['ip'] != null){
            ip = settings["ip"];
        }
        if(settings['port'] != null){
            port = settings["port"];
        }
        if(!ip || !port) {
            this.ShowReaction(context, "Alert");
        } else {
			this.ShowReaction(context, "Worked");
			robotSocket = new RobotSocket("10.16.40.2", 5802);
		}

    },

    onWillAppear : function(context, settings, coordinates) {
        settingsCache[context] = settings;
    },

    ShowReaction : function(context, type) {
        const json = {
            "event": "show" + type,
            "context": context,
        };
        websocket.send(JSON.stringify(json));
    },

    SetSettings : function(context, settings) {
        const json = {
            "event": "setSettings",
            "context": context,
            "payload": settings
        };
        websocket.send(JSON.stringify(json));
    },

    SendSettings : function(action, context) {
        const json = {
            "action": action,
            "event": "sendToPropertyInspector",
            "context": context,
            "payload": settingsCache[context]
        };

        websocket.send(JSON.stringify(json));
    }
};

const hotkeyAction = {

    type : "com.team1640.hotkey.action",

    onKeyUp : function(context, settings, coordinates, userDesiredState) {
		// if (robotSocket != undefined) {
		// 	data = {
		// 		"number": settings["functionID"]
		// 	}

		// 	robotSocket.doSend(JSON.stringify(data));
		// }
    },

    onWillAppear : function(context, settings, coordinates) {
        settingsCache[context] = settings;
    },

    ShowReaction : function(context, type) {
        const json = {
            "event": "show" + type,
            "context": context,
        };
        websocket.send(JSON.stringify(json));
    },

    SetSettings : function(context, settings) {
        const json = {
            "event": "setSettings",
            "context": context,
            "payload": settings
        };
        websocket.send(JSON.stringify(json));
    },

    SendSettings : function(action, context) {
        const json = {
            "action": action,
            "event": "sendToPropertyInspector",
            "context": context,
            "payload": settingsCache[context]
        };

        websocket.send(JSON.stringify(json));
    }
};

const toggleAction = {

    type : "com.team1640.toggle.action",

    onKeyUp : function(context, settings, coordinates, userDesiredState) {
    },

    onWillAppear : function(context, settings, coordinates) {
        settingsCache[context] = settings;
    },

    ShowReaction : function(context, type) {
        const json = {
            "event": "show" + type,
            "context": context,
        };
        websocket.send(JSON.stringify(json));
    },

    SetSettings : function(context, settings) {
        const json = {
            "event": "setSettings",
            "context": context,
            "payload": settings
        };
        websocket.send(JSON.stringify(json));
    },

    SendSettings : function(action, context) {
        const json = {
            "action": action,
            "event": "sendToPropertyInspector",
            "context": context,
            "payload": settingsCache[context]
        };

        websocket.send(JSON.stringify(json));
    }
};

function connectSocket(inPort, inPluginUUID, inRegisterEvent, inInfo)
{
    pluginUUID = inPluginUUID;

    // Open the web socket
    websocket = new WebSocket("ws://localhost:" + inPort);

    function registerPlugin(inPluginUUID)
    {
        const json = {
            "event": inRegisterEvent,
            "uuid": inPluginUUID
        };

        websocket.send(JSON.stringify(json));
    };

    websocket.onopen = function()
    {
        // WebSocket is connected, send message
        registerPlugin(pluginUUID);
    };

    websocket.onmessage = function (evt)
    {
        // Received message from Stream Deck
        const jsonObj = JSON.parse(evt.data);
        const event = jsonObj['event'];
        const action = jsonObj['action'];
        const context = jsonObj['context'];
		const jsonPayload = jsonObj['payload'];
		let selectedAction;

		switch(action) {
			case "com.team1640.connect.action":
				selectedAction = connectAction;
			case "com.team1640.toggle.action":
				selectedAction = toggleAction;
			case "com.team1640.hotkey.action":
				selectedAction = hotkeyAction;
		}

        if(event == "keyUp")
        {
            const settings = jsonPayload['settings'];
            const coordinates = jsonPayload['coordinates'];
            const userDesiredState = jsonPayload['userDesiredState'];
            selectedAction.onKeyUp(context, settings, coordinates, userDesiredState);
        }
        else if(event == "willAppear")
        {
            const settings = jsonPayload['settings'];
            const coordinates = jsonPayload['coordinates'];
            selectedAction.onWillAppear(context, settings, coordinates);
        }
        else if(event == "sendToPlugin") {

            if(jsonPayload['type'] == "updateSettings") {

                selectedAction.SetSettings(context, jsonPayload);
                settingsCache[context] = jsonPayload;

            } else if(jsonPayload['type'] == "requestSettings") {

                selectedAction.SendSettings(action, context);
            }
        }
    };
};
