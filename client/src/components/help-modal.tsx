import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export default function HelpModal({ open, onClose }: HelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">How to Use the Receipt Generator</DialogTitle>
            <DialogClose className="text-gray-500 hover:text-gray-700">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </DialogClose>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-walmart-blue">Store Information</h4>
            <DialogDescription>
              Fill in the store details like store number, address, and contact information that will appear at the top of your receipt.
            </DialogDescription>
          </div>
          <div>
            <h4 className="font-semibold text-walmart-blue">Adding Items</h4>
            <DialogDescription>
              Click "Add Item" to add products to your receipt. For each item, you can specify:
            </DialogDescription>
            <ul className="list-disc pl-5 mt-1 text-sm text-gray-600">
              <li>Description - Name of the product</li>
              <li>Price - Cost per item</li>
              <li>Quantity - Number of items</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-walmart-blue">Tax and Payment</h4>
            <DialogDescription>
              Set the tax rate percentage and select the payment method used for the purchase.
            </DialogDescription>
          </div>
          <div>
            <h4 className="font-semibold text-walmart-blue">Previewing and Saving</h4>
            <DialogDescription>
              The receipt preview updates in real-time as you make changes. When you're satisfied:
            </DialogDescription>
            <ul className="list-disc pl-5 mt-1 text-sm text-gray-600">
              <li>Click "Print" to print the receipt</li>
              <li>Click "Download" to save the receipt as a PDF</li>
            </ul>
          </div>
          <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
            <h4 className="font-semibold text-yellow-800">Important Note</h4>
            <p className="text-sm text-yellow-800">
              This tool is for educational or novelty purposes only. Creating fake receipts for fraudulent purposes is illegal.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
