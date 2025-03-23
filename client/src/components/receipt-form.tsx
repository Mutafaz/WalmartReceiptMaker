import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { StoreInfo, ReceiptInfo, PaymentInfo, ReceiptItem } from "@/pages/home";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ReceiptFormProps {
  storeInfo: StoreInfo;
  setStoreInfo: React.Dispatch<React.SetStateAction<StoreInfo>>;
  receiptInfo: ReceiptInfo;
  setReceiptInfo: React.Dispatch<React.SetStateAction<ReceiptInfo>>;
  paymentInfo: PaymentInfo;
  setPaymentInfo: React.Dispatch<React.SetStateAction<PaymentInfo>>;
  items: ReceiptItem[];
  setItems: React.Dispatch<React.SetStateAction<ReceiptItem[]>>;
  randomizeInfo: () => void;
}

export default function ReceiptForm({
  storeInfo,
  setStoreInfo,
  receiptInfo,
  setReceiptInfo,
  paymentInfo,
  setPaymentInfo,
  items,
  setItems,
  randomizeInfo,
}: ReceiptFormProps) {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [walmartUrl, setWalmartUrl] = useState('');
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  // Handle store info changes
  const handleStoreInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const key = id.replace('store-', '') as keyof StoreInfo;
    setStoreInfo(prev => ({ ...prev, [key]: value }));
  };

  // Handle receipt info changes
  const handleReceiptInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const key = id as keyof ReceiptInfo;
    setReceiptInfo(prev => ({ ...prev, [key]: value }));
  };

  // Handle payment info changes
  const handlePaymentInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const key = id.replace('payment-', '') as keyof PaymentInfo;
    setPaymentInfo(prev => ({ ...prev, [key]: value }));
  };

  // Handle payment method change
  const handlePaymentMethodChange = (value: string) => {
    setPaymentInfo(prev => ({ 
      ...prev, 
      method: value as PaymentInfo["method"]
    }));
  };

  // Add a new item
  const addItem = () => {
    setItems(prev => [
      ...prev, 
      { id: nanoid(), name: "", price: "0.00", quantity: "1" }
    ]);
  };

  // Update an item
  const updateItem = (id: string, field: keyof ReceiptItem, value: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, [field]: value } 
          : item
      )
    );
  };

  // Remove an item
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Reset form to defaults
  const resetForm = () => {
    const confirm = window.confirm('Are you sure you want to reset the form? All current data will be lost.');
    if (!confirm) return;

    setStoreInfo({
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

    setReceiptInfo({
      date: new Date().toISOString().slice(0, 16),
      cashier: "JOHN",
      register: "12",
      terminal: "SC011053",
      operator: "00482"
    });

    setPaymentInfo({
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

    setItems([
      { id: "1", name: "Great Value Milk 1 Gallon", price: "3.48", quantity: "1" },
      { id: "2", name: "Bananas", price: "1.24", quantity: "1" },
    ]);

    toast({
      title: "Form Reset",
      description: "The form has been reset to default values.",
    });
  };

  // Print receipt
  const printReceipt = async () => {
    setPrinting(true);
    try {
      const receiptElement = document.getElementById('receipt-preview');
      if (!receiptElement) {
        throw new Error("Receipt element not found");
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error("Could not open print window");
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Walmart Receipt</title>
          <style>
            body {
              font-family: "Courier New", monospace;
              width: 300px;
              margin: 0 auto;
              padding: 20px;
              font-size: 12px;
              line-height: 1.2;
            }
            img {
              max-width: 100%;
            }
            .border-t, .border-b, .border-dotted {
              border-top: 1px dotted #ccc;
              border-bottom: 1px dotted #ccc;
              padding: 8px 0;
              margin: 8px 0;
            }
            .flex {
              display: flex;
              justify-content: space-between;
            }
            .text-center {
              text-align: center;
            }
            .mt-4 {
              margin-top: 16px;
            }
            .text-xs {
              font-size: 10px;
            }
            .mb-3 {
              margin-bottom: 12px;
            }
          </style>
        </head>
        <body>
          ${receiptElement.innerHTML}
        </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      // Print after a short delay to ensure content is loaded
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setPrinting(false);
      }, 500);
    } catch (error) {
      console.error("Error printing receipt:", error);
      toast({
        title: "Print Failed",
        description: "There was an error printing the receipt. Please try again.",
        variant: "destructive",
      });
      setPrinting(false);
    }
  };

  // Download receipt as PDF
  const downloadReceipt = async () => {
    setDownloading(true);
    try {
      const receiptElement = document.getElementById('receipt-preview');
      if (!receiptElement) {
        throw new Error("Receipt element not found");
      }

      const canvas = await html2canvas(receiptElement, {
        scale: 2,
        backgroundColor: null,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [canvas.width / 4, canvas.height / 4]
      });

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        canvas.width / 4,
        canvas.height / 4
      );

      pdf.save('walmart-receipt.pdf');

      toast({
        title: "Download Complete",
        description: "Your receipt has been downloaded as a PDF.",
      });
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  // File upload reference for logo
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle logo file upload
  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setStoreInfo(prev => ({
          ...prev,
          customLogo: reader.result as string
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Toggle custom logo usage
  const toggleCustomLogo = (checked: boolean) => {
    setStoreInfo(prev => ({
      ...prev,
      useCustomLogo: checked
    }));

    // If toggling on and no logo is selected, open file picker
    if (checked && !storeInfo.customLogo && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Fetch product info from Walmart URL
  const fetchWalmartProduct = async () => {
    if (!walmartUrl.trim() || !walmartUrl.includes('walmart.com')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Walmart product URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingProduct(true);
    try {
      const response = await apiRequest({
        url: '/api/fetch-walmart-product',
        method: 'POST',
        data: { url: walmartUrl }
      });

      if (response.name && response.price) {
        // Add the product as a new item
        setItems(prev => [
          ...prev,
          { 
            id: nanoid(), 
            name: response.name, 
            price: response.price, 
            quantity: "1" 
          }
        ]);

        // Clear the URL field
        setWalmartUrl('');

        toast({
          title: "Product Added",
          description: `Successfully added "${response.name}" to your receipt.`,
        });
      } else {
        throw new Error("Invalid product data received");
      }
    } catch (error) {
      console.error("Error fetching Walmart product:", error);
      toast({
        title: "Failed to Fetch Product",
        description: "Unable to extract product information from the provided URL. Please try again or add the item manually.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const randomizeInfo = () => {
    const randomString = (length: number) => {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    };

    setPaymentInfo(prev => ({
      ...prev,
      approvalCode: randomString(6),
      referenceNumber: randomString(10),
      networkId: randomString(4),
      aid: `A${randomString(12)}`,
      arc: `R${randomString(12)}`
    }));
  };


  return (
    <div className="lg:col-span-3 space-y-6">
      {/* Logo Customization */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Logo Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="custom-logo">Use Custom Logo</Label>
                <p className="text-sm text-muted-foreground">
                  Replace the default Walmart logo with your own
                </p>
              </div>
              <Switch
                id="custom-logo"
                checked={storeInfo.useCustomLogo}
                onCheckedChange={toggleCustomLogo}
              />
            </div>

            {storeInfo.useCustomLogo && (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    {storeInfo.customLogo ? 'Change Image' : 'Upload Image'}
                  </Button>

                  {storeInfo.customLogo && (
                    <Button 
                      variant="outline" 
                      onClick={() => setStoreInfo(prev => ({ ...prev, customLogo: null }))}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove Image
                    </Button>
                  )}
                </div>

                {storeInfo.customLogo && (
                  <div className="mt-2 border rounded-md p-2 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                    <img 
                      src={storeInfo.customLogo} 
                      alt="Custom logo" 
                      className="max-h-16 max-w-full mx-auto"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Store Information */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Store Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="store-number">Store #</Label>
              <Input
                id="store-number"
                value={storeInfo.number}
                onChange={handleStoreInfoChange}
              />
            </div>
            <div>
              <Label htmlFor="store-address">Store Address</Label>
              <Input
                id="store-address"
                value={storeInfo.address}
                onChange={handleStoreInfoChange}
              />
            </div>
            <div>
              <Label htmlFor="store-city">City</Label>
              <Input
                id="store-city"
                value={storeInfo.city}
                onChange={handleStoreInfoChange}
              />
            </div>
            <div>
              <Label htmlFor="store-stateZip">State, ZIP</Label>
              <Input
                id="store-stateZip"
                value={storeInfo.stateZip}
                onChange={handleStoreInfoChange}
              />
            </div>
            <div>
              <Label htmlFor="store-phone">Phone</Label>
              <Input
                id="store-phone"
                value={storeInfo.phone}
                onChange={handleStoreInfoChange}
              />
            </div>
            <div>
              <Label htmlFor="date">Date & Time</Label>
              <Input
                id="date"
                type="datetime-local"
                value={receiptInfo.date}
                onChange={handleReceiptInfoChange}
              />
            </div>
            <div>
              <Label htmlFor="cashier">Cashier</Label>
              <Input
                id="cashier"
                value={receiptInfo.cashier}
                onChange={handleReceiptInfoChange}
              />
            </div>
            <div>
              <Label htmlFor="register">Register #</Label>
              <Input
                id="register"
                value={receiptInfo.register}
                onChange={handleReceiptInfoChange}
              />
            </div>
            <div>
              <Label htmlFor="terminal">Terminal ID</Label>
              <Input
                id="terminal"
                value={receiptInfo.terminal}
                onChange={handleReceiptInfoChange}
              />
            </div>
            <div>
              <Label htmlFor="operator">Operator ID</Label>
              <Input
                id="operator"
                value={receiptInfo.operator}
                onChange={handleReceiptInfoChange}
              />
            </div>
            <div>
              <Label htmlFor="store-manager">Store Manager</Label>
              <Input
                id="store-manager"
                value={storeInfo.manager}
                onChange={handleStoreInfoChange}
              />
            </div>
            <div>
              <Label htmlFor="store-surveyCode">Survey Code</Label>
              <Input
                id="store-surveyCode"
                value={storeInfo.surveyCode}
                onChange={handleStoreInfoChange}
              />
            </div>
            <Button 
              type="button"
              className="w-full mt-4"
              onClick={randomizeInfo}
              variant="outline"
            >
              Randomize Information
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-lg font-semibold">Items</h2>
            <Button
              onClick={addItem}
              variant="default"
              className="bg-walmart-blue hover:bg-blue-600"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 4v16m8-8H4" 
                />
              </svg>
              Add Item
            </Button>
          </div>

          {/* Walmart Product URL Input */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <Label htmlFor="walmart-url" className="text-sm font-medium flex items-center mb-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                className="w-4 h-4 mr-1 text-blue-500"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1v-3a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              Add item from Walmart.com
            </Label>
            <div className="flex space-x-2">
              <Input
                id="walmart-url"
                placeholder="Paste Walmart product URL (e.g., https://www.walmart.com/ip/...)"
                value={walmartUrl}
                onChange={(e) => setWalmartUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={fetchWalmartProduct} 
                disabled={isLoadingProduct || !walmartUrl.includes('walmart.com')}
                className="bg-walmart-blue hover:bg-blue-600 text-white"
              >
                {isLoadingProduct ? (
                  <svg 
                    className="animate-spin h-4 w-4 mr-1" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 mr-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                    />
                  </svg>
                )}
                {isLoadingProduct ? "Loading..." : "Fetch Product"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Paste a link to any Walmart product to automatically extract the name and price
            </p>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="item-row border border-gray-200 rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Item #{index + 1}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="h-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                      />
                    </svg>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <Label>Description</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Payment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="payment-taxRate">Tax Rate (%)</Label>
              <Input
                id="payment-taxRate"
                type="number"
                step="0.01"
                min="0"
                value={paymentInfo.taxRate}
                onChange={handlePaymentInfoChange}
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select
                value={paymentInfo.method}
                onValueChange={handlePaymentMethodChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CREDIT">Credit Card</SelectItem>
                  <SelectItem value="DEBIT">Debit Card</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="GIFT CARD">Gift Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {paymentInfo.method !== "CASH" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="payment-cardLastFour">Card Last 4 Digits</Label>
                <Input
                  id="payment-cardLastFour"
                  maxLength={4}
                  placeholder="1234"
                  value={paymentInfo.cardLastFour}
                  onChange={handlePaymentInfoChange}
                />
              </div>
              <div>
                <Label htmlFor="payment-change">Change Due</Label>
                <Input
                  id="payment-change"
                  placeholder="0.00"
                  value={paymentInfo.change}
                  onChange={handlePaymentInfoChange}
                />
              </div>
              <div>
                <Label htmlFor="payment-approvalCode">Approval Code</Label>
                <Input
                  id="payment-approvalCode"
                  placeholder="123456"
                  value={paymentInfo.approvalCode}
                  onChange={handlePaymentInfoChange}
                />
              </div>
              <div>
                <Label htmlFor="payment-referenceNumber">Reference Number</Label>
                <Input
                  id="payment-referenceNumber"
                  placeholder="123456789"
                  value={paymentInfo.referenceNumber}
                  onChange={handlePaymentInfoChange}
                />
              </div>
              <div>
                <Label htmlFor="payment-networkId">Network ID</Label>
                <Input
                  id="payment-networkId"
                  placeholder="123456"
                  value={paymentInfo.networkId}
                  onChange={handlePaymentInfoChange}
                />
              </div>
              <div>
                <Label htmlFor="payment-aid">AID</Label>
                <Input
                  id="payment-aid"
                  placeholder="A0000000012345"
                  value={paymentInfo.aid}
                  onChange={handlePaymentInfoChange}
                />
              </div>
              <div>
                <Label htmlFor="payment-arc">ARC</Label>
                <Input
                  id="payment-arc"
                  placeholder="00"
                  value={paymentInfo.arc}
                  onChange={handlePaymentInfoChange}
                />
              </div>
            </div>
          )}

          <Separator className="my-4" />
          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              onClick={resetForm}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              Reset
            </Button>
            <div className="space-x-2">
              <Button
                variant="secondary"
                onClick={printReceipt}
                disabled={printing}
              >
                {printing ? (
                  <>
                    <svg 
                      className="animate-spin -ml-1 mr-2 h-4 w-4" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      ></circle>
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Printing...
                  </>
                ) : (
                  <>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 mr-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" 
                      />
                    </svg>
                    Print
                  </>
                )}
              </Button>
              <Button
                onClick={downloadReceipt}
                disabled={downloading}
                className="bg-walmart-blue hover:bg-blue-600"
              >
                {downloading ? (
                  <>
                    <svg 
                      className="animate-spin -ml-1 mr-2 h-4 w-4" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      ></circle>
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 mr-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                      />
                    </svg>
                    Download
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}