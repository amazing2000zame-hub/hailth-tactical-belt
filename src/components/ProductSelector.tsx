import { useState } from "react";

interface ColorOption {
  name: string;
  hex: string;
  pattern?: boolean;
}

interface SizeOption {
  label: string;
  range: string;
}

const COLORS: ColorOption[] = [
  { name: "Black", hex: "#1a1a1a" },
  { name: "Army Green", hex: "#4a5d23" },
  { name: "Khaki", hex: "#c3b091" },
  { name: "Brown", hex: "#654321" },
  { name: "Navy", hex: "#1b2a4a" },
  { name: "Gray", hex: "#6b7280" },
  { name: "Camo", hex: "#556b2f", pattern: true },
];

const SIZES: SizeOption[] = [
  { label: "S", range: '28"-32"' },
  { label: "M", range: '32"-36"' },
  { label: "L", range: '36"-40"' },
  { label: "XL", range: '40"-44"' },
  { label: "2XL", range: '44"-50"' },
];

const PRICE = 29.99;

export default function ProductSelector() {
  const [selectedColor, setSelectedColor] = useState<string>("Black");
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [quantity, setQuantity] = useState<number>(1);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  };

  const totalPrice = (PRICE * quantity).toFixed(2);

  return (
    <div className="space-y-8">
      {/* Color Selector */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
            Color
          </label>
          <span className="text-sm text-neutral-500">{selectedColor}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color.name)}
              className={`group relative w-10 h-10 rounded-full transition-all duration-300 ${
                selectedColor === color.name
                  ? "ring-2 ring-offset-2 ring-neutral-900 scale-110"
                  : "hover:scale-110 hover:ring-2 hover:ring-offset-2 hover:ring-neutral-300"
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
              aria-label={`Select ${color.name} color`}
            >
              {/* Camo pattern overlay */}
              {color.pattern && (
                <span className="absolute inset-0 rounded-full overflow-hidden">
                  <span
                    className="absolute inset-0"
                    style={{
                      background: `
                        radial-gradient(circle at 30% 30%, #3d4f1f 0%, transparent 40%),
                        radial-gradient(circle at 70% 60%, #6b7f3a 0%, transparent 35%),
                        radial-gradient(circle at 50% 80%, #4a5d23 0%, transparent 30%),
                        ${color.hex}
                      `,
                    }}
                  />
                </span>
              )}

              {/* Check mark for selected */}
              {selectedColor === color.name && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className={`w-4 h-4 ${
                      color.name === "Khaki" || color.name === "Gray"
                        ? "text-neutral-900"
                        : "text-white"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                </span>
              )}

              {/* Tooltip */}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-medium text-neutral-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {color.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Size Selector */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
            Size
          </label>
          <button
            onClick={() => setShowSizeGuide(!showSizeGuide)}
            className="text-xs font-medium text-neutral-500 underline underline-offset-2 decoration-neutral-300 hover:text-neutral-900 hover:decoration-neutral-900 transition-colors"
          >
            Size Guide
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size.label}
              onClick={() => setSelectedSize(size.label)}
              className={`relative px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                selectedSize === size.label
                  ? "bg-neutral-900 text-white shadow-md"
                  : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-100"
              }`}
              aria-label={`Select size ${size.label} (${size.range})`}
            >
              {size.label}
              {selectedSize === size.label && (
                <span className="block text-[10px] font-normal text-neutral-400 mt-0.5">
                  {size.range}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Size Guide Panel */}
        {showSizeGuide && (
          <div className="mt-4 p-5 rounded-xl bg-neutral-50 border border-neutral-100 animate-in">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-semibold text-neutral-900">
                Size Guide
              </h5>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Close size guide"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="text-xs text-neutral-500 mb-3">
              Measure around your natural waistline where you typically wear
              your belt.
            </p>
            <div className="space-y-1.5">
              {SIZES.map((size) => (
                <div
                  key={size.label}
                  className={`flex items-center justify-between py-1.5 px-3 rounded-lg text-xs ${
                    selectedSize === size.label
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600"
                  }`}
                >
                  <span className="font-semibold">{size.label}</span>
                  <span className={selectedSize === size.label ? "text-neutral-400" : "text-neutral-400"}>
                    {size.range}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quantity Selector */}
      <div>
        <label className="block text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">
          Quantity
        </label>
        <div className="inline-flex items-center rounded-xl border border-neutral-200 bg-neutral-50">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className="w-12 h-12 flex items-center justify-center text-neutral-600 hover:text-neutral-900 disabled:text-neutral-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease quantity"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14"
              />
            </svg>
          </button>
          <span className="w-12 h-12 flex items-center justify-center text-sm font-semibold text-neutral-900 border-x border-neutral-200 bg-white">
            {quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= 10}
            className="w-12 h-12 flex items-center justify-center text-neutral-600 hover:text-neutral-900 disabled:text-neutral-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase quantity"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="pt-2">
        <button
          className="w-full py-4 px-8 bg-[#c8a97e] text-[#0a0a0a] text-sm font-bold uppercase tracking-widest rounded-full transition-all duration-300 hover:bg-[#b8956a] hover:shadow-[0_4px_24px_rgba(200,169,126,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
          aria-label={`Add to cart - $${totalPrice}`}
        >
          Add to Cart &mdash; ${totalPrice}
        </button>

        {/* Trust indicators */}
        <div className="mt-4 flex items-center justify-center gap-6 text-[10px] text-neutral-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
            Secure Checkout
          </span>
          <span className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
              />
            </svg>
            Free Shipping
          </span>
          <span className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
              />
            </svg>
            30-Day Returns
          </span>
        </div>
      </div>
    </div>
  );
}
