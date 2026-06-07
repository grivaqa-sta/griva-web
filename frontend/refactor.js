const fs = require('fs');

const content = fs.readFileSync('scratch_page.txt', 'utf8');
const lines = content.split('\n');

const extract = (start, end) => lines.slice(start, end).join('\n').trim();

let overview = extract(309, 559);
let products = extract(565, 700);
let banners = extract(706, 859);
let subscribers = extract(865, 975);

const overviewProps = `interface OverviewTabProps {
  announcementBarEnabled: boolean;
  setAnnouncementBarEnabled: (val: boolean) => void;
  fridaySaleEnabled: boolean;
  setFridaySaleEnabled: (val: boolean) => void;
  midnightSaleEnabled: boolean;
  setMidnightSaleEnabled: (val: boolean) => void;
  highlightedSchemaSection: string | null;
  setHighlightedSchemaSection: (val: string | null) => void;
  setActiveTab: (val: any) => void;
  slidesList: any[];
  categoriesList: any[];
  offersList: any[];
}`;

const productsProps = `interface ProductsTabProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  categories: string[];
  setIsAddModalOpen: (val: boolean) => void;
  filteredProducts: any[];
  handleStockAdjustment: (id: number, delta: number) => void;
  setProductsList: any;
}`;

const bannersProps = `interface BannersTabProps {
  slidesList: any[];
  categoriesList: any[];
  offersList: any[];
  handleToggleSlide: (index: number) => void;
  handleToggleOffer: (id: number) => void;
}`;

const subscribersProps = `interface SubscribersTabProps {
  subscribersList: any[];
  setSubscribersList: any;
  newSubEmail: string;
  setNewSubEmail: (val: string) => void;
  broadcastMessage: string;
  setBroadcastMessage: (val: string) => void;
  broadcastStatus: string;
  handleSendBroadcast: (e: any) => void;
}`;

const baseImports = `import React from 'react';
import {
  LayoutDashboard, Package, Sliders, Users, Search, Bell, Plus, Trash2, RefreshCw, TrendingUp, DollarSign, ShoppingCart, Percent, ChevronRight, Edit, ArrowUpRight, Mail, Send, Eye, AlertTriangle, X, Sparkles, ToggleLeft, ToggleRight, Image as ImageIcon, CheckCircle, EyeOff
} from 'lucide-react';
`;

fs.writeFileSync('app/admin/components/OverviewTab.tsx', baseImports + overviewProps + '\n\nexport default function OverviewTab(props: OverviewTabProps) {\n  const { announcementBarEnabled, setAnnouncementBarEnabled, fridaySaleEnabled, setFridaySaleEnabled, midnightSaleEnabled, setMidnightSaleEnabled, highlightedSchemaSection, setHighlightedSchemaSection, setActiveTab, slidesList, categoriesList, offersList } = props;\n  return (\n    ' + overview + '\n  );\n}\n');

fs.writeFileSync('app/admin/components/ProductsTab.tsx', baseImports + productsProps + '\n\nexport default function ProductsTab(props: ProductsTabProps) {\n  const { searchQuery, setSearchQuery, filterCategory, setFilterCategory, categories, setIsAddModalOpen, filteredProducts, handleStockAdjustment, setProductsList } = props;\n  return (\n    ' + products + '\n  );\n}\n');

fs.writeFileSync('app/admin/components/BannersTab.tsx', baseImports + bannersProps + '\n\nexport default function BannersTab(props: BannersTabProps) {\n  const { slidesList, categoriesList, offersList, handleToggleSlide, handleToggleOffer } = props;\n  return (\n    ' + banners + '\n  );\n}\n');

fs.writeFileSync('app/admin/components/SubscribersTab.tsx', baseImports + subscribersProps + '\n\nexport default function SubscribersTab(props: SubscribersTabProps) {\n  const { subscribersList, setSubscribersList, newSubEmail, setNewSubEmail, broadcastMessage, setBroadcastMessage, broadcastStatus, handleSendBroadcast } = props;\n  return (\n    ' + subscribers + '\n  );\n}\n');

const beforeTabs = extract(0, 308);
const afterTabs = extract(976, lines.length);

const imports = `
import OverviewTab from './components/OverviewTab';
import ProductsTab from './components/ProductsTab';
import BannersTab from './components/BannersTab';
import SubscribersTab from './components/SubscribersTab';
`;

const modifiedBefore = beforeTabs.replace('import { Product, SlideData, OfferCard, CategoryItem } from "../types/types";', 'import { Product, SlideData, OfferCard, CategoryItem } from "../types/types";' + imports);

const renderTabs = `
          {activeTab === 'overview' && (
            <OverviewTab 
              announcementBarEnabled={announcementBarEnabled}
              setAnnouncementBarEnabled={setAnnouncementBarEnabled}
              fridaySaleEnabled={fridaySaleEnabled}
              setFridaySaleEnabled={setFridaySaleEnabled}
              midnightSaleEnabled={midnightSaleEnabled}
              setMidnightSaleEnabled={setMidnightSaleEnabled}
              highlightedSchemaSection={highlightedSchemaSection}
              setHighlightedSchemaSection={setHighlightedSchemaSection}
              setActiveTab={setActiveTab}
              slidesList={slidesList}
              categoriesList={categoriesList}
              offersList={offersList}
            />
          )}

          {activeTab === 'products' && (
            <ProductsTab
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              categories={categories}
              setIsAddModalOpen={setIsAddModalOpen}
              filteredProducts={filteredProducts}
              handleStockAdjustment={handleStockAdjustment}
              setProductsList={setProductsList}
            />
          )}

          {activeTab === 'banners' && (
            <BannersTab
              slidesList={slidesList}
              categoriesList={categoriesList}
              offersList={offersList}
              handleToggleSlide={handleToggleSlide}
              handleToggleOffer={handleToggleOffer}
            />
          )}

          {activeTab === 'subscribers' && (
            <SubscribersTab
              subscribersList={subscribersList}
              setSubscribersList={setSubscribersList}
              newSubEmail={newSubEmail}
              setNewSubEmail={setNewSubEmail}
              broadcastMessage={broadcastMessage}
              setBroadcastMessage={setBroadcastMessage}
              broadcastStatus={broadcastStatus}
              handleSendBroadcast={handleSendBroadcast}
            />
          )}
`;

fs.writeFileSync('app/admin/page.tsx', modifiedBefore + '\n' + renderTabs + '\n' + afterTabs);
