import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import useTranslation from '@/Hooks/useTranslation';

export default function CheckoutForm({ onCancel, onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const { t } = useTranslation();

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL is not strictly needed for PaymentIntent 'manual' capture 
                // but Stripe requires it for some payment methods.
                return_url: window.location.href,
            },
            redirect: 'if_required',
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message);
            } else {
                setMessage(t("An unexpected error occurred."));
            }
        } else {
            // Success! The mission status will update via Webhook.
            onSuccess();
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
            
            <div className="flex flex-col gap-3 pt-4">
                <PrimaryButton
                    disabled={isLoading || !stripe || !elements}
                    id="submit"
                    className="w-full py-4 text-base bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light hover:bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light/90"
                >
                    <span id="button-text">
                        {isLoading ? <div className="spinner" id="spinner"></div> : t("Authorize Payment Hold")}
                    </span>
                </PrimaryButton>
                
                <SecondaryButton 
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="w-full py-4 text-base"
                >
                    {t("Cancel")}
                </SecondaryButton>
            </div>

            {/* Show any error or success messages */}
            {message && (
                <div id="payment-message" className="text-red-500 text-sm font-bold text-center animate-pulse">
                    {message}
                </div>
            )}
            
            <p className="text-[10px] text-gray-muted text-center leading-relaxed">
                {t("Funds will be held securely by Oflem and only released after you validate the mission completion.")}
            </p>
        </form>
    );
}
