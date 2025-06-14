const Alexa = require('ask-sdk-core');
const axios = require('axios');
const FormData = require('form-data');

// Call your custom API with form-data
const getCustomAPIResponse = async (query) => {
    const url = 'https://test.aptilab.in/api/process/test/gem/';

    const form = new FormData();
    form.append('query', query);

    const response = await axios.post(url, form, {
        headers: form.getHeaders()
    });

    return response.data.data.data; // Assumes structure { data: { data: "<reply>" } }
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Hi! You can ask me anything. Go ahead.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Please say something.')
            .getResponse();
    }
};

const AskLLMIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'AskLLMIntent';
    },
    async handle(handlerInput) {
        const query = handlerInput.requestEnvelope.request.intent.slots.query.value;
        let reply;

        try {
            reply = await getCustomAPIResponse(query);
        } catch (error) {
            console.error("API error:", error);
            reply = "Sorry, I couldn't get an answer right now.";
        }

        return handlerInput.responseBuilder
            .speak(reply)
            .reprompt('Do you want to ask something else?')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say, ask Alaap who is Einstein.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent' ||
             Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Goodbye!')
            .getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Sorry, I didn\'t understand that. Please try again.')
            .reprompt('Please say that again.')
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.error("Error handled:", error);
        return handlerInput.responseBuilder
            .speak('Sorry, something went wrong.')
            .reprompt('Please try again.')
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        AskLLMIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
