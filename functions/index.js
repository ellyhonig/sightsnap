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
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin SDK
admin.initializeApp();

// Load Stripe with your secret from Firebase config
const stripe = require('stripe')(functions.config().stripe.secret);

/**
 * createPaymentIntent
 *
 * Creates a payment intent for $5.00 USD.
 */
exports.createPaymentIntent = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    if (request.method !== 'POST') {
      response.status(405).send('Method Not Allowed');
      return;
    }
    try {
      // Create a payment intent
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
