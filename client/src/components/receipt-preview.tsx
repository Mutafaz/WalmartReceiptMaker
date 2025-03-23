import { Card, CardContent } from "@/components/ui/card";
import { StoreInfo, ReceiptInfo, PaymentInfo, ReceiptItem } from "@/pages/home";

interface ReceiptPreviewProps {
  storeInfo: StoreInfo;
  receiptInfo: ReceiptInfo;
  paymentInfo: PaymentInfo;
  items: ReceiptItem[];
  formattedDate: string;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export default function ReceiptPreview({
  storeInfo,
  receiptInfo,
  paymentInfo,
  items,
  formattedDate,
  subtotal,
  taxAmount,
  total
}: ReceiptPreviewProps) {
  // Generate random transaction number
  const transactionNumber = (() => {
    const numbers = [];
    for (let i = 0; i < 6; i++) {
      numbers.push(Math.floor(Math.random() * 10000).toString().padStart(4, '0'));
    }
    return numbers.join(' ');
  })();

  return (
    <div className="lg:col-span-2 sticky top-6">
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-2 text-center">Receipt Preview</h2>
          
          <div id="receipt-preview" className="receipt-paper p-4 mx-auto max-w-md border border-gray-200 font-receipt text-sm leading-tight">
            {/* Store Logo and Info */}
            <div className="text-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 130 24"
                className="h-8 mx-auto mb-1 fill-current text-walmart-blue"
              >
                <path d="M95.65,19.51c-.56,1.46-1.31,2.88-2.2,4.28a1.11,1.11,0,0,1-.91.21,9.93,9.93,0,0,0-1.68,0,.65.65,0,0,1-.7-.42Q86.94,17.16,83.67,10.8a.78.78,0,0,1-.07-.35c0-.11.07-.15.18-.15H87a1,1,0,0,1,1.05.77c1,2.72,2.1,5.41,3.13,8.13h.07c.08-.25.17-.49.26-.74L94.24,11c.3-.81.61-1.62.92-2.42.16-.4.38-.58.82-.58h3.05c.12,0,.19,0,.19.15a.34.34,0,0,1-.7.18C98,11.14,96.83,15.32,95.65,19.51Z"/>
                <path d="M68.11,11.62c.19-3,3.26-5.3,7-5.19a7.12,7.12,0,0,1,6.59,4.37.78.78,0,0,1,0,.7,7.85,7.85,0,0,1-6.64,4.72c-3.78.28-7-2.3-7-4.6ZM79,11.9h0c0-2.27-1.69-3.49-3.71-3.49-1.64,0-3.42.78-3.7,2.8-.3,2.2,1.68,3.52,3.7,3.52S78.91,13.62,79,11.9Z"/>
                <path d="M124.87,16.2c-.12,0-.12.07-.17.14-.91,1.63-2.54,2.47-5,2.38-2-.05-3.13-1.25-2.94-3,0-.43.18-.56.58-.56,1,0,2.08,0,3.12,0a.42.42,0,0,1,.49.35c.21.61.63.88,1.33.84a1.28,1.28,0,0,0,1.22-.91c.08-.28,0-.4-.24-.5-1.12-.39-2.26-.7-3.37-1.09-1.33-.47-1.92-1.26-1.92-2.4s.7-2,2-2.68a6.88,6.88,0,0,1,5.39-.2,3.29,3.29,0,0,1,2.17,2.18c.1.3,0,.42-.32.42-1,0-2,0-3,0a.35.35,0,0,1-.4-.26c-.16-.57-.55-.85-1.18-.83a1.25,1.25,0,0,0-1.22.88c-.1.3,0,.44.26.52a25.4,25.4,0,0,0,2.89.95,4.86,4.86,0,0,1,2.89,1.72,2.51,2.51,0,0,1,.35,2.08Z"/>
                <path d="M109.64,8c2.33-.14,3.89.51,4.76,1.89l-3.32.25a.39.39,0,0,0-.35.27,1.17,1.17,0,0,1-1.22.8,1.23,1.23,0,0,1-1.22-.85c-.07-.21-.19-.25-.39-.25-.93,0-1.85,0-2.78,0-.17,0-.21,0-.24.21a2.83,2.83,0,0,0,2.07,3.3,5.44,5.44,0,0,0,4.46-.86c.44-.3.47-.28.75.21.54.95,1.09,1.9,1.64,2.84.12.21.13.33-.9.51a8.88,8.88,0,0,1-7.77,1A6.16,6.16,0,0,1,102,11.61C102.21,9,104.33,7.29,109.64,8Z"/>
                <path d="M50.87,8a12.81,12.81,0,0,1,4.49.73,3.4,3.4,0,0,1,2.06,2.43c0,.1,0,.14-.12.14H54a.38.38,0,0,1-.35-.19,1.3,1.3,0,0,0-1.22-.88,1.23,1.23,0,0,0-1.25.85.32.32,0,0,1-.37.26c-.92,0-1.85,0-2.77,0-.35,0-.37,0-.28.37a3,3,0,0,0,2.41,2.31,6.21,6.21,0,0,0,3.25-.14,3.48,3.48,0,0,0,1.15-.65c.38-.32.41-.3.7.15.55,1,1.13,1.92,1.67,2.88.1.18.12.32-.7.49a8.84,8.84,0,0,1-8.54,1c-3.09-1.22-4.5-4.34-3.24-7.51A5.35,5.35,0,0,1,50.87,8Z"/>
                <path d="M45.52,10.31c0,.14-.7.19-.16.26a8.66,8.66,0,0,1-6.3,2.89,7.41,7.41,0,0,1-1.93-.24c-2.14-.51-3.31-2-3.17-4.12S35.8,5.9,38,6c.26,0,.35.09.35.37q0,1.56,0,3.12c0,.33.1.49.44.5.54,0,1.08,0,1.62,0,.42,0,.54-.17.44-.55-.32-1.2-.66-2.4-1-3.59-.07-.27,0-.36.24-.39A6.5,6.5,0,0,1,44,6.37a3.37,3.37,0,0,1,1.51,2.2C45.58,9,45.57,9.54,45.52,10.31Zm-7.26-.05h-.07V6.88A3.89,3.89,0,0,0,35.41,8.4,3.86,3.86,0,0,0,35,10.26Z"/>
                <path d="M56.51,13.46c.33-.81.67-1.61,1-2.4,1-2.45,2-4.91,3-7.35a.69.69,0,0,1,.7-.52c.82,0,1.64,0,2.45,0a.69.69,0,0,1,.75.54q2,5,4,10.06c0,.12.9.23.14.35a.17.17,0,0,1-.19.07c-1,0-2.06,0-3.09,0a.82.82,0,0,1-.91-.64c-.19-.57-.42-1.13-.63-1.7a.77.77,0,0,0-.84-.58c-1.08,0-2.17,0-3.25,0a.79.79,0,0,0-.86.58c-.21.59-.46,1.17-.65,1.77a.73.73,0,0,1-.8.57c-1,0-2.06,0-3.09,0-.14,0-.21,0-.14-.17S56.3,13.94,56.51,13.46Zm3-4.37-.95,2.57h1.87L59.5,9.09Z"/>
                <path d="M15.91,13.4c.12,0,.15.09.19.17a3.73,3.73,0,0,0,3.42,2.12,5.11,5.11,0,0,0,3.27-1.09c.28-.22.53-.49.8-.73.14-.13.21-.13.33,0q1.5,1.62,3,3.25c.14.14.14.21,0,.37a8.72,8.72,0,0,1-7.38,3.5,8.86,8.86,0,0,1-6.76-3.53,8.24,8.24,0,0,1-1.63-6,8.39,8.39,0,0,1,2.83-5.46,8.86,8.86,0,0,1,12.42.49.38.38,0,0,1,.12.37c0,.1-.12.1-.21.1-1,0-2.06,0-3.09,0a.46.46,0,0,1-.42-.17,4.47,4.47,0,0,0-3-1.15A3.92,3.92,0,0,0,16,10.21,4,4,0,0,0,15.91,13.4Z"/>
                <path d="M127.78,18.4a.69.69,0,0,1-.77-.42c-1.64-3.94-3.29-7.87-4.95-11.81-.05-.12-.1-.23,0-.35s.19-.1.31-.1h3.53a.77.77,0,0,1,.82.63c.9,2.6,1.82,5.19,2.73,7.79.5.13.1.26.16.39a.36.36,0,0,0,.07-.14c.94-2.68,1.87-5.36,2.8-8a.76.76,0,0,1,.82-.63h3.53c.14,0,.23,0,.28.16s0,.19-.05.28q-2.48,5.91-5,11.81a.73.73,0,0,1-.77.42Z"/>
                <path d="M9,9.42H5.94c-.14,0-.21,0-.17-.19a5.86,5.86,0,0,1,5-4.07,8.27,8.27,0,0,1,5.54,1,.43.43,0,0,1,.24.42c0,.92,0,1.85,0,2.77,0,.14,0,.21-.19.21-.47,0-.93,0-1.39,0-.38,0-.44-.09-.35-.47a4.59,4.59,0,0,0,.21-1,1.79,1.79,0,0,0-1.34-1.5,3.19,3.19,0,0,0-2.8.37A2.51,2.51,0,0,0,9,9.42Z"/>
                <path d="M97.17,13.43a1.87,1.87,0,0,1,1.85,1.89,1.83,1.83,0,0,1-1.87,1.83,1.88,1.88,0,0,1-1.83-1.89A1.84,1.84,0,0,1,97.17,13.43Z"/>
              </svg>
              <div className="uppercase">{storeInfo.address}</div>
              <div className="uppercase">{storeInfo.city}</div>
              <div className="uppercase">{storeInfo.stateZip}</div>
              <div className="uppercase">{storeInfo.phone}</div>
              <div>STORE # {storeInfo.number}</div>
            </div>
            
            {/* Cashier and Date Info */}
            <div className="flex justify-between text-xs mb-3">
              <div>
                <div>CASHIER {receiptInfo.cashier}</div>
                <div>REGISTER # {receiptInfo.register}</div>
              </div>
              <div>{formattedDate}</div>
            </div>
            
            {/* Items List */}
            <div className="border-t border-b border-dotted border-gray-400 py-2 mb-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between mb-1">
                  <div>
                    <span className="mr-2">{item.name || 'Item'}</span>
                    <span>{item.quantity}</span>
                  </div>
                  <div>
                    {(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Totals */}
            <div className="flex justify-between text-sm">
              <div>SUBTOTAL</div>
              <div>{subtotal.toFixed(2)}</div>
            </div>
            <div className="flex justify-between text-sm">
              <div>TAX ({paymentInfo.taxRate}%)</div>
              <div>{taxAmount.toFixed(2)}</div>
            </div>
            <div className="flex justify-between text-sm font-bold mb-4">
              <div>TOTAL</div>
              <div>{total.toFixed(2)}</div>
            </div>
            
            {/* Payment Method */}
            <div className="border-t border-dotted border-gray-400 pt-2 mb-3">
              <div className="flex justify-between">
                <div>{paymentInfo.method}</div>
                <div>{total.toFixed(2)}</div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="text-center text-xs mt-4">
              <div className="mb-2"># ITEMS SOLD {items.length}</div>
              <div>TC# {transactionNumber}</div>
              <div className="mt-2">THANK YOU FOR SHOPPING WITH US</div>
              <div className="mt-1">Save Money. Live Better.</div>
            </div>

            <div className="mt-4 text-center">
              <div className="text-xs">
                <div>{formattedDate}</div>
                <div className="font-bold">Customer Copy</div>
              </div>
              <div className="border-t border-dashed border-gray-300 my-2"></div>
              <div className="text-[10px] leading-tight mt-2">
                Return policy: Most items can be returned within 90 days.
                Exceptions may apply. See Walmart.com or store for details.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
