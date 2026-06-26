"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { getProductsApi, getAllOrdersApi } from "@/app/utils/api";
import { Product } from "@/app/types/types";
import { 
  X, 
  Send, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Clock, 
  CreditCard, 
  Package, 
  Grid, 
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// WhatsApp details
const WHATSAPP_NUMBER = "97455551234";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello GRIVA! 👋 I need help with my order / have a question.")}`;

interface Option {
  label: string;
  action: string;
  link?: string;
  category?: string;
}

interface TrackingData {
  orderId: string;
  status: string;
  step: number; // 0: placed, 1: processed, 2: dispatched, 3: out_for_delivery, 4: delivered
  carrier: string;
  eta: string;
  amount: string;
  items: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot" | "system";
  timestamp: Date;
  options?: Option[];
  products?: Product[]; // Rich interactive product cards carousel
  tracking?: TrackingData; // Rich tracking card
}

// Interactive horizontal scroll peek carousel component
function ProductCarousel({ products }: { products: Product[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 5);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Initial check
    checkScroll();

    // Attach scroll listener
    el.addEventListener("scroll", checkScroll);

    // Gentle scroll peek animation: peek to the right, then return
    const timer1 = setTimeout(() => {
      el.scrollTo({ left: 100, behavior: "smooth" });
      const timer2 = setTimeout(() => {
        el.scrollTo({ left: 0, behavior: "smooth" });
      }, 850);
      return () => clearTimeout(timer2);
    }, 600);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      clearTimeout(timer1);
    };
  }, [products]);

  const scrollBy = (amount: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative w-full group">
      {/* Left Navigation Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scrollBy(-120)}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-white/90 border border-gray-100 shadow-sm flex items-center justify-center text-gray-700 hover:text-[#F54900] active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft size={14} strokeWidth={2.5} />
        </button>
      )}

      {/* Right Navigation Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scrollBy(120)}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-white/90 border border-gray-100 shadow-sm flex items-center justify-center text-gray-700 hover:text-[#F54900] active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      )}

      <div
        ref={containerRef}
        className="mt-2.5 w-full flex gap-2.5 overflow-x-auto pb-1 px-1 no-scrollbar select-none touch-pan-x scroll-smooth"
      >
        {products.map((prod) => (
          <motion.div
            key={prod.id}
            whileHover={{ y: -2 }}
            className="min-w-[108px] max-w-[108px] bg-white border border-gray-100 rounded-2xl p-2 flex flex-col justify-between shadow-3xs hover:shadow-2xs transition-all duration-200"
          >
            {/* Image & Badge */}
            <div className="w-full h-15 relative rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
              {prod.image ? (
                <Image
                  src={typeof prod.image === "string" ? prod.image : prod.image.src || "/images/chatbot-icon.png"}
                  alt={prod.title}
                  fill
                  className="object-contain p-1"
                />
              ) : (
                <ShoppingBag size={18} className="text-gray-300" />
              )}
              {prod.badge && (
                <span className="absolute top-0.5 left-0.5 px-1 py-0.5 rounded-md text-[6px] font-black text-white bg-[#F54900] scale-90">
                  {prod.badge}
                </span>
              )}
            </div>

            {/* Title & Price details */}
            <div className="mt-1.5 space-y-0.5 flex-1 flex flex-col justify-between">
              <h4 className="text-[8px] font-bold text-gray-800 line-clamp-1 leading-snug">
                {prod.title}
              </h4>
              <div>
                <div className="text-[9.5px] font-black text-[#F54900]">
                  {prod.price}
                </div>
                {prod.oldPrice && (
                  <div className="text-[7.5px] text-gray-400 line-through font-semibold leading-none">
                    {prod.oldPrice}
                  </div>
                )}
              </div>
            </div>

            {/* Action view link button */}
            <a
              href={`/product/${prod.slug || prod.id}`}
              className="w-full text-center py-1 rounded-lg bg-[#F54900] hover:bg-orange-600 text-[8.5px] font-black text-white transition-all duration-150 mt-2 block active:scale-95 shadow-3xs"
            >
              Shop ➔
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function GrivaAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [pulsed, setPulsed] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [activeOffers, setActiveOffers] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  
  // Sound system state
  const [isMuted, setIsMuted] = useState(false);
  
  // Interactive flow states
  const [isTrackingMode, setIsTrackingMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();


  // Fetch real products from the backend API on mount
  useEffect(() => {
    getProductsApi()
      .then((products) => {
        setAllProducts(products);
        
        // Filter products with a discount (oldPrice exists) or with active promotion badges
        const discounted = products.filter(
          (p) => 
            p.oldPrice || 
            (p.badge && 
              (p.badge.toLowerCase().includes("sale") || 
               p.badge.toLowerCase().includes("off") || 
               p.badge.toLowerCase().includes("hot") || 
               p.badge.toLowerCase().includes("deal")))
        );
        setActiveOffers(discounted.slice(0, 8));

        // Filter trending products
        const trending = products.filter(
          (p) =>
            p.isTrending ||
            (p.badge &&
              (p.badge.toLowerCase().includes("trend") ||
               p.badge.toLowerCase().includes("best") ||
               p.badge.toLowerCase().includes("hot")))
        );
        setTrendingProducts(trending.length > 0 ? trending : products.slice(0, 8));
      })
      .catch((err) => {
        console.warn("Failed to fetch real products for chatbot:", err);
      });
  }, []);

  // Soft, premium synthesized notification sound (Web Audio API)
  const playNotificationSound = () => {
    if (isMuted) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // Gentle dual-tone chime
      const osc1 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.07); // E5
      
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      
      osc1.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start();
      osc1.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Audio context might be blocked by browser autoplay policy
    }
  };

  // Pulsing animation to invite users to interact
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        setPulsed(true);
        setTimeout(() => setPulsed(false), 800);
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        text: "Hello! Welcome to GRIVA. 🇶🇦\n\nI am your **GRIVA AI Assistant** 🤖. How can I help you today? Please choose one of our quick actions below, or ask any question!",
        sender: "bot",
        timestamp: new Date(),
        options: [
          { label: "🔥 Current Active Offers", action: "show_offers" },
          { label: "📦 Return & Refund Policy", action: "show_returns" },
          { label: "🔍 Track My Order", action: "prompt_tracking" },
          { label: "🛍️ Explore Categories", action: "explore_categories" },
          { label: "💬 Chat with Live Agent", action: "chat_whatsapp" }
        ]
      }
    ]);
  }, []);

  // Scroll to bottom when messages or typing status updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleOpenChat = () => {
    setIsOpen(true);
    setShowTooltip(false);
    playNotificationSound();
  };

  // Typing simulator
  const addBotResponse = (text: string, options?: Option[], products?: Product[], tracking?: TrackingData) => {
    setIsTyping(true);
    
    const typingTime = Math.min(800 + text.length * 5, 1600);
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          text,
          sender: "bot",
          timestamp: new Date(),
          options,
          products,
          tracking
        }
      ]);
      playNotificationSound();
    }, typingTime);
  };

  // Real database-connected order tracking lookup
  const handleOrderTrackingSubmit = (orderId: string) => {
    setIsTrackingMode(false);
    
    // Clean search query ID
    const queryId = orderId.trim().toLowerCase().replace("#", "");
    
    setIsTyping(true);
    
    getAllOrdersApi()
      .then((orders) => {
        setIsTyping(false);
        
        // Find matching order by ID or order number
        const foundOrder = orders.find((o) => {
          const matchId = o.id.toString() === queryId;
          const matchNum = o.order_number && o.order_number.toLowerCase().replace("#", "") === queryId;
          return matchId || matchNum;
        });

        if (foundOrder) {
          // Map backend status to timeline steps
          let step = 1; // Default to Processing
          let displayStatus = "Processing";
          
          const statusLower = foundOrder.status.toLowerCase();
          if (statusLower === "pending") {
            step = 0; // Placed
            displayStatus = "Order Placed";
          } else if (statusLower === "processing") {
            step = 1; // Processing
            displayStatus = "Processing at Doha Center";
          } else if (statusLower === "shipped" || statusLower === "dispatch" || statusLower === "dispatched") {
            step = 2; // Dispatched
            displayStatus = "Dispatched & In Transit";
          } else if (statusLower === "completed") {
            step = 3; // Out for Delivery
            displayStatus = "Out for Delivery (Doha Express)";
          } else if (statusLower === "cancelled") {
            step = -1; // Cancelled
            displayStatus = "Cancelled";
          }

          // Format exact product items list
          let itemsText = "Items in order";
          if (foundOrder.items && foundOrder.items.length > 0) {
            itemsText = foundOrder.items
              .map((item) => `${item.product?.title || "Product"} (${item.quantity}x)`)
              .join(", ");
          }

          // Set realistic delivery ETA based on dispatch status
          let eta = "Within 24-48 hours";
          if (step === 3) {
            eta = "Today by 8:00 PM (Doha Time)";
          } else if (step === 0 || step === 1) {
            eta = "Tomorrow by 6:00 PM";
          }

          const tracking: TrackingData = {
            orderId: foundOrder.order_number || `#GRV-${foundOrder.id}`,
            status: displayStatus,
            step: step === -1 ? 0 : step, 
            carrier: foundOrder.delivery_payment_method || "GRIVA Express (Doha Branch)",
            eta: eta,
            amount: foundOrder.total_price,
            items: itemsText
          };

          if (statusLower === "cancelled") {
            addBotResponse(
              `❌ **Order Cancelled**\n\nYour order **${tracking.orderId}** has been marked as **Cancelled** in our system.\n\nIf you believe this is an error or would like to reactivate this order, please contact our support team on WhatsApp immediately.`,
              [
                { label: "💬 Contact WhatsApp Support", action: "chat_whatsapp" },
                { label: "🔙 Back to Main Menu", action: "main_menu" }
              ],
              undefined,
              tracking
            );
          } else {
            addBotResponse(
              `🔍 **Order Located!**\n\nWe found your order **${tracking.orderId}** in our database. Here are the live shipping details:`,
              [
                { label: "💬 Contact Support for this Order", action: "chat_whatsapp" },
                { label: "🔙 Back to Main Menu", action: "main_menu" }
              ],
              undefined,
              tracking
            );
          }
        } else {
          // No order found
          addBotResponse(
            `❌ **Order Not Found**\n\nWe couldn't find any active order with ID **#${orderId.replace("#", "")}** in our Doha fulfillment system.\n\nPlease check your Order ID and try again, or chat with our live agent on WhatsApp for manual lookup.`,
            [
              { label: "🔍 Try Another ID", action: "prompt_tracking" },
              { label: "💬 Speak to Live Agent", action: "chat_whatsapp" },
              { label: "🔙 Back to Main Menu", action: "main_menu" }
            ]
          );
        }
      })
      .catch((err) => {
        setIsTyping(false);
        console.error("Error retrieving orders from API:", err);
        addBotResponse(
          `❌ **Order Lookup Error**\n\nWe experienced a temporary error trying to connect to the Doha shipping server.\n\nPlease try again in a few moments, or chat directly with our support team on WhatsApp.`,
          [
            { label: "🔍 Try Again", action: "prompt_tracking" },
            { label: "💬 Chat on WhatsApp", action: "chat_whatsapp" },
            { label: "🔙 Back to Main Menu", action: "main_menu" }
          ]
        );
      });
  };

  const handleOptionClick = (option: Option) => {
    // Post the user's click
    const userMsg: Message = {
      id: Math.random().toString(),
      text: option.label,
      sender: "user",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    // Handle menu actions
    switch (option.action) {
      case "show_returns":
        addBotResponse(
          "We offer a **7-day hassle-free return and exchange policy**! 🇶🇦\n\n**Key Rules:**\n• Products must be unused, unopened, and in their original packaging.\n• **Damaged/Defective Items**: Eligible for immediate exchange. If the item is out of stock, you will receive a full refund to your wallet!\n• Please keep your order number or receipt handy.\n\nWould you like to speak to our team to start a return?",
          [
            { label: "💬 Contact WhatsApp Support", action: "chat_whatsapp" },
            { label: "🔙 Back to Main Menu", action: "main_menu" }
          ]
        );
        break;

      case "prompt_tracking":
        setIsTrackingMode(true);
        addBotResponse(
          "Sure! 🚚 Please enter your **Order ID** (e.g., **#GRV-8492**) below, and I will check its real-time status in our Doha dispatch system.",
          [{ label: "🔙 Cancel & Back to Menu", action: "main_menu" }]
        );
        break;

      case "explore_categories":
        addBotResponse(
          "Which category would you like to explore? We have premium curated products ready for express delivery in Qatar! 🛍️👇",
          [
            { label: "✨ Perfumes & Buhoor", action: "view_category", category: "perfumes-buhoor" },
            { label: "🔌 Gadgets & Electronics", action: "view_category", category: "gadgets-electronics" },
            { label: "🎮 Gaming Accessories", action: "view_category", category: "gaming-accessories" },
            { label: "👶 Baby Products", action: "view_category", category: "baby-products" },
            { label: "🧸 Toys", action: "view_category", category: "toys" },
            { label: "🍳 Kitchen & Appliances", action: "view_category", category: "kitchen-appliances-essentials" },
            { label: "🔙 Back to Main Menu", action: "main_menu" }
          ]
        );
        break;

      case "view_category":
        if (option.category) {
          const targetSlug = option.category;
          const categorySlugMap: Record<string, string> = {
            "perfumes-buhoor": "Perfumes & Buhoor",
            "toys": "Toys",
            "baby-products": "Baby Products",
            "gadgets-electronics": "Gadgets & Electronics",
            "gaming-accessories": "Gaming Accessories",
            "kitchen-appliances-essentials": "Kitchen Appliances & Essentials",
          };
          const matchedCategoryName = categorySlugMap[targetSlug] || targetSlug;
          const catProducts = allProducts.filter(p => 
            p.category.toLowerCase() === targetSlug.toLowerCase() ||
            p.category.toLowerCase() === matchedCategoryName.toLowerCase()
          ).slice(0, 4);

          const catName = option.label.replace(/^[^\s]+\s+/, "");
          
          if (catProducts.length > 0) {
            addBotResponse(
              `Here are some of our top-selling products in **${catName}**! Click on any card to view its complete specs and details:`,
              [
                { label: "🛍️ View Full Category", action: "redirect", link: `/category/${option.category}` },
                { label: "🔙 Other Categories", action: "explore_categories" },
                { label: "🏠 Main Menu", action: "main_menu" }
              ],
              catProducts
            );
          } else {
            addBotResponse(
              `We have a wonderful selection of **${catName}** products available in our shop! Click below to browse:`,
              [
                { label: "🛍️ Browse Shop", action: "redirect", link: `/category/${option.category}` },
                { label: "🔙 Main Menu", action: "main_menu" }
              ]
            );
          }
        }
        break;

      case "show_returns_policy":
        addBotResponse(
          "We offer a **7-day hassle-free return and exchange policy**! 🇶🇦\n\n**Key Rules:**\n• Products must be unused, unopened, and in their original packaging.\n• **Damaged/Defective Items**: Eligible for exchange. If out of stock, you will receive a full refund to your GRIVA wallet!\n• Please keep your order number or receipt handy.",
          [
            { label: "💬 Contact WhatsApp Support", action: "chat_whatsapp" },
            { label: "🔙 Back to Main Menu", action: "main_menu" }
          ]
        );
        break;

      case "show_offers":
        if (trendingProducts.length > 0) {
          addBotResponse(
            "Check out the **Top Trending Products & Best Deals** active right now on GRIVA! ⚡🔥 Scroll horizontally to browse them all:",
            [
              { label: "🛍️ Shop All Trends", action: "redirect", link: "/shop?sortBy=rating" },
              { label: "🔙 Back to Main Menu", action: "main_menu" }
            ],
            trendingProducts
          );
        } else if (activeOffers.length > 0) {
          addBotResponse(
            "Here are the hot deals and discounts active right now on GRIVA! 🎁🔥 Click on any card to shop instantly:",
            [
              { label: "🛍️ Shop All Offers", action: "redirect", link: "/shop" },
              { label: "🔙 Back to Main Menu", action: "main_menu" }
            ],
            activeOffers
          );
        } else {
          addBotResponse(
            "We have great campaigns running! 🎉\n\n• **Free Doha Delivery:** Applied automatically on all orders above QAR 99.\n• **Premium Quality:** Guaranteed best tech and perfume deals in Qatar.\n\nClick below to check out our shop page!",
            [
              { label: "🛍️ Shop Latest Deals", action: "redirect", link: "/shop" },
              { label: "🔙 Back to Main Menu", action: "main_menu" }
            ]
          );
        }
        break;

      case "chat_whatsapp":
        addBotResponse("Opening WhatsApp to connect you with our live support agent in Doha... 💬✈️", []);
        setTimeout(() => {
          window.open(WHATSAPP_URL, "_blank");
        }, 1000);
        break;

      case "redirect":
        if (option.link) {
          window.open(option.link, "_self");
        }
        break;

      case "main_menu":
        setIsTrackingMode(false);
        addBotResponse(
          "Here is the main menu. Let me know how I can help you: 👇",
          [
            { label: "🔥 Current Active Offers", action: "show_offers" },
            { label: "📦 Return & Refund Policy", action: "show_returns" },
            { label: "🔍 Track My Order", action: "prompt_tracking" },
            { label: "🛍️ Explore Categories", action: "explore_categories" },
            { label: "💬 Chat with Live Agent", action: "chat_whatsapp" }
          ]
        );
        break;

      default:
        break;
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const query = inputValue.trim();
    const userMsg: Message = {
      id: Math.random().toString(),
      text: query,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");

    // If waiting for order tracking ID
    if (isTrackingMode) {
      handleOrderTrackingSubmit(query);
      return;
    }

    // Keyword parser
    const q = query.toLowerCase();
    
    if (q.includes("return") || q.includes("refund") || q.includes("exchange") || q.includes("replace") || q.includes("damage")) {
      addBotResponse(
        "I can help you with returns! 📦 We have a **7-day return policy** for unopened items. If your item arrived damaged, you can exchange it; if it is out of stock, you will receive a full refund to your GRIVA wallet!\n\nWould you like to initiate a return or speak with WhatsApp support?",
        [
          { label: "💬 Return via WhatsApp", action: "chat_whatsapp" },
          { label: "🔙 Main Menu", action: "main_menu" }
        ]
      );
    } else if (q.includes("track") || q.includes("order") || q.includes("status") || q.includes("where") || q.includes("shipp") || q.includes("parcel")) {
      setIsTrackingMode(true);
      addBotResponse(
        "Please enter your **Order ID** (e.g., **#GRV-8492**) below, and I will instantly search our courier database for its status.",
        [{ label: "🔙 Cancel & Back to Menu", action: "main_menu" }]
      );
    } else if (q.includes("delivery") || q.includes("shipping") || q.includes("time") || q.includes("doha") || q.includes("cod") || q.includes("fast")) {
      addBotResponse(
        "We offer fast express delivery! 🚚\n\n• **Doha:** Free delivery on orders over QAR 99.\n• **Rest of Qatar:** Express dispatch with delivery within 24-48 hours.\n• Cash on Delivery (COD) is fully supported!",
        [
          { label: "🚚 Delivery Policy Details", action: "redirect", link: "/same-day-delivery-doha" },
          { label: "🔙 Main Menu", action: "main_menu" }
        ]
      );
    } else if (q.includes("offer") || q.includes("discount") || q.includes("coupon") || q.includes("deal") || q.includes("sale") || q.includes("promo")) {
      if (activeOffers.length > 0) {
        addBotResponse(
          "Here are our active deals right now! Click on any card to view it on our store:",
          [
            { label: "🛍️ Browse Shop", action: "redirect", link: "/shop" },
            { label: "🔙 Main Menu", action: "main_menu" }
          ],
          activeOffers
        );
      } else {
        addBotResponse(
          "We offer free Doha shipping on orders over QAR 99, plus seasonal discounts on premium electronics and fragrances! Click below to shop:",
          [
            { label: "🛍️ Browse Shop", action: "redirect", link: "/shop" },
            { label: "🔙 Main Menu", action: "main_menu" }
          ]
        );
      }
    } else if (q.includes("perfume") || q.includes("oud") || q.includes("fragrance") || q.includes("buhoor")) {
      const perfProducts = allProducts.filter(p => 
        p.category.toLowerCase() === "perfumes-buhoor" || p.category.toLowerCase() === "perfumes & buhoor"
      ).slice(0, 3);
      addBotResponse(
        "We have premium concentrated Oud oils and French fragrances! Here are our top recommendations:",
        [
          { label: "🛍️ View Perfumes", action: "redirect", link: "/category/perfumes-buhoor" },
          { label: "🔙 Main Menu", action: "main_menu" }
        ],
        perfProducts
      );
    } else if (q.includes("gadget") || q.includes("headphone") || q.includes("watch") || q.includes("speaker") || q.includes("electronics")) {
      const elecProducts = allProducts.filter(p => 
        p.category.toLowerCase() === "gadgets-electronics" || p.category.toLowerCase() === "gadgets & electronics"
      ).slice(0, 3);
      addBotResponse(
        "Explore our high-end electronics, smartwatches, and audiophile gears:",
        [
          { label: "🛍️ View Electronics", action: "redirect", link: "/category/gadgets-electronics" },
          { label: "🔙 Main Menu", action: "main_menu" }
        ],
        elecProducts
      );
    } else if (q.includes("gaming") || q.includes("xbox") || q.includes("controller") || q.includes("joystick")) {
      const gameProducts = allProducts.filter(p => 
        p.category.toLowerCase() === "gaming-accessories" || p.category.toLowerCase() === "gaming accessories"
      ).slice(0, 3);
      addBotResponse(
        "Level up with our pro gaming accessories and consoles:",
        [
          { label: "🛍️ View Gaming Gear", action: "redirect", link: "/category/gaming-accessories" },
          { label: "🔙 Main Menu", action: "main_menu" }
        ],
        gameProducts
      );
    } else if (q.includes("toy") || q.includes("doll") || q.includes("child") || q.includes("kids")) {
      const toyProducts = allProducts.filter(p => 
        p.category.toLowerCase() === "toys"
      ).slice(0, 3);
      addBotResponse(
        "Explore our fun and educational toys for kids of all ages! 🧸",
        [
          { label: "🛍️ View Toys", action: "redirect", link: "/category/toys" },
          { label: "🔙 Main Menu", action: "main_menu" }
        ],
        toyProducts
      );
    } else if (q.includes("baby") || q.includes("infant") || q.includes("crib") || q.includes("stroller")) {
      const babyProducts = allProducts.filter(p => 
        p.category.toLowerCase() === "baby products" || p.category.toLowerCase() === "baby-products"
      ).slice(0, 3);
      addBotResponse(
        "We have premium, safe, and comfortable baby essentials! 👶",
        [
          { label: "🛍️ View Baby Products", action: "redirect", link: "/category/baby-products" },
          { label: "🔙 Main Menu", action: "main_menu" }
        ],
        babyProducts
      );
    } else if (q.includes("kitchen") || q.includes("coffee") || q.includes("appliance") || q.includes("cook")) {
      const kitchenProducts = allProducts.filter(p => 
        p.category.toLowerCase() === "kitchen appliances & essentials" || p.category.toLowerCase() === "kitchen-appliances-essentials"
      ).slice(0, 3);
      addBotResponse(
        "Upgrade your home with our high-quality kitchen appliances and tools! 🍳",
        [
          { label: "🛍️ View Kitchen Appliances", action: "redirect", link: "/category/kitchen-appliances-essentials" },
          { label: "🔙 Main Menu", action: "main_menu" }
        ],
        kitchenProducts
      );
    } else if (q.includes("whatsapp") || q.includes("human") || q.includes("agent") || q.includes("chat") || q.includes("contact") || q.includes("phone") || q.includes("support")) {
      addBotResponse(
        "Certainly! Let me redirect you to our live Doha support line on WhatsApp. 💬",
        [
          { label: "💬 Connect to WhatsApp", action: "chat_whatsapp" },
          { label: "🔙 Main Menu", action: "main_menu" }
        ]
      );
    } else if (q.includes("hi") || q.includes("hello") || q.includes("hey") || q.includes("start") || q.includes("welcome")) {
      addBotResponse(
        "Hello! 👋 I am your GRIVA AI Assistant. How can I help you today? Please choose one of the options below:",
        [
          { label: "🔥 Current Active Offers", action: "show_offers" },
          { label: "📦 Return & Refund Policy", action: "show_returns" },
          { label: "🔍 Track My Order", action: "prompt_tracking" },
          { label: "🛍️ Explore Categories", action: "explore_categories" },
          { label: "💬 Chat with Live Agent", action: "chat_whatsapp" }
        ]
      );
    } else {
      addBotResponse(
        "I'm not quite sure about that query, but our team on WhatsApp can answer it instantly! 💬 Just click below:",
        [
          { label: "💬 Connect to WhatsApp", action: "chat_whatsapp" },
          { label: "🔙 Main Menu", action: "main_menu" }
        ]
      );
    }
  };

  // Hide chatbot on admin views to ensure all hooks run consistently
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-20 right-4 sm:bottom-20 sm:right-6 z-[998] flex flex-col items-end gap-2 select-none">
        {/* Unread message tooltip bubble */}
        <AnimatePresence>
          {!isOpen && showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.85 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100/60 px-4 py-2.5 text-xs text-gray-800 max-w-[190px] leading-relaxed cursor-pointer pointer-events-auto"
              onClick={handleOpenChat}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="h-2 w-2 rounded-full bg-[#F54900] animate-pulse" />
                <p className="font-bold text-[12px] text-gray-900">GRIVA AI Assist 🤖</p>
              </div>
              <p className="text-gray-500 text-[10px] leading-snug">Online! Ask me about returns, delivery & deals.</p>
              {/* Arrow pointer */}
              <div className="absolute -bottom-1.5 right-5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white" />
              <div className="absolute -bottom-[7px] right-5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-100/50 z-[-1]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Trigger Circle */}
        <motion.button
          onClick={() => (isOpen ? setIsOpen(false) : handleOpenChat())}
          aria-label="Open GRIVA Chat Assistant"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          animate={
            pulsed
              ? { scale: [1, 1.14, 1], boxShadow: ["0 0 0 0 rgba(245,73,0,0.4)", "0 0 0 14px rgba(245,73,0,0)", "0 0 0 0 rgba(245,73,0,0)"] }
              : {}
          }
          transition={{ duration: 0.8 }}
          whileHover={{ scale: 1.08, translateY: -2 }}
          whileTap={{ scale: 0.93 }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-transparent transition-all cursor-pointer focus:outline-none overflow-visible shadow-lg"
        >
          {/* Glowing Green Online Status indicator */}
          <span className="absolute top-0.5 right-0.5 z-20 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white" />
          </span>

          {/* Chatbot Icon - Full size of the button */}
          <div className="relative h-full w-full overflow-hidden rounded-full border border-gray-200/10">
            <Image
              src="/images/chatbot-icon.png"
              alt="GRIVA Logo"
              fill
              className="object-cover"
            />
          </div>
        </motion.button>
      </div>

      {/* Chat Window Dialog (Compact, Responsive and mobile optimized) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-[92px] right-[4%] sm:right-6 w-[92vw] sm:w-[340px] h-[450px] bg-white rounded-[24px] shadow-2xl border border-gray-100 z-[999] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#F54900] px-4 py-3.5 text-white flex items-center justify-between relative shadow-md select-none touch-none">
              {/* Decorative top glowing bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-300 via-orange-100 to-orange-400 opacity-40" />
              
              <div className="flex items-center gap-2.5">
                {/* Robot/Bot Avatar */}
                <div className="relative h-9 w-9 rounded-xl bg-white/10 p-0.5 border border-white/20 shadow-sm flex items-center justify-center">
                  <Image
                    src="/images/chatbot-icon.png"
                    alt="GRIVA AI"
                    width={32}
                    height={32}
                    className="h-full w-full object-contain rounded-lg"
                  />
                  {/* Glowing online indicator */}
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-[#F54900] shadow-xs" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[13px] tracking-tight">GRIVA Assistant</h3>
                  <p className="text-[9px] text-orange-100 font-semibold flex items-center gap-1">
                    <span>AI Assistant</span>
                    <span className="h-1 w-1 rounded-full bg-orange-200" />
                    <span>Always Online</span>
                  </p>
                </div>
              </div>

              {/* Audio Controls & Close Button */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="h-7 w-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-white focus:outline-none"
                  title={isMuted ? "Unmute sounds" : "Mute sounds"}
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-white focus:outline-none"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="bg-orange-50/60 border-b border-orange-100/40 px-4 py-1.5 flex items-center justify-between text-[9px] text-gray-500 select-none">
              <div className="flex items-center gap-1 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-gray-700">🟢 Live Agent Online</span>
              </div>
              <div className="flex items-center gap-1 text-orange-600 font-bold">
                <TrendingUp size={10} />
                <span>Doha Express Active</span>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4 overscroll-behavior-contain touch-pan-y no-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-[18px] text-xs font-medium leading-relaxed shadow-2xs ${
                      msg.sender === "user"
                        ? "bg-[#F54900] text-white rounded-tr-xs"
                        : "bg-white text-gray-950 border border-gray-100 rounded-tl-xs whitespace-pre-line"
                    }`}
                  >
                    {msg.sender === "bot" ? (
                      msg.text.split("**").map((chunk, i) => (
                        i % 2 === 1 ? <strong key={i} className="font-bold text-black">{chunk}</strong> : chunk
                      ))
                    ) : (
                      msg.text
                    )}
                  </div>

                  {/* Rich Simulated Order Tracking Card */}
                  {msg.tracking && (
                    <div className="mt-2.5 w-[85%] bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm space-y-3 select-none">
                      {/* Header with Order ID */}
                      <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                        <div className="flex items-center gap-1.5">
                          <Package size={14} className="text-[#F54900]" />
                          <span className="text-[11px] font-black text-gray-900">{msg.tracking.orderId}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-extrabold bg-orange-50 text-[#F54900] border border-orange-100/50">
                          {msg.tracking.status}
                        </span>
                      </div>

                      {/* Timeline Steps */}
                      <div className="relative pl-5 space-y-3 text-[10px]">
                        {/* Vertical Progress Line */}
                        <div className="absolute left-1.5 top-1 bottom-1 w-[2px] bg-gray-100">
                          <div 
                            className="w-full bg-[#F54900] rounded-full transition-all duration-500" 
                            style={{ height: `${(msg.tracking.step / 3) * 100}%` }}
                          />
                        </div>

                        {/* Step 0: Order Placed */}
                        <div className="relative flex items-center gap-2">
                          <div className={`absolute -left-[18.5px] h-3 w-3 rounded-full border-2 flex items-center justify-center ${msg.tracking.step >= 0 ? "bg-[#F54900] border-[#F54900]" : "bg-white border-gray-200"}`}>
                            {msg.tracking.step >= 0 && <span className="h-1 w-1 rounded-full bg-white" />}
                          </div>
                          <span className={msg.tracking.step >= 0 ? "font-bold text-gray-800" : "text-gray-400"}>Order Placed</span>
                        </div>

                        {/* Step 1: Dispatched */}
                        <div className="relative flex items-center gap-2">
                          <div className={`absolute -left-[18.5px] h-3 w-3 rounded-full border-2 flex items-center justify-center ${msg.tracking.step >= 2 ? "bg-[#F54900] border-[#F54900]" : "bg-white border-gray-200"}`}>
                            {msg.tracking.step >= 2 && <span className="h-1 w-1 rounded-full bg-white" />}
                          </div>
                          <span className={msg.tracking.step >= 2 ? "font-bold text-gray-800" : "text-gray-400"}>Dispatched from Warehouse</span>
                        </div>

                        {/* Step 2: Out for Delivery */}
                        <div className="relative flex items-center gap-2">
                          <div className={`absolute -left-[18.5px] h-3 w-3 rounded-full border-2 flex items-center justify-center ${msg.tracking.step >= 3 ? "bg-[#F54900] border-[#F54900]" : "bg-white border-gray-200"}`}>
                            {msg.tracking.step >= 3 && <span className="h-1 w-1 rounded-full bg-white" />}
                          </div>
                          <span className={msg.tracking.step >= 3 ? "font-bold text-gray-800" : "text-gray-400"}>Out for Delivery</span>
                        </div>
                      </div>

                      {/* Meta Information Grid */}
                      <div className="bg-gray-50/50 rounded-xl p-2.5 space-y-1.5 text-[9px] border border-gray-100/50">
                        <div className="flex items-center justify-between text-gray-500">
                          <span className="flex items-center gap-1"><MapPin size={10} /> Carrier:</span>
                          <span className="font-bold text-gray-800">{msg.tracking.carrier}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-500">
                          <span className="flex items-center gap-1"><Clock size={10} /> Estimated Delivery:</span>
                          <span className="font-bold text-orange-600">{msg.tracking.eta}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-500">
                          <span className="flex items-center gap-1"><CreditCard size={10} /> Total Payment (COD):</span>
                          <span className="font-extrabold text-gray-900">{msg.tracking.amount}</span>
                        </div>
                        <div className="border-t border-gray-100/80 pt-1.5 mt-1 text-gray-400 font-semibold truncate">
                          Items: {msg.tracking.items}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Real-time Interactive Product Cards Carousel (Wow Factor!) */}
                  {msg.products && msg.products.length > 0 && (
                    <ProductCarousel products={msg.products} />
                  )}

                  {/* Message Options (Pills/Chips with generous touch targets) */}
                  {msg.options && msg.options.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2 max-w-[95%]">
                      {msg.options.map((opt, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.02, y: -0.5 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleOptionClick(opt)}
                          className="px-3.5 py-2.5 rounded-full text-[11px] font-bold bg-white hover:bg-orange-50/50 text-gray-750 hover:text-[#F54900] border border-gray-200/85 hover:border-orange-200 transition-all duration-150 shadow-3xs cursor-pointer flex items-center gap-1.5 active:bg-orange-50 select-none touch-manipulation"
                        >
                          <span>{opt.label}</span>
                          {opt.action === "redirect" && <ExternalLink size={10} className="opacity-60" />}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing simulation */}
              {isTyping && (
                <div className="flex flex-col items-start">
                  <div className="bg-white border border-gray-100 rounded-[18px] rounded-tl-xs px-4 py-3 flex items-center gap-1 shadow-2xs">
                    <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-gray-100 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isTrackingMode ? "Enter Order ID (e.g. #GRV-8492)..." : "Ask me a question..."}
                className="flex-1 bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#F54900] focus:ring-1 focus:ring-orange-500/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all duration-200 touch-manipulation"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="h-9.5 w-9.5 bg-[#F54900] disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 transition-all duration-200 cursor-pointer focus:outline-none shadow-xs touch-manipulation"
              >
                <Send size={14} className={inputValue.trim() ? "translate-x-0.5" : ""} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS style to completely hide scrollbars while preserving scrolling functionality */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
    </>
  );
}
