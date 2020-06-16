 // Set the following constants with the API key and API secret
        // that you receive when you sign up to use the OpenTok API:
        var opentok = new OpenTok('46717532', '0d064d8c48765ce82f05bd9fccb8ac82818c9fec');

        //Generate a basic session. Or you could use an existing session ID.
        var sessionId;
        opentok.createSession({}, function (error, session) {
            if (error) {
                console.log("Error creating session:", error)
            } else {
                sessionId = session.sessionId;
                console.log("Session ID: " + sessionId);
            }
        });