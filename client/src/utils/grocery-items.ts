export interface GroceryItem {
  name: string;
  price: string;
}

export const groceryItems: GroceryItem[] = [
  { name: "GREAT VALUE MILK 1 GAL", price: "3.48" },
  { name: "BANANAS", price: "0.58" },
  { name: "GREAT VALUE BREAD", price: "0.97" },
  { name: "EGGS 12CT LARGE", price: "2.78" },
  { name: "GREAT VALUE BUTTER", price: "3.97" },
  { name: "GREAT VALUE WATER 24PK", price: "3.98" },
  { name: "APPLE GALA 3LB BAG", price: "4.27" },
  { name: "GREAT VALUE SUGAR", price: "2.24" },
  { name: "GREAT VALUE COFFEE", price: "3.92" },
  { name: "CEREAL CHEERIOS", price: "3.94" },
  { name: "CHICKEN BREAST 1LB", price: "4.94" },
  { name: "GROUND BEEF 1LB", price: "4.96" },
  { name: "POTATO RUSSET 5LB", price: "3.87" },
  { name: "ONIONS 3LB BAG", price: "2.57" },
  { name: "TOMATOES ON VINE", price: "1.98" },
  { name: "PASTA GREAT VALUE", price: "0.92" },
  { name: "PASTA SAUCE GV", price: "1.52" },
  { name: "PAPER TOWELS GV", price: "1.27" },
  { name: "TOILET PAPER GV 4CT", price: "3.27" },
  { name: "TIDE POD LAUNDRY", price: "4.94" },
  { name: "CLOROX BLEACH", price: "3.48" },
  { name: "DIAL SOAP 4PK", price: "3.27" },
  { name: "SHAMPOO SUAVE", price: "1.97" },
  { name: "TOOTHPASTE CREST", price: "3.24" },
  { name: "TOOTHBRUSH ORAL-B", price: "3.94" },
  { name: "PEPSI 12PK CANS", price: "5.98" },
  { name: "DR PEPPER 12PK", price: "5.98" },
  { name: "MOUNTAIN DEW 12PK", price: "5.98" },
  { name: "MINUTE MAID OJ", price: "2.68" },
  { name: "CHIPS LAYS", price: "3.48" },
  { name: "DORITOS NACHO", price: "3.48" },
  { name: "OREO COOKIES", price: "3.68" },
  { name: "ICE CREAM GV", price: "2.97" },
  { name: "YOGURT YOPLAIT 8PK", price: "5.44" },
  { name: "CHEESE KRAFT 8OZ", price: "2.68" },
  { name: "RITZ CRACKERS", price: "3.28" },
  { name: "PEANUT BUTTER JIF", price: "3.52" },
  { name: "GRAPE JELLY GV", price: "1.47" },
  { name: "TUNA CHUNK LIGHT", price: "0.82" },
  { name: "CEREAL FROSTED FLAKES", price: "3.94" },
  { name: "PEPPERS GREEN BELL", price: "0.68" },
  { name: "LETTUCE ICEBERG", price: "1.48" },
  { name: "CARROTS 1LB BAG", price: "1.24" },
  { name: "CUCUMBER", price: "0.62" },
  { name: "BROCCOLI CROWN", price: "1.87" },
  { name: "ZUCCHINI", price: "1.27" },
  { name: "STRAWBERRIES 16OZ", price: "2.97" },
  { name: "GRAPES RED 2LB", price: "4.87" },
  { name: "LEMON BAG", price: "3.47" }
];

/**
 * Fills a receipt with grocery items to reach a desired total amount
 * @param desiredTotal The desired total amount to reach
 * @param currentItems Current items in the receipt (if any)
 * @param taxRate Tax rate percentage (e.g., "6.5" for 6.5%)
 * @returns An array of receipt items to reach the desired total
 */
export function fillReceiptToTotal(
  desiredTotal: number, 
  currentItems: Array<{ id: string; name: string; price: string; quantity: string }>,
  taxRate: string
): Array<{ id: string; name: string; price: string; quantity: string }> {
  // Calculate current subtotal
  const currentSubtotal = currentItems.reduce((sum, item) => {
    return sum + (parseFloat(item.price) * parseInt(item.quantity));
  }, 0);
  
  // Calculate target subtotal based on desired total and tax rate
  const taxMultiplier = 1 + (parseFloat(taxRate) / 100);
  const targetSubtotal = desiredTotal / taxMultiplier;
  
  // Calculate how much more we need to add
  let remainingAmount = targetSubtotal - currentSubtotal;
  
  // Make a copy of the current items
  const updatedItems = [...currentItems];
  
  // Create a copy of grocery items for shuffling
  const availableItems = [...groceryItems];
  
  // Shuffle the available items for some randomness
  for (let i = availableItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableItems[i], availableItems[j]] = [availableItems[j], availableItems[i]];
  }
  
  // Generate a unique ID
  const generateId = () => Math.random().toString(36).substring(2, 10);
  
  // Add items until we get close to the desired subtotal
  let itemIndex = 0;
  while (remainingAmount > 0.5 && itemIndex < availableItems.length) {
    const item = availableItems[itemIndex];
    const price = parseFloat(item.price);
    
    // Skip if item is too expensive
    if (price > remainingAmount) {
      itemIndex++;
      continue;
    }
    
    // Determine quantity (mostly 1, sometimes 2 or 3 for cheaper items)
    let quantity = 1;
    if (price < 2 && remainingAmount > 10) {
      quantity = Math.floor(Math.random() * 3) + 1;
    }
    
    // Add the item
    updatedItems.push({
      id: generateId(),
      name: item.name,
      price: item.price,
      quantity: quantity.toString()
    });
    
    // Update remaining amount
    remainingAmount -= (price * quantity);
    itemIndex++;
  }
  
  return updatedItems;
}