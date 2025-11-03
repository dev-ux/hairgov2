// services/payment.service.js
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * Service de paiement pour gérer les transactions Mobile Money
 */
class PaymentService {
  constructor() {
    this.apiUrl = process.env.PAYMENT_API_URL || 'https://api.payment-provider.com';
    this.apiKey = process.env.PAYMENT_API_KEY;
    this.merchantId = process.env.MERCHANT_ID;
  }

  /**
   * Initialiser un paiement Mobile Money
   */
  async initiateMobileMoneyPayment(amount, phoneNumber, currency = 'XOF') {
    try {
      const paymentId = `pmt_${uuidv4()}`;
      
      const response = await axios.post(
        `${this.apiUrl}/payments/initiate`,
        {
          paymentId,
          amount,
          currency,
          phoneNumber,
          merchantId: this.merchantId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        paymentId: response.data.paymentId,
        status: response.data.status,
        message: 'Paiement initié avec succès',
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du paiement:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Échec de l\'initialisation du paiement',
        error: error.message
      };
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  async checkPaymentStatus(paymentId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/payments/${paymentId}/status`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        status: response.data.status,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du statut du paiement:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Échec de la vérification du statut',
        error: error.message
      };
    }
  }

  /**
   * Effectuer un remboursement
   */
  async processRefund(paymentId, amount) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/payments/refund`,
        {
          paymentId,
          amount,
          merchantId: this.merchantId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        refundId: response.data.refundId,
        status: response.data.status,
        message: 'Remboursement effectué avec succès',
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors du remboursement:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Échec du remboursement',
        error: error.message
      };
    }
  }

  /**
   * Valider une transaction
   */
  async validateTransaction(transactionId) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/transactions/validate`,
        { transactionId },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        message: 'Transaction validée avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la validation de la transaction:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Échec de la validation de la transaction',
        error: error.message
      };
    }
  }
}

module.exports = new PaymentService();