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
          
          <div id="receipt-preview" className="receipt-paper p-4 mx-auto max-w-md border border-gray-200 font-receipt text-[11px] leading-tight text-black">
            {/* Store Logo and Info */}
            <div className="text-center mb-3">
              {storeInfo.useCustomLogo && storeInfo.customLogo ? (
                <img 
                  src={storeInfo.customLogo} 
                  alt="Custom logo" 
                  className="h-12 mx-auto mb-2"
                />
              ) : (
                <div className="text-center">
                  <img 
                    src="/walmart-logo.png" 
                    alt="Walmart logo" 
                    className="h-8 mx-auto mb-2"
                  />
                  <div className="text-[10px] font-semibold mb-2 text-walmart-black">Save money. Live better.</div>
                </div>
              )}
              <div className="font-semibold uppercase">{storeInfo.address}</div>
              <div className="font-semibold uppercase">{storeInfo.city}, {storeInfo.stateZip}</div>
              <div className="font-semibold uppercase">STORE #{storeInfo.number} ({storeInfo.phone})</div>
              <div className="font-semibold uppercase mt-0.5">STR MANAGER {storeInfo.manager}</div>
            </div>
            
            {/* Receipt Info */}
            <div className="text-center mb-2 font-semibold">
              <div>SUPERCENTER</div>
            </div>
            
            {/* Date and Register Info */}
            <div className="flex justify-between mb-3 font-semibold text-[10px]">
              <div>
                <div>OP# {receiptInfo.operator}</div>
                <div>TE# {receiptInfo.terminal}</div>
              </div>
              <div className="text-right">
                <div>{formattedDate}</div>
                <div>CASHIER {receiptInfo.cashier}</div>
                <div>REGISTER #{receiptInfo.register}</div>
              </div>
            </div>
            
            {/* Items List */}
            <div className="border-t border-black pt-1 mb-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between mb-1 font-semibold">
                  <div className="flex-1">
                    <div className="flex">
                      <span className="uppercase flex-1">{item.name || 'Item'}</span>
                      <span className="w-12 text-right">{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</span>
                    </div>
                    {parseInt(item.quantity) > 1 && (
                      <div className="text-[9px] pl-4">
                        {item.quantity} FOR ${(parseFloat(item.price)).toFixed(2)} EACH
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Totals with right alignment */}
            <div className="border-t border-black pt-2 mb-3 font-semibold">
              <div className="flex justify-between">
                <div className="text-left flex-1">SUBTOTAL</div>
                <div className="text-right w-12">{subtotal.toFixed(2)}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-left flex-1">TAX 1 {paymentInfo.taxRate}%</div>
                <div className="text-right w-12">{taxAmount.toFixed(2)}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-left flex-1 font-bold">TOTAL</div>
                <div className="text-right w-12 font-bold">{total.toFixed(2)}</div>
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="mb-3 font-semibold">
              <div className="flex justify-between">
                <div className="text-left flex-1">{paymentInfo.method} TEND</div>
                <div className="text-right w-12">{total.toFixed(2)}</div>
              </div>
              
              {paymentInfo.method !== "CASH" && (
                <div className="text-[10px]">
                  <div className="flex justify-between">
                    <div className="text-left flex-1">ACCOUNT #</div>
                    <div className="text-right">XXXXXXXXXXXX{paymentInfo.cardLastFour}</div>
                  </div>
                  <div className="flex">
                    <div className="text-left flex-1">APPROVAL</div>
                    <div className="text-right">{paymentInfo.approvalCode}</div>
                  </div>
                  <div className="flex">
                    <div className="text-left flex-1">REF #</div>
                    <div className="text-right">{paymentInfo.referenceNumber}</div>
                  </div>
                  <div className="flex">
                    <div className="text-left flex-1">NETWORK ID</div>
                    <div className="text-right">{paymentInfo.networkId}</div>
                  </div>
                  <div className="flex">
                    <div className="text-left flex-1">APPLICATION LABEL</div>
                    <div className="text-right uppercase">{paymentInfo.method.toLowerCase()}</div>
                  </div>
                  <div className="flex">
                    <div className="text-left flex-1">AID</div>
                    <div className="text-right">{paymentInfo.aid}</div>
                  </div>
                  <div className="flex">
                    <div className="text-left flex-1">TC</div>
                    <div className="text-right">{paymentInfo.arc}</div>
                  </div>
                  <div className="flex">
                    <div className="text-left flex-1">CHANGE DUE</div>
                    <div className="text-right">${paymentInfo.change}</div>
                  </div>
                </div>
              )}
              
              {paymentInfo.method === "CASH" && (
                <div className="flex justify-between">
                  <div className="text-left flex-1">CASH TEND</div>
                  <div className="text-right w-12">{total.toFixed(2)}</div>
                </div>
              )}
            </div>
            
            {/* Item count and transaction code */}
            <div className="font-semibold text-center text-[10px] border-t border-black pt-2 mb-1">
              <div># ITEMS SOLD {items.length}</div>
              <div className="text-center">
                <div>TC# {transactionNumber}</div>
              </div>
            </div>
            
            {/* Survey Section */}
            <div className="text-center border-t border-b border-black py-2 my-2">
              <div className="text-[10px] leading-tight">
                <div className="font-bold">WE VALUE YOUR OPINION!</div>
                <div className="mt-1">Please give us your feedback at</div>
                <div className="font-bold">www.survey.walmart.com</div>
                <div>or call 1-800-925-6278</div>
                <div className="mt-1">for a chance to win a $1000 WALMART SHOPPING CARD</div>
                <div className="mt-1">Enter: {storeInfo.surveyCode}</div>
              </div>
            </div>
            
            {/* Receipt rules */}
            <div className="text-[9px] text-center mb-2 font-semibold">
              <div className="font-bold">YOUR RECEIPT FEATURES WALMART PAY</div>
              <div className="mt-1">See store for Rx price match details.</div>
              <div className="mt-1 leading-tight">
                RETURNS MUST BE MADE WITHIN 90 DAYS. SOME ITEMS CANNOT BE RETURNED.
              </div>
              <div className="mt-1 leading-tight">
                SEE BACK OF RECEIPT, WALMART.COM OR STORE FOR DETAILS.
              </div>
            </div>
            
            {/* Barcode */}
            <div className="my-2">
              <svg
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 100 30"
                className="h-6 mx-auto"
              >
                <g fill="#000000">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <rect 
                      key={i} 
                      x={i * 3 + 5} 
                      y={5} 
                      width={(i % 3 === 0) ? 1 : 2} 
                      height={20} 
                    />
                  ))}
                </g>
              </svg>
            </div>
            
            {/* Footer */}
            <div className="text-center text-[10px] border-t border-black pt-2 font-semibold">
              <div className="mb-1">{formattedDate}</div>
              <div className="mb-1">CSM# {receiptInfo.cashier}</div>
              <div className="uppercase mb-1">thank you for shopping at walmart</div>
              <div className="font-bold text-walmart-blue">Save Money. Live Better.</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
