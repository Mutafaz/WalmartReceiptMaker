import { useState, useRef } from "react";
import ReceiptForm from "@/components/receipt-form";
import ReceiptPreview from "@/components/receipt-preview";
import HelpModal from "@/components/help-modal";
import {
  generateRandomId,
  generateRandomStoreNumber,
  generateRandomLocation,
  generateRandomPhone,
  generateRandomManager,
  generateRandomSurveyCode,
  generateRandomRegister,
  generateRandomDateTime
} from "@/utils/random";

export type StoreInfo = {
  number: string;
  address: string;
  city: string;
  stateZip: string;
  phone: string;
  manager: string;
  surveyCode: string;
  useCustomLogo: boolean;
  customLogo: string | null;
};

export type ReceiptInfo = {
  date: string;
  cashier: string;
  register: string;
  terminal: string;
  operator: string;
};

export type PaymentInfo = {
  taxRate: string;
  method: "CREDIT" | "DEBIT" | "CASH" | "GIFT CARD";
  cardLastFour: string;
  change: string;
  approvalCode: string;
  referenceNumber: string;
  networkId: string;
  aid: string;
  arc: string;
};

export type ReceiptItem = {
  id: string;
  name: string;
  price: string;
  quantity: string;
};

export default function Home() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    number: "5260",
    address: "300 WALMART WAY",
    city: "BENTONVILLE",
    stateZip: "AR 72712",
    phone: "(479) 555-1234",
    manager: "SHERRIE BLACK",
    surveyCode: "7N5P0L1SL09X",
    useCustomLogo: false,
    customLogo: null
  });

  const [receiptInfo, setReceiptInfo] = useState<ReceiptInfo>({
    date: new Date().toISOString().slice(0, 16),
    cashier: "JOHN",
    register: "12",
    terminal: "SC011053",
    operator: "00482"
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    taxRate: "6.625",
    method: "DEBIT",
    cardLastFour: "1924",
    change: "0.00",
    approvalCode: "001920",
    referenceNumber: "117700287029",
    networkId: "0056",
    aid: "A0000000093840",
    arc: "R483019039445"
  });

  const [items, setItems] = useState<ReceiptItem[]>([
    { id: "1", name: "Great Value Milk 1 Gallon", price: "3.48", quantity: "1" },
    { id: "2", name: "Bananas", price: "1.24", quantity: "1" },
  ]);

  const receiptRef = useRef<HTMLDivElement>(null);

  // Calculate formatted date for receipt display
  const formattedDate = (() => {
    const date = new Date(receiptInfo.date);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  })();

  // Calculate totals
  const subtotal = items.reduce((sum: number, item: ReceiptItem) => {
    return sum + (parseFloat(item.price) * parseInt(item.quantity));
  }, 0);

  const taxAmount = subtotal * (parseFloat(paymentInfo.taxRate) / 100);
  const total = subtotal + taxAmount;

  const randomizeInfo = () => {
    const location = generateRandomLocation();
    setStoreInfo(prev => ({
      ...prev,
      number: generateRandomStoreNumber(),
      address: location.address,
      city: location.city,
      stateZip: location.stateZip,
      phone: generateRandomPhone(),
      manager: generateRandomManager(),
      surveyCode: generateRandomSurveyCode()
    }));

    setReceiptInfo(prev => ({
      ...prev,
      date: generateRandomDateTime(),
      cashier: generateRandomManager().split(' ')[0],
      register: generateRandomRegister(),
      terminal: `SC${generateRandomId(6)}`,
      operator: generateRandomId(5)
    }));

    setPaymentInfo(prev => ({
      ...prev,
      cardLastFour: generateRandomId(4),
      approvalCode: generateRandomId(6),
      referenceNumber: generateRandomId(12),
      networkId: generateRandomId(4),
      aid: `A${generateRandomId(15)}`,
      arc: `R${generateRandomId(12)}`
    }));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-walmart-blue text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 inline mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              Walmart Receipt Generator
            </h1>
          </div>
          <button 
            onClick={() => setHelpOpen(true)}
            className="bg-walmart-yellow text-walmart-dark px-3 py-1 rounded-md text-sm font-medium hover:bg-yellow-400 transition"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 inline mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            Help
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <ReceiptForm 
            storeInfo={storeInfo}
            setStoreInfo={setStoreInfo}
            receiptInfo={receiptInfo}
            setReceiptInfo={setReceiptInfo}
            paymentInfo={paymentInfo}
            setPaymentInfo={setPaymentInfo}
            items={items}
            setItems={setItems}
            randomizeInfo={randomizeInfo}
          />

          {/* Preview */}
          <ReceiptPreview 
            storeInfo={storeInfo}
            receiptInfo={receiptInfo}
            paymentInfo={paymentInfo}
            items={items}
            formattedDate={formattedDate}
            subtotal={subtotal}
            taxAmount={taxAmount}
            total={total}
            receiptRef={receiptRef}
          />
        </div>
      </main>

      {/* Help Modal */}
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}