
import { Category, Product, DeliveryOption, ProductPackage, PaymentMethod } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat_bestsellers', name: 'Bestsellers', slug: 'bestsellers', enabled: true },
  { id: 'cat_ed', name: 'Erectile Dysfunction', slug: 'erectile-dysfunction', enabled: true },
  { id: 'cat_antiviral', name: 'Anti Viral', slug: 'anti-viral', enabled: true },
  { id: 'cat_antiacidity', name: 'Anti-Acidity', slug: 'anti-acidity', enabled: true },
  { id: 'cat_antibiotics', name: 'Antibiotics', slug: 'antibiotics', enabled: true },
  { id: 'cat_antiallergic', name: 'Anti-Allergic/Asthma', slug: 'anti-allergic-asthma', enabled: true },
  { id: 'cat_antidepressant', name: 'Anti-Depressant', slug: 'anti-depressant', enabled: true },
  { id: 'cat_antidiabetic', name: 'Anti-Diabetic', slug: 'anti-diabetic', enabled: true },
  { id: 'cat_antifungus', name: 'Anti-Fungus', slug: 'anti-fungus', enabled: true },
  { id: 'cat_antiherpes', name: 'Anti-Herpes', slug: 'anti-herpes', enabled: true },
  { id: 'cat_bloodpressure', name: 'Blood Pressure', slug: 'blood-pressure', enabled: true },
  { id: 'cat_cholesterol', name: 'Cholesterol', slug: 'cholesterol', enabled: true },
  { id: 'cat_gastro', name: 'Gastrointestinal', slug: 'gastrointestinal', enabled: true },
  { id: 'cat_general', name: 'General Health', slug: 'general-health', enabled: true },
  { id: 'cat_hairloss', name: 'Hair Loss', slug: 'hair-loss', enabled: true },
  { id: 'cat_bones', name: 'Healthy Bones', slug: 'healthy-bones', enabled: true },
  { id: 'cat_heart', name: 'Heart Disease', slug: 'heart-disease', enabled: true },
  { id: 'cat_herbal', name: 'Herbal', slug: 'herbal', enabled: true },
  { id: 'cat_mens', name: "Men's Health", slug: 'mens-health', enabled: true },
  { id: 'cat_other', name: 'Other', slug: 'other', enabled: true },
  { id: 'cat_pain', name: 'Pain Relief', slug: 'pain-relief', enabled: true },
  { id: 'cat_skin', name: 'Skin Care', slug: 'skin-care', enabled: true },
  { id: 'cat_sleep', name: 'Sleep Aid', slug: 'sleep-aid', enabled: true },
  { id: 'cat_smoking', name: 'Stop Smoking', slug: 'stop-smoking', enabled: true },
  { id: 'cat_weight', name: 'Weight Loss', slug: 'weight-loss', enabled: true },
  { id: 'cat_womens', name: "Women's Health", slug: 'womens-health', enabled: true },
];

export const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm_visa', name: 'VISA', iconUrl: 'https://vdhgagzaeyvrsthxsbxn.supabase.co/storage/v1/object/public/images/visa.png', enabled: true },
  { id: 'pm_mc', name: 'MasterCard', iconUrl: 'https://vdhgagzaeyvrsthxsbxn.supabase.co/storage/v1/object/public/images/master.png', enabled: true },
  { id: 'pm_amex', name: 'Amex', iconUrl: 'https://vdhgagzaeyvrsthxsbxn.supabase.co/storage/v1/object/public/images/amex.png', enabled: true },
  { id: 'pm_btc', name: 'Bitcoin', iconUrl: 'https://vdhgagzaeyvrsthxsbxn.supabase.co/storage/v1/object/public/images/bit.png', enabled: true },
  { id: 'pm_cashapp', name: 'Cash App', iconUrl: 'https://vdhgagzaeyvrsthxsbxn.supabase.co/storage/v1/object/public/images/cashapp%20(1).png', enabled: true },
  { id: 'pm_wu', name: 'Western Union', iconUrl: 'https://vdhgagzaeyvrsthxsbxn.supabase.co/storage/v1/object/public/images/western.png', enabled: true },
  { id: 'pm_bank', name: 'Bank Transfer', iconUrl: 'https://vdhgagzaeyvrsthxsbxn.supabase.co/storage/v1/object/public/images/bank.png', enabled: true },
];

export const STANDARD_DELIVERY: DeliveryOption[] = [
  { id: 'del_express', name: 'Express', price: 28.95, minDays: 5, maxDays: 9, icon: 'express', enabled: true },
  { id: 'del_normal', name: 'Normal Mail', price: 13.95, minDays: 14, maxDays: 28, icon: 'normal', enabled: true },
];

export const CARRIERS: Record<string, string> = {
  'DHL': 'https://www.dhl.com/en/express/tracking.html?AWB={TRACKING_NUMBER}',
  'FedEx': 'https://www.fedex.com/fedextrack/?trknbr={TRACKING_NUMBER}',
  'UPS': 'https://www.ups.com/track?tracknum={TRACKING_NUMBER}',
  'USPS': 'https://tools.usps.com/go/TrackConfirmAction?tLabels={TRACKING_NUMBER}',
  'Royal Mail': 'https://www.royalmail.com/track-your-item#/tracking-results/{TRACKING_NUMBER}',
  'Other': '#'
};

// Matching the specific numbers from the user's screenshot
const VIAGRA_PACKAGES: ProductPackage[] = [
  // 50mg
  { id: 'v50_30', dosage: '50 MG', quantity: 30, pricePerPill: 2.00, totalPrice: 60.00 },
  { id: 'v50_60', dosage: '50 MG', quantity: 60, pricePerPill: 1.75, totalPrice: 105.00, savings: 15.00 },
  { id: 'v50_90', dosage: '50 MG', quantity: 90, pricePerPill: 1.50, totalPrice: 135.00, savings: 45.00 },
  // 100mg (Matching Screenshot Exact Values)
  { id: 'v100_30', dosage: '100 MG', quantity: 30, pricePerPill: 2.00, totalPrice: 60.00 },
  { id: 'v100_60', dosage: '100 MG', quantity: 60, pricePerPill: 1.50, totalPrice: 150.00, savings: 30.00 },
  { id: 'v100_90', dosage: '100 MG', quantity: 90, pricePerPill: 1.20, totalPrice: 298.00, savings: 60.00 },
  // 200mg
  { id: 'v200_30', dosage: '200 MG', quantity: 30, pricePerPill: 2.50, totalPrice: 75.00 },
  { id: 'v200_60', dosage: '200 MG', quantity: 60, pricePerPill: 2.00, totalPrice: 120.00, savings: 30.00 },
];

const BASE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Viagra',
    activeIngredient: 'Sildenafil',
    price: 0.24, // Display price "from"
    image: 'https://picsum.photos/id/119/400/400', 
    categoryIds: ['cat_ed', 'cat_bestsellers'], // Example of multiple categories
    isPopular: true,
    otherNames: ['SILDENAFILA', 'SILDENAFILUM', 'INTAGRA', 'SILDENAFILO', 'FILDENA', 'VEEGA'],
    description: 'Viagra - Active ingredient - Sildenafil, 100 mg. Effect of "Viagra" is based on significant increase of blood stream to penis. Begins to work in 30 minutes, the effect lasts for 4-5 hours. Most of men can take this generic viagra every day. Millions of men worldwide cannot be mistaken, choosing Viagra!',
    packages: VIAGRA_PACKAGES,
    deliveryOptions: STANDARD_DELIVERY
  },
  {
    id: 'p2',
    name: 'Cialis',
    activeIngredient: 'Tadalafil',
    price: 0.59,
    image: 'https://picsum.photos/id/200/400/400',
    categoryIds: ['cat_ed', 'cat_bestsellers'],
    isPopular: true,
    otherNames: ['TADALAFILO', 'TADALAFILUM', 'CIALIS', 'APCALIS'],
    packages: [],
    deliveryOptions: STANDARD_DELIVERY
  },
  {
    id: 'p3',
    name: 'Levitra',
    activeIngredient: 'Vardenafil',
    price: 1.20,
    image: 'https://picsum.photos/id/223/400/400',
    categoryIds: ['cat_ed'],
    otherNames: ['VARDENAFILUM', 'VIVANZA'],
    packages: [],
    deliveryOptions: STANDARD_DELIVERY
  },
  {
    id: 'p4',
    name: 'Amoxil',
    activeIngredient: 'Amoxicillin',
    price: 0.40,
    image: 'https://picsum.photos/id/234/400/400',
    categoryIds: ['cat_antibiotics'],
    otherNames: ['AMOXICILLINUM', 'MOXATAG', 'DISPERMOX'],
    packages: [],
    deliveryOptions: STANDARD_DELIVERY
  },
  {
    id: 'p5',
    name: 'Zithromax',
    activeIngredient: 'Azithromycin',
    price: 1.40,
    image: 'https://picsum.photos/id/245/400/400',
    categoryIds: ['cat_antibiotics'],
    packages: [],
    deliveryOptions: STANDARD_DELIVERY
  },
  {
    id: 'p6',
    name: 'Propecia',
    activeIngredient: 'Finasteride',
    price: 0.60,
    image: 'https://picsum.photos/id/256/400/400',
    categoryIds: ['cat_hairloss'],
    packages: [],
    deliveryOptions: STANDARD_DELIVERY
  }
];

// Generate extra products for pagination demo (filling up to 20 items)
export const INITIAL_PRODUCTS: Product[] = [
  ...BASE_PRODUCTS,
  // Add clones with different IDs to demonstrate pagination
  ...Array.from({ length: 14 }).map((_, i) => ({
    ...BASE_PRODUCTS[i % BASE_PRODUCTS.length],
    id: `extra_${i}`,
    name: `${BASE_PRODUCTS[i % BASE_PRODUCTS.length].name} (Generic ${i+1})`,
    price: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
    // Preserve categoryIds from base product
    categoryIds: BASE_PRODUCTS[i % BASE_PRODUCTS.length].categoryIds,
    isPopular: i % 3 === 0, // Make some popular for home page
  }))
];
