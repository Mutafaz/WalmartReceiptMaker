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
  receiptRef?: React.RefObject<HTMLDivElement>;
}

export default function ReceiptPreview({
  storeInfo,
  receiptInfo,
  paymentInfo,
  items,
  formattedDate,
  subtotal,
  taxAmount,
  total,
  receiptRef
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
          
          <div 
            id="receipt-preview" 
            ref={receiptRef}
            className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto"
            style={{
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '12px',
              lineHeight: '1.2',
              width: '300px',
              margin: '0 auto',
              padding: '20px',
            }}
          >
            {/* Store Logo and Info */}
            <div className="text-center mb-3">
              {storeInfo.useCustomLogo && storeInfo.customLogo ? (
                <img 
                  src={storeInfo.customLogo} 
                  alt="Custom logo" 
                  className="h-20 mx-auto mb-2"
                />
              ) : (
                <div className="text-center">
                  <img 
                    src="/walmart-logo.png" 
                    alt="Walmart logo" 
                    className="h-16 mx-auto mb-2"
                  />
                  <div className="text-[11px] font-extrabold mb-2 text-walmart-black" style={{textShadow: '0 0 0.5px black'}}>Save money. Live better.</div>
                </div>
              )}
              <div className="font-extrabold uppercase" style={{textShadow: '0 0 0.5px black'}}>{storeInfo.address}</div>
              <div className="font-extrabold uppercase" style={{textShadow: '0 0 0.5px black'}}>{storeInfo.city}, {storeInfo.stateZip}</div>
              <div className="font-extrabold uppercase" style={{textShadow: '0 0 0.5px black'}}>STORE #{storeInfo.number} ({storeInfo.phone})</div>
              <div className="font-extrabold uppercase mt-0.5" style={{textShadow: '0 0 0.5px black'}}>STR MANAGER {storeInfo.manager}</div>
            </div>
            
            {/* Receipt Info */}
            <div className="text-center mb-2 font-extrabold" style={{textShadow: '0 0 0.5px black'}}>
              <div>SUPERCENTER</div>
            </div>
            
            {/* Date and Register Info */}
            <div className="flex justify-between mb-3 font-extrabold text-[10px]" style={{textShadow: '0 0 0.5px black'}}>
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
                <div key={item.id} className="flex justify-between mb-1 font-extrabold" style={{textShadow: '0 0 0.5px black'}}>
                  <div className="flex-1">
                    <div className="flex">
                      <span className="uppercase flex-1">{item.name || 'Item'}</span>
                      <span className="w-12 text-right">{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</span>
                    </div>
                    {parseInt(item.quantity) > 1 && (
                      <div className="text-[9px] pl-4 font-extrabold" style={{textShadow: '0 0 0.5px black'}}>
                        {item.quantity} FOR ${(parseFloat(item.price)).toFixed(2)} EACH
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Totals with right alignment */}
            <div className="border-t border-black pt-2 mb-3 font-extrabold" style={{textShadow: '0 0 0.5px black'}}>
              <div className="flex justify-between">
                <div className="text-left flex-1">SUBTOTAL</div>
                <div className="text-right w-12">{subtotal.toFixed(2)}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-left flex-1">TAX {paymentInfo.taxRate}%</div>
                <div className="text-right w-12">{taxAmount.toFixed(2)}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-left flex-1 font-extrabold">TOTAL</div>
                <div className="text-right w-12 font-extrabold">{total.toFixed(2)}</div>
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="mb-3 font-extrabold" style={{textShadow: '0 0 0.5px black'}}>
              <div className="flex justify-between">
                <div className="text-left flex-1">{paymentInfo.method} TEND</div>
                <div className="text-right w-12">{total.toFixed(2)}</div>
              </div>
              
              {paymentInfo.method !== "CASH" && (
                <div className="text-[10px] font-extrabold" style={{textShadow: '0 0 0.5px black'}}>
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
            <div className="font-extrabold text-center text-[10px] border-t border-black pt-2 mb-1" style={{textShadow: '0 0 0.5px black'}}>
              <div># ITEMS SOLD {items.length}</div>
              <div className="text-center">
                <div>TC# {transactionNumber}</div>
              </div>
            </div>
            
            {/* Survey Section */}
            <div className="text-center border-t border-b border-black py-2 my-2">
              <div className="text-[10px] leading-tight font-extrabold" style={{textShadow: '0 0 0.5px black'}}>
                <div className="font-extrabold">WE VALUE YOUR OPINION!</div>
                <div className="mt-1">Please give us your feedback at</div>
                <div className="font-extrabold">www.survey.walmart.com</div>
                <div>or call 1-800-925-6278</div>
                <div className="mt-1">for a chance to win a $1000 WALMART SHOPPING CARD</div>
                <div className="mt-1">Enter: {storeInfo.surveyCode}</div>
              </div>
            </div>
            
            {/* Receipt rules */}
            <div className="text-[9px] text-center mb-2 font-extrabold" style={{textShadow: '0 0 0.5px black'}}>
              <div className="font-extrabold">YOUR RECEIPT FEATURES WALMART PAY</div>
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
                className="h-7 mx-auto"
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
            <div className="text-center text-[10px] border-t border-black pt-2 font-extrabold" style={{textShadow: '0 0 0.5px black'}}>
              <div className="mb-1">{formattedDate}</div>
              <div className="mb-1">CSM# {receiptInfo.cashier}</div>
              <div className="uppercase mb-1">thank you for shopping at walmart</div>
              <div className="font-extrabold text-walmart-blue">Save Money. Live Better.</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
