export type MenuCategory = "Tất cả" | "Món mặn" | "Món chay" | "Ăn kèm";

export type MenuItem = {
  id: number;
  name: string;
  category: Exclude<MenuCategory, "Tất cả">;
  price: number;
  oldPrice?: number;
  badge?: string;
  rating: number;
  ratingCount: number;
  image: string;
};

export const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Bánh cuốn nhân chà bông tôm",
    category: "Món mặn",
    price: 50000,
    badge: "Best seller",
    rating: 4.2,
    ratingCount: 25,
    image: "/images/banh-cuon-dish.jpg"
  },
  {
    id: 2,
    name: "Bánh cuốn chay nhân thập cẩm",
    category: "Món chay",
    price: 50000,
    badge: "Món chay",
    rating: 3.4,
    ratingCount: 2,
    image: "/images/banh-cuon-dish.jpg"
  },
  {
    id: 3,
    name: "Bánh cuốn lá dứa nhân rau củ, đậu hủ",
    category: "Món chay",
    price: 35000,
    oldPrice: 44000,
    badge: "Món chay",
    rating: 3.4,
    ratingCount: 2,
    image: "/images/banh-cuon-dish.jpg"
  },
  {
    id: 4,
    name: "Bánh cuốn nhân thịt",
    category: "Món mặn",
    price: 56000,
    badge: "Món mặn",
    rating: 4.8,
    ratingCount: 25,
    image: "/images/banh-cuon-dish.jpg"
  },
  {
    id: 5,
    name: "Bánh ướt (không nhân)",
    category: "Món mặn",
    price: 40000,
    badge: "Món mặn",
    rating: 4.0,
    ratingCount: 2,
    image: "/images/banh-cuon-dish.jpg"
  },
  {
    id: 6,
    name: "Bánh cuốn nhân thịt đặc biệt",
    category: "Món mặn",
    price: 65000,
    oldPrice: 72000,
    badge: "Món mặn",
    rating: 4.6,
    ratingCount: 2,
    image: "/images/banh-cuon-dish.jpg"
  },
  {
    id: 7,
    name: "Nem Huế (2 miếng)",
    category: "Ăn kèm",
    price: 24000,
    badge: "Ăn kèm",
    rating: 4.9,
    ratingCount: 25,
    image: "/images/banh-cuon-dish.jpg"
  },
  {
    id: 8,
    name: "Chả quế / Chả lụa (2 miếng)",
    category: "Ăn kèm",
    price: 24000,
    badge: "Ăn kèm",
    rating: 4.7,
    ratingCount: 25,
    image: "/images/banh-cuon-dish.jpg"
  },
  {
    id: 9,
    name: "Bánh đậu",
    category: "Ăn kèm",
    price: 12000,
    badge: "Ăn kèm",
    rating: 4.3,
    ratingCount: 2,
    image: "/images/banh-cuon-dish.jpg"
  },
  {
    id: 10,
    name: "Bánh cuốn nhân chà bông heo",
    category: "Món mặn",
    price: 50000,
    badge: "Món mặn",
    rating: 4.1,
    ratingCount: 2,
    image: "/images/banh-cuon-dish.jpg"
  },
  {
    id: 11,
    name: "Bánh ướt trứng vàng",
    category: "Món mặn",
    price: 50000,
    badge: "Món mặn",
    rating: 4.4,
    ratingCount: 2,
    image: "/images/banh-cuon-dish.jpg"
  },
  {
    id: 12,
    name: "Bánh cuốn nhân tôm thịt nấm",
    category: "Món mặn",
    price: 78000,
    badge: "Món mặn",
    rating: 4.5,
    ratingCount: 2,
    image: "/images/banh-cuon-dish.jpg"
  }
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(value);
