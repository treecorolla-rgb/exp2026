import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Are your medications genuine?",
    answer: "Yes, all our medications are 100% genuine and sourced from certified pharmaceutical manufacturers. We only work with licensed suppliers and each product goes through quality verification before being shipped to our customers."
  },
  {
    question: "How do I place an order?",
    answer: "Simply browse our products, select the dosage and quantity you need, add items to your cart, and proceed to checkout. Fill in your shipping details and complete the payment. You'll receive an order confirmation via email."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept major credit cards (Visa, MasterCard, American Express), as well as various other payment methods. All transactions are secured with SSL encryption for your safety."
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping typically takes 14-28 days, while Express shipping takes 5-9 days. Delivery times may vary depending on your location and customs processing in your country."
  },
  {
    question: "Is my personal information secure?",
    answer: "Absolutely. We use industry-standard SSL encryption to protect all your personal and payment information. We never share your data with third parties and maintain strict privacy policies."
  },
  {
    question: "Do I need a prescription?",
    answer: "Requirements vary by medication and jurisdiction. Some products may require a valid prescription. Please check the specific product page for details or contact our customer support for guidance."
  },
  {
    question: "What is your return policy?",
    answer: "If you receive damaged or incorrect items, please contact us within 14 days of delivery. We will arrange for a replacement or refund. Due to the nature of pharmaceutical products, unopened items in original packaging may be eligible for return."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order is shipped, you'll receive a tracking number via email. You can use this number to track your package on our website or directly on the courier's website."
  },
  {
    question: "Do you offer discounts for bulk orders?",
    answer: "Yes! We offer tiered pricing where larger quantities come with better per-unit prices. Additionally, orders over $200 qualify for FREE shipping. Check our product pages for quantity-based savings."
  },
  {
    question: "What if my package is lost or seized by customs?",
    answer: "We take full responsibility for delivery. If your package is lost in transit or seized by customs, we will reship your order at no additional cost or provide a full refund. Please contact our support team if this occurs."
  },
  {
    question: "Can I modify or cancel my order?",
    answer: "You can modify or cancel your order within 24 hours of placing it by contacting our customer support. Once the order has been shipped, modifications are no longer possible."
  },
  {
    question: "How do I contact customer support?",
    answer: "You can reach us via email, WhatsApp, or Telegram. Our support team is available 24/7 to assist you with any questions or concerns. Check our Contact page or the footer for contact details."
  }
];

export const FAQ: React.FC = () => {
  const { goHome } = useStore();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex-1 bg-white font-sans">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <HelpCircle size={32} className="text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Find answers to common questions about our products, shipping, payments, and more.
          </p>
        </div>

        <div className="space-y-3">
          {faqData.map((item, index) => (
            <div 
              key={index} 
              className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition"
              >
                <span className="font-bold text-slate-800 pr-4">{item.question}</span>
                {openIndex === index ? (
                  <ChevronUp size={20} className="text-primary shrink-0" />
                ) : (
                  <ChevronDown size={20} className="text-slate-400 shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5 pt-0 text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50">
                  <p className="pt-4">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-500 mb-4">Still have questions?</p>
          <button 
            onClick={goHome}
            className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold transition"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};
