import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, Category } from '../types';
import { productService, ProductSearchParams } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { ProductCard } from '../components/ProductCard';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  ShoppingBag,
  ArrowUpDown,
  Check,
} from 'lucide-react';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters State
  const [keyword, setKeyword] = useState<string>(searchParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    searchParams.get('category') || undefined
  );
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    categoryService.getActive().then(setCategories).catch(console.error);
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params: ProductSearchParams = {
        keyword: keyword.trim() || undefined,
        categoryId: selectedCategory,
        maxPrice: maxPrice < 500 ? maxPrice : undefined,
        inStockOnly,
        sortBy,
        page: currentPage,
        size: 16,
      };
      const res = await productService.search(params);
      setProducts(res.content);
      setTotalCount(res.totalElements);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedCategory, maxPrice, inStockOnly, sortBy, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sync with URL params
  useEffect(() => {
    const kw = searchParams.get('keyword');
    const cat = searchParams.get('category');
    if (kw !== null && kw !== keyword) setKeyword(kw);
    if (cat !== null) setSelectedCategory(cat);
  }, [searchParams]);

  const handleResetFilters = () => {
    setKeyword('');
    setSelectedCategory(undefined);
    setMaxPrice(500);
    setInStockOnly(false);
    setSortBy('newest');
    setCurrentPage(0);
    setSearchParams({});
  };

  const handleCategoryClick = (catId?: string) => {
    setSelectedCategory(catId);
    setCurrentPage(0);
    if (catId) {
      setSearchParams({ ...(keyword ? { keyword } : {}), category: catId });
    } else {
      const nextParams: any = {};
      if (keyword) nextParams.keyword = keyword;
      setSearchParams(nextParams);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Mini D-Mart Superstore</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {selectedCategory
              ? categories.find((c) => c.id === selectedCategory)?.name || 'Grocery Aisles'
              : 'All Grocery Aisles'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing {totalCount} quality groceries with 1-hr store pickup & express home delivery
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search groceries..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          {keyword && (
            <button
              onClick={() => setKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Filter Sidebar (Desktop) */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center">
                <SlidersHorizontal className="w-4 h-4 mr-2 text-emerald-600" />
                Filters
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-slate-400 hover:text-rose-600 flex items-center transition"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Categories</label>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryClick(undefined)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    selectedCategory === undefined
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {selectedCategory === cat.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700 uppercase tracking-wider">Max Price</label>
                <span className="font-bold text-emerald-700">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹50</span>
                <span>₹500+</span>
              </div>
            </div>

            {/* Stock Availability */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    setCurrentPage(0);
                  }}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>In-Stock Items Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Products Grid & Sorting (Right Area) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="lg:hidden inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Category Pills (Horizontal Scroll for quick access) */}
            <div className="hidden sm:flex items-center space-x-2 overflow-x-auto pb-1 max-w-lg">
              <button
                onClick={() => handleCategoryClick(undefined)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === undefined
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCategoryClick(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === c.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2 ml-auto">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="newest">Sort: Newest Arrivals</option>
                <option value="price_asc">Sort: Price (Low to High)</option>
                <option value="price_desc">Sort: Price (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No matching groceries found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try loosening your search filters, adjusting the price slider, or searching for other pantry staples.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              {[...Array(totalPages)].map((_, pageIdx) => (
                <button
                  key={pageIdx}
                  onClick={() => setCurrentPage(pageIdx)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                    currentPage === pageIdx
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {pageIdx + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white p-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Filter Products</h3>
                <button onClick={() => setIsFilterDrawerOpen(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Category List */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">Categories</label>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      handleCategoryClick(undefined);
                      setIsFilterDrawerOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold"
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        handleCategoryClick(c.id);
                        setIsFilterDrawerOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-600"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
