import React, { useState, useMemo } from 'react';
import { Search, X, Globe, Check, Image as ImageIcon, Sparkles, ExternalLink } from 'lucide-react';

export interface WebImageItem {
  id: string;
  title: string;
  category: string;
  url: string;
  tags: string[];
}

export const WEB_IMAGE_CATALOG: WebImageItem[] = [
  // 1. LAPTOP & PC GAMING
  {
    id: 'lap-1',
    title: 'Laptop Gaming Asus ROG Strix G16',
    category: 'Laptop & PC',
    url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=700&auto=format&fit=crop&q=80',
    tags: ['laptop', 'gaming', 'asus', 'rog', 'may tinh'],
  },
  {
    id: 'lap-2',
    title: 'MacBook Pro M3 Max Space Black',
    category: 'Laptop & PC',
    url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop&q=80',
    tags: ['macbook', 'apple', 'laptop', 'van phong'],
  },
  {
    id: 'pc-1',
    title: 'PC Gaming Case RGB Custom High-End',
    category: 'Laptop & PC',
    url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=700&auto=format&fit=crop&q=80',
    tags: ['pc', 'case', 'rgb', 'gaming', 'desktop'],
  },
  {
    id: 'pc-2',
    title: 'Máy trạm Workstation Dell Precision',
    category: 'Laptop & PC',
    url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=700&auto=format&fit=crop&q=80',
    tags: ['workstation', 'dell', 'pc', 'dong bo'],
  },

  // 2. MÀN HÌNH LCD
  {
    id: 'mon-1',
    title: 'Màn hình Gaming Cong 27 inch 165Hz IPS',
    category: 'Màn hình LCD',
    url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=700&auto=format&fit=crop&q=80',
    tags: ['man hinh', 'monitor', 'lcd', 'gaming', '27inch'],
  },
  {
    id: 'mon-2',
    title: 'Màn hình Đồ Họa 4K UltraSharp 32 inch',
    category: 'Màn hình LCD',
    url: 'https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=700&auto=format&fit=crop&q=80',
    tags: ['man hinh', '4k', 'ultrasharp', 'do hoa'],
  },

  // 3. LINH KIỆN MÁY TÍNH (SSD, RAM, VGA, CPU)
  {
    id: 'ssd-1',
    title: 'Ổ cứng SSD NVMe M.2 PCIe Gen 4 High Speed',
    category: 'Linh kiện',
    url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700&auto=format&fit=crop&q=80',
    tags: ['ssd', 'nvme', 'm2', 'o cung', 'samsung'],
  },
  {
    id: 'ram-1',
    title: 'Kit RAM DDR5 RGB 32GB (2x16GB) 6000MHz',
    category: 'Linh kiện',
    url: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=700&auto=format&fit=crop&q=80',
    tags: ['ram', 'ddr5', 'ddr4', 'corsair', 'kingston'],
  },
  {
    id: 'vga-1',
    title: 'Card Màn Hình VGA RTX 4070 Ti Super 16GB',
    category: 'Linh kiện',
    url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=700&auto=format&fit=crop&q=80',
    tags: ['vga', 'card', 'nvidia', 'rtx', 'geforce'],
  },
  {
    id: 'cpu-1',
    title: 'Bộ vi xử lý CPU Intel Core i7 / i9 Thế hệ mới',
    category: 'Linh kiện',
    url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=700&auto=format&fit=crop&q=80',
    tags: ['cpu', 'intel', 'amd', 'chip'],
  },

  // 4. PHÍM & CHUỘT
  {
    id: 'kb-1',
    title: 'Bàn phím cơ Custom Switch RGB Hotswap',
    category: 'Phím & Chuột',
    url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&auto=format&fit=crop&q=80',
    tags: ['ban phim', 'keyboard', 'ban phim co', 'rgb'],
  },
  {
    id: 'ms-1',
    title: 'Chuột Không Dây Gaming Siêu Nhẹ Ergonomic',
    category: 'Phím & Chuột',
    url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=700&auto=format&fit=crop&q=80',
    tags: ['chuot', 'mouse', 'wireless', 'logitech'],
  },

  // 5. CAMERA & THIẾT BỊ MẠNG
  {
    id: 'cam-1',
    title: 'Camera IP Thân Trụ An Ninh Ngoài Trời Full HD',
    category: 'Camera & Mạng',
    url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=700&auto=format&fit=crop&q=80',
    tags: ['camera', 'an ninh', 'hikvision', 'dahua', 'ezviz'],
  },
  {
    id: 'wifi-1',
    title: 'Bộ phát WiFi 6 Router Gigabit Mesh Dual-Band',
    category: 'Camera & Mạng',
    url: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=700&auto=format&fit=crop&q=80',
    tags: ['wifi', 'router', 'mang', 'tplink'],
  },

  // 6. NÔNG SẢN & GẠO
  {
    id: 'rice-1',
    title: 'Gạo Thơm ST25 Thượng Hạng Đóng Túi',
    category: 'Nông sản & Gạo',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=700&auto=format&fit=crop&q=80',
    tags: ['gao', 'nong san', 'st25', 'thuc pham'],
  },
  {
    id: 'grain-1',
    title: 'Hạt Ngũ Cốc Dinh Dưỡng & Nông Sản Xuất Khẩu',
    category: 'Nông sản & Gạo',
    url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=700&auto=format&fit=crop&q=80',
    tags: ['ngu coc', 'hat', 'nong san'],
  },

  // 7. NƯỚC GIẢI KHÁT & BIA
  {
    id: 'bev-1',
    title: 'Nước Ngọt Lon / Bia Đóng Thùng Cao Cấp',
    category: 'Nước giải khát',
    url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=700&auto=format&fit=crop&q=80',
    tags: ['nuoc ngot', 'bia', 'nuoc giai khat', 'lon'],
  },
  {
    id: 'bev-2',
    title: 'Nước Khoáng Tinh Khiết Chai Đóng Lốc',
    category: 'Nước giải khát',
    url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=700&auto=format&fit=crop&q=80',
    tags: ['nuoc suoi', 'khoang', 'chai'],
  },

  // 8. ĐIỆN THOẠI & PHỤ KIỆN
  {
    id: 'phone-1',
    title: 'Smartphone Flagship 5G Màn Hình OLED',
    category: 'Điện thoại & Phụ kiện',
    url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&auto=format&fit=crop&q=80',
    tags: ['dien thoai', 'smartphone', 'iphone', 'samsung'],
  },
  {
    id: 'audio-1',
    title: 'Tai Nghe True Wireless Bluetooth Chống Ồn',
    category: 'Điện thoại & Phụ kiện',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80',
    tags: ['tai nghe', 'headphone', 'airpods', 'am thanh'],
  },
  {
    id: 'cable-1',
    title: 'Cáp Sạc Nhanh Type-C Bọc Dù Siêu Bền',
    category: 'Điện thoại & Phụ kiện',
    url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&auto=format&fit=crop&q=80',
    tags: ['cap', 'sac', 'type-c', 'phu kien'],
  },
];

const CATEGORY_TABS = [
  'Tất cả',
  'Laptop & PC',
  'Màn hình LCD',
  'Linh kiện',
  'Phím & Chuột',
  'Camera & Mạng',
  'Nông sản & Gạo',
  'Nước giải khát',
  'Điện thoại & Phụ kiện',
];

export interface WebImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  currentImageUrl?: string;
}

export const WebImagePickerModal: React.FC<WebImagePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  currentImageUrl = '',
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');

  const filteredImages = useMemo(() => {
    let list = WEB_IMAGE_CATALOG;

    if (activeCategory !== 'Tất cả') {
      list = list.filter((item) => item.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onSelectImage(customUrl.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 md:px-6 md:py-4 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center space-x-2">
                <span>Thư Viện Hình Ảnh Sản Phẩm & Tìm Kiếm Web</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                  Unsplash HD
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Chọn ảnh mẫu độ nét cao hoặc dán đường link hình ảnh bất kỳ từ Internet
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Custom URL Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Box */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm ảnh theo tên (Laptop, Camera, SSD, Bàn phím, Màn hình...)..."
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Custom URL Input */}
            <form onSubmit={handleApplyCustomUrl} className="md:col-span-6 flex items-center space-x-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Hoặc dán URL ảnh trực tiếp từ Web (https://...)..."
                className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!customUrl.trim()}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1 shrink-0"
              >
                <span>Dán Ảnh</span>
              </button>
            </form>
          </div>

          {/* Category Tabs Bar */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            {CATEGORY_TABS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm font-bold scale-105'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="p-4 md:p-6 overflow-y-auto max-h-[55vh] flex-1">
          {filteredImages.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <ImageIcon className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-sm font-semibold">Không tìm thấy hình ảnh nào phù hợp</p>
              <p className="text-xs text-slate-500">Thử tìm kiếm với từ khóa khác hoặc dán đường dẫn ảnh trực tiếp ở trên</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {filteredImages.map((img) => {
                const isSelected = currentImageUrl === img.url;
                return (
                  <div
                    key={img.id}
                    onClick={() => {
                      onSelectImage(img.url);
                      onClose();
                    }}
                    className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] bg-slate-800 flex flex-col ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/40'
                        : 'border-slate-700 hover:border-indigo-400'
                    }`}
                  >
                    <div className="aspect-square w-full bg-slate-950 overflow-hidden relative">
                      <img
                        src={img.url}
                        alt={img.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-[9px] font-bold text-slate-300 border border-slate-700/50">
                        {img.category}
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 p-1 rounded-full bg-emerald-500 text-slate-950 shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                      <h4 className="text-[11px] font-bold text-white line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors">
                        {img.title}
                      </h4>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Chọn ảnh này</span>
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Mẹo: Bạn cũng có thể bấm <strong>Ctrl + V</strong> ở form để dán trực tiếp ảnh chụp màn hình</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
