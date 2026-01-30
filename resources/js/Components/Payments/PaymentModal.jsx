import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Modal from '@/Components/Modal';
import CheckoutForm from './CheckoutForm';
import useTranslation from '@/Hooks/useTranslation';

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

export default function PaymentModal({ show, clientSecret, onClose, onSuccess }) {
    const { t } = useTranslation();

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#E07A5F', // oflem-terracotta
                colorBackground: '#ffffff',
                colorText: '#18181B',
                colorDanger: '#df1b41',
                fontFamily: 'Outfit, system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '12px',
            },
        },
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-8 md:p-12">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-black text-oflem-charcoal mb-2">
                        {t("Secure Payment Hold")}
                    </h2>
                    <p className="text-sm font-medium text-gray-muted">
                        {t("Please authorize the mission budget. Funds will only be released after completion.")}
                    </p>
                </div>

                {clientSecret && (
                    <Elements options={options} stripe={stripePromise}>
                        <CheckoutForm onCancel={onClose} onSuccess={onSuccess} />
                    </Elements>
                )}
            </div>
        </Modal>
    );
}
