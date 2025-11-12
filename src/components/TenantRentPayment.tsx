import { useState, useEffect } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, X, CreditCard } from "lucide-react";

interface PaymentFormProps {
  amount: number;
  clientId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function PaymentForm({ amount, clientId, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setErrorMessage("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed");
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        await fetch("/api/stripe/record-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId,
            amount,
            paymentIntentId: paymentIntent.id,
          }),
        });

        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300 font-medium">Amount Due:</span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            ${amount.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          {processing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

interface TenantRentPaymentProps {
  clientId: number | null;
  rentAmount: number;
  onPaymentSuccess: () => void;
}

export default function TenantRentPayment({ clientId, rentAmount, onPaymentSuccess }: TenantRentPaymentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);

  const initiatePayment = async () => {
    if (!clientId) {
      alert("Your account is not linked to a client record. Please contact your property manager.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: rentAmount,
          clientId,
          description: "Monthly rent payment",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate payment");
      }

      setClientSecret(data.clientSecret);
      setIsOpen(true);
    } catch (error: any) {
      alert(error.message || "Failed to start payment process");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsOpen(false);
    setClientSecret("");
    onPaymentSuccess();
  };

  const handleCancel = () => {
    setIsOpen(false);
    setClientSecret("");
  };

  return (
    <>
      <button
        onClick={initiatePayment}
        disabled={loading || !clientId || rentAmount <= 0}
        className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <DollarSign className="w-6 h-6" />
        <div className="text-left">
          <div className="font-semibold">Pay Rent</div>
          {rentAmount > 0 && <div className="text-sm opacity-90">${rentAmount.toFixed(2)}</div>}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && clientSecret && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Pay Rent
                </h2>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <Elements
                stripe={getStripe()}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                  },
                }}
              >
                <PaymentForm
                  amount={rentAmount}
                  clientId={clientId!}
                  onSuccess={handleSuccess}
                  onCancel={handleCancel}
                />
              </Elements>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
