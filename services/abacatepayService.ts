
import { PixData } from '../types';

const ABACATEPAY_API_KEY = 'abc_dev_rLgqssDLTAwWs0KGm2ajnAxW';
const ABACATEPAY_BASE_URL = 'https://api.abacatepay.com/v1';

export const abacatepayService = {
    createPixPayment: async (amountCents: number): Promise<PixData | null> => {
        try {
            const response = await fetch(`${ABACATEPAY_BASE_URL}/pixQrCode/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ABACATEPAY_API_KEY}`
                },
                body: JSON.stringify({
                    amount: amountCents,
                    expiresIn: 3600, // 1 hour
                    description: 'Recarga de créditos Genesis Kids'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Abacatepay error:', errorData);
                return null;
            }

            const result = await response.json();

            // Based on docs research: response.data contains brCode and brCodeBase64
            if (result && result.data) {
                return {
                    id: result.data.id,
                    brCode: result.data.brCode,
                    brCodeBase64: result.data.brCodeBase64
                };
            }

            return null;
        } catch (error) {
            console.error('Failed to create PIX payment:', error);
            return null;
        }
    }
};
