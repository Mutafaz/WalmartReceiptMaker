import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

interface ProductInfo {
  name: string;
  price: string;
}

export function AisleGopherFetcher() {
  const [url, setUrl] = useState('');
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProductInfo = async () => {
    if (!url.includes('aislegopher.com')) {
      setError('Please enter a valid Aisle Gopher URL');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/fetch-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product information');
      }

      const data = await response.json();
      setProductInfo(data);
    } catch (err) {
      setError('Failed to fetch product information. Please try again.');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const goToAisleGopher = () => {
    window.open('https://aislegopher.com', '_blank');
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-4 items-center">
        <Button
          variant="outline"
          onClick={goToAisleGopher}
          className="whitespace-nowrap"
        >
          Visit Aisle Gopher
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter Aisle Gopher product URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
        />
        <Button
          onClick={fetchProductInfo}
          disabled={loading || !url}
        >
          {loading ? 'Fetching...' : 'Fetch Item'}
        </Button>
      </div>

      {error && (
        <div className="text-red-500">
          {error}
        </div>
      )}

      {productInfo && (
        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-2">{productInfo.name}</h3>
          <p className="text-green-600 font-medium">Price: {productInfo.price}</p>
        </Card>
      )}
    </div>
  );
} 