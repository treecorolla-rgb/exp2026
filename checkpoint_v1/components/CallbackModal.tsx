import React, { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useToast } from './Toast';

export const CallbackModal: React.FC = () => {
  const { isCallbackModalOpen, toggleCallbackModal, adminProfile } = useStore();
  const { showToast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [countryFlag, setCountryFlag] = useState('us');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch User's Country based on IP
  useEffect(() => {
    if (isCallbackModalOpen) {
      // Reset state on open
      setIsSuccess(false);
      setPhoneNumber('');

      // Using ipwho.is as it is often more reliable for client-side requests without an API key
      fetch('https://ipwho.is/')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCountryCode(`+${data.calling_code}`);
            setCountryFlag(data.country_code.toLowerCase());
          } else {
            console.debug("IP lookup unsuccessful:", data.message);
            // Default to US if logic fails
            setCountryCode('+1');
            setCountryFlag('us');
          }
        })
        .catch(err => {
          console.debug("Could not fetch location, defaulting to US", err);
          // Default to US if network fails
          setCountryCode('+1');
          setCountryFlag('us');
        });
    }
  }, [isCallbackModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setIsSubmitting(true);

    const fullMessage = `📞 *New Callback Request*\n\nPhone: ${countryCode} ${phoneNumber}\nTime: ${new Date().toLocaleString()}`;

    try {
      // Send to Telegram using dynamic credentials from Admin Profile
      const token = adminProfile.telegramBotToken;
      const chatId = adminProfile.telegramChatId;

      if (token && chatId && adminProfile.receiveTelegramNotifications) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: fullMessage,
            parse_mode: 'Markdown'
          }),
        });
      } else {
        console.log("Telegram Token not configured or notifications disabled. Simulation mode:", fullMessage);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setIsSuccess(true);
    } catch (error) {
      console.error("Error sending telegram message", error);
      showToast("Something went wrong. Please try again.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCallbackModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={toggleCallbackModal}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[95%] md:max-w-[550px] bg-white rounded-[30px] md:rounded-[40px] overflow-hidden shadow-2xl transform transition-all scale-100 min-h-[300px] md:min-h-0">

        {/* Close Button */}
        <button
          onClick={toggleCallbackModal}
          className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full p-1 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Background Image Area */}
        <div className="h-[300px] md:h-[320px] relative">
          <img
            src="https://img.freepik.com/free-photo/customer-service-agent-working_23-2147947294.jpg?w=1060"
            alt="Customer Support"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">

            {isSuccess ? (
              <div className="bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-2xl text-center shadow-xl animate-in fade-in zoom-in duration-300 w-full max-w-sm">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="text-green-500 w-14 h-14 md:w-16 md:h-16" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Thanks!</h3>
                <p className="text-slate-600 font-medium text-sm md:text-base">
                  Our customer care will call you in a few minutes.
                </p>
                <button
                  onClick={toggleCallbackModal}
                  className="mt-6 text-sm text-slate-400 hover:text-slate-600 underline"
                >
                  Close window
                </button>
              </div>
            ) : (
              /* Input Pill Container */
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-black/75 backdrop-blur-sm p-2 rounded-full flex items-center shadow-2xl border border-white/10 mt-16 md:mt-20"
              >
                {/* Country Code Section */}
                <div className="flex items-center gap-2 pl-3 md:pl-4 pr-2 md:pr-3 border-r border-white/20">
                  <img
                    src={`https://flagcdn.com/w40/${countryFlag}.png`}
                    alt="Flag"
                    className="w-5 h-3.5 md:w-6 md:h-4 object-cover rounded-[2px]"
                  />
                  <span className="text-white font-medium text-base md:text-lg whitespace-nowrap">{countryCode}</span>
                </div>

                {/* Phone Input */}
                <input
                  type="tel"
                  autoFocus
                  required
                  placeholder="7865942567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} // Only numbers
                  className="flex-1 bg-transparent border-none outline-none text-white text-base md:text-lg px-2 md:px-4 placeholder-white/40 font-medium w-full min-w-[50px]"
                />

                {/* Call Me Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#00bfff] hover:bg-[#0099cc] text-white px-5 md:px-8 py-2 md:py-3 rounded-full font-bold text-sm md:text-lg whitespace-nowrap transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,191,255,0.5)]"
                >
                  {isSubmitting ? '...' : 'Call me'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};