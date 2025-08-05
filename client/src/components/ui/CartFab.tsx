import { FiShoppingCart } from 'react-icons/fi';
import { useCart } from '@/hooks/use-cart';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CartFab() {
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const [isPressed, setIsPressed] = useState(false);
  
  const totalItems = getItemCount();
  if (!totalItems) return null;

  const handleClick = () => {
    navigate('/cart');
  };

  return (
    <button
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className="
        fixed bottom-24 left-4 sm:bottom-20 sm:left-3
        z-50 h-14 w-14 rounded-full bg-primary-600 text-white
        flex items-center justify-center shadow-lg
        hover:scale-105 active:scale-95 transition"
    >
      <FiShoppingCart className="w-6 h-6 text-white" />
      <span
        className="
          absolute -top-1.5 -right-1.5 h-5 min-w-[20px] rounded-full
          bg-red-500 text-[11px] font-semibold flex items-center
          justify-center leading-none px-1
        "
      >
        {totalItems > 99 ? '99+' : totalItems}
      </span>
    </button>
  );
}