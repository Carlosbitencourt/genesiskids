
import { PixData } from '../types';

const ABACATEPAY_API_KEY = 'abc_dev_rLgqssDLTAwWs0KGm2ajnAxW';
const ABACATEPAY_BASE_URL = 'https://api.abacatepay.com/v1';

export const abacatepayService = {
    createPixPayment: async (amountCents: number, user: { name: string, email: string }, productName: string): Promise<PixData | null> => {
        try {
            const response = await fetch(`${ABACATEPAY_BASE_URL}/billing/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ABACATEPAY_API_KEY}`
                },
                body: JSON.stringify({
                    frequency: 'ONE_TIME',
                    methods: ['PIX'],
                    products: [{
                        externalId: `credits-${Date.now()}`,
                        name: productName,
                        quantity: 1,
                        price: amountCents
                    }],
                    // For now using placeholder data for mandatory fields if required by API
                    // In a real app, these should be collected from the user
                    customer: {
                        name: user.name,
                        email: user.email,
                        taxId: '00000000000', // Placeholder CPF
                        cellphone: '00000000000' // Placeholder Phone
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Abacatepay error:', errorData);
                return null;
            }

            const result = await response.json();

            if (result && result.data) {
                return {
                    id: result.data.id,
                    brCode: result.data.pix.copyAndPaste,
                    brCodeBase64: result.data.pix.qrCode
                };
            }

            return null;
        } catch (error) {
            console.error('Failed to create PIX payment:', error);
            return null;
        }
    },

    checkPaymentStatus: async (billingId: string): Promise<'PENDING' | 'PAID' | 'EXPIRED' | null> => {
        try {
            const response = await fetch(`${ABACATEPAY_BASE_URL}/billing/list`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${ABACATEPAY_API_KEY}`
                }
            });

            if (!response.ok) return null;

            const result = await response.json();
            const billing = result.data.find((b: any) => b.id === billingId);

            return billing ? billing.status : null;
        } catch (error) {
            console.error('Failed to check payment status:', error);
            return null;
        }
    }
};
