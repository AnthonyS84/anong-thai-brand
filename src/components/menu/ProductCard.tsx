
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    short_description?: string;
    is_featured?: boolean;
    rating?: number;
    reviewCount?: number;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { language } = useLanguage();

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  const primaryImage = product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg';

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      onClick={handleClick}
    >
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {product.is_featured && (
          <Badge className="absolute top-2 left-2 bg-anong-gold text-anong-black">
            Featured
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-anong-charcoal group-hover:text-anong-gold transition-colors">
          {product.name}
        </h3>
        
        {product.short_description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.short_description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-lg text-anong-gold">
              {formatPrice(product.price)}
            </span>
            {product.rating && (
              <div className="flex items-center mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600 ml-1">
                  {product.rating} {product.reviewCount && `(${product.reviewCount})`}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
