
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { SupabaseProduct } from "@/services/supabaseService";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface ProductCardProps {
  product: SupabaseProduct;
  priority?: boolean;
}

// Enhanced image mapping
const getProductImage = (productName: string) => {
  const imageMap: { [key: string]: string } = {
    'Pad Thai Sauce': '/lovable-uploads/5a0dec88-a26c-4e29-bda6-8d921887615e.png',
    'Sukiyaki Dipping Sauce': '/lovable-uploads/322ef915-5db5-4834-9e45-92a34dc3adb6.png',
    'Tom Yum Chili Paste': '/lovable-uploads/fc66a288-b44b-4bf4-a82f-a2c844b58979.png',
    'Red Curry Paste': '/lovable-uploads/dbb561f8-a97a-447c-8946-5a1d279bed05.png',
    'Panang Curry Paste': '/lovable-uploads/5308a5d2-4f12-42ed-b3f8-f2aa5d7fbac9.png',
    'Massaman Curry Paste': '/lovable-uploads/c936ed96-2c61-4919-9e6d-14f740c80b80.png',
    'Green Curry Paste': '/lovable-uploads/1ae4d3c5-e136-4ed4-9a71-f1e9d6123a83.png',
    'Yellow Curry Paste': '/lovable-uploads/acf32ec1-9435-4a5c-8baf-1943b85b93bf.png'
  };

  return imageMap[productName] || '/placeholder.svg';
};

const ProductCard = ({ product, priority = false }: ProductCardProps) => {
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const { language } = useLanguage();

  const translations = {
    en: {
      addToCart: 'Add to Cart',
      viewDetails: 'View Details',
      outOfStock: 'Out of Stock'
    },
    th: {
      addToCart: 'เพิ่มลงตะกร้า',
      viewDetails: 'ดูรายละเอียด',
      outOfStock: 'สินค้าหมด'
    }
  };

  const t = translations[language];
  const actualImage = product.images?.[0] || getProductImage(product.name);
  const isInStock = (product.stock_quantity || 0) > 0;

  const handleAddToCart = () => {
    if (isInStock) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images || [actualImage]
      }, 1);
    }
  };

  return (
    <Card className="anong-card group anong-hover-lift overflow-hidden">
      <div className="aspect-square bg-gradient-to-b from-anong-cream to-anong-ivory p-6 flex items-center justify-center relative overflow-hidden">
        <OptimizedImage
          src={actualImage}
          alt={product.name}
          priority={priority}
          className="max-w-[200px] max-h-[200px] w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        
        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-anong-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link to={`/product/${product.id}`}>
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-white hover:bg-gray-100 text-anong-black font-medium"
            >
              <Eye className="h-4 w-4 mr-2" />
              {t.viewDetails}
            </Button>
          </Link>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="anong-heading text-lg font-semibold text-anong-charcoal mb-2 line-clamp-2">
              {product.name}
            </h3>
            
            {product.short_description && (
              <p className="anong-body text-sm text-anong-charcoal/70 line-clamp-2">
                {product.short_description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-right">
              <span className="anong-heading text-xl font-bold text-anong-deep-green">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>

          <Button 
            onClick={handleAddToCart}
            disabled={!isInStock}
            className={`w-full ${
              isInStock 
                ? 'anong-btn-primary' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } font-medium transition-colors`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isInStock ? t.addToCart : t.outOfStock}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
