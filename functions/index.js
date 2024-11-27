/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')('sk_test_51QPR06DtGYmKpI3FUJvJglztV25EDYActNyZeVq42JmBAxJgC5XPTQwhqK93uuSL2jfuXQ9OU1NUXGpnZysb96sV00gT78VsMB');
const cors = require('cors')({ origin: true });

admin.initializeApp();

exports.createPaymentIntent = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    if (request.method !== 'POST') {
      response.status(405).send('Method Not Allowed');
      return;
    }
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 500, // $5.00 in cents
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log('Payment Intent created:', paymentIntent.client_secret);
      response.send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      response.status(500).send(error.message);
    }
  });
});

exports.stripeWebhook = functions.https.onRequest(async (request, response) => {
  const sig = request.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      request.rawBody,
      sig,
      'whsec_your_webhook_secret'
    );

    if (event.type === 'payment_intent.succeeded') {
      console.log('Payment succeeded:', event.data.object);
    }

    response.json({ received: true });
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
  }
});
