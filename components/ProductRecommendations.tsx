// components/ProductRecommendations.tsx
import { Product } from '@/lib/db'

export function ProductRecommendations({ products }: { products: Product[] }) {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-light text-gray-800 mb-4">Recommended Products</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h4 className="font-light text-lg mb-1">{product.name}</h4>
              <p className="text-gray-600 text-sm mb-2">{product.description}</p>
              <p className="text-blue-500 font-light">${product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
