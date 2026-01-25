import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { User, Lock, X } from 'lucide-react';

export const CustomerAuth: React.FC = () => {
  const { customerLogin, customerSignup, customerUser, isCustomerAuthenticated, customerLogout, goHome } = useStore();
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Login Form
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Signup Form
  const [signupData, setSignupData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', 
    address: '', city: '', state: '', zip: '', country: 'USA'
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerLogin(loginId, loginPass)) {
      setLoginError('Invalid credentials. (Try 123456)');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    customerSignup(signupData);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative">
       {/* Close Button */}
       <button 
         onClick={goHome}
         className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition"
       >
         <X size={28} />
       </button>

      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md relative">
        
        {isCustomerAuthenticated && customerUser ? (
            <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={40} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome, {customerUser.firstName}!</h2>
                <p className="text-slate-500 mb-6">You are currently logged in.</p>
                <div className="space-y-3">
                  <button onClick={goHome} className="w-full bg-primary text-white py-3 rounded font-bold">Go to Store</button>
                  <button onClick={customerLogout} className="w-full border border-slate-300 text-slate-600 py-3 rounded font-medium hover:bg-slate-50">Log Out</button>
                </div>
            </div>
        ) : (
          <>
            {view === 'login' && (
              <>
                <div className="text-center">
                  <h2 className="text-3xl font-extrabold text-slate-900">Sign in to your account</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Or <button onClick={() => setView('signup')} className="font-medium text-primary hover:text-blue-500">create a new account</button>
                  </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                  <div className="rounded-md shadow-sm -space-y-px">
                    <div className="relative mb-4">
                      <User className="absolute top-3 left-3 text-slate-400" size={18} />
                      <input
                        type="text"
                        required
                        className="appearance-none rounded block w-full px-10 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Email or Phone"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute top-3 left-3 text-slate-400" size={18} />
                      <input
                        type="password"
                        required
                        className="appearance-none rounded block w-full px-10 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Password"
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                      />
                    </div>
                  </div>

                  {loginError && <div className="text-red-500 text-sm text-center">{loginError}</div>}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input id="remember-me" type="checkbox" className="h-4 w-4 text-primary border-slate-300 rounded" />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">Remember me</label>
                    </div>
                    <div className="text-sm">
                        <button type="button" onClick={() => setView('forgot')} className="font-medium text-primary hover:text-blue-500">Forgot password?</button>
                    </div>
                  </div>

                  <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    Sign in
                  </button>
                </form>
              </>
            )}

            {view === 'signup' && (
              <>
                <div className="text-center">
                  <h2 className="text-3xl font-extrabold text-slate-900">Create Account</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Already have an account? <button onClick={() => setView('login')} className="font-medium text-primary hover:text-blue-500">Sign in</button>
                  </p>
                </div>
                <form className="mt-8 space-y-4" onSubmit={handleSignup}>
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="First Name" required className="border p-2 rounded" onChange={e => setSignupData({...signupData, firstName: e.target.value})} />
                    <input placeholder="Last Name" required className="border p-2 rounded" onChange={e => setSignupData({...signupData, lastName: e.target.value})} />
                  </div>
                  <input type="email" placeholder="Email" required className="w-full border p-2 rounded" onChange={e => setSignupData({...signupData, email: e.target.value})} />
                  <input type="tel" placeholder="Phone" required className="w-full border p-2 rounded" onChange={e => setSignupData({...signupData, phone: e.target.value})} />
                  <input type="password" placeholder="Create Password" required className="w-full border p-2 rounded" onChange={e => setSignupData({...signupData, password: e.target.value})} />
                  
                  <div className="border-t pt-4 mt-4">
                      <p className="text-xs text-slate-400 mb-2 uppercase font-bold">Address Details (Optional)</p>
                      <input placeholder="Address" className="w-full border p-2 rounded mb-2" onChange={e => setSignupData({...signupData, address: e.target.value})} />
                      <div className="grid grid-cols-2 gap-4">
                        <input placeholder="City" className="border p-2 rounded" onChange={e => setSignupData({...signupData, city: e.target.value})} />
                        <input placeholder="Zip Code" className="border p-2 rounded" onChange={e => setSignupData({...signupData, zip: e.target.value})} />
                      </div>
                  </div>

                  <button type="submit" className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                    Create Account
                  </button>
                </form>
              </>
            )}

            {view === 'forgot' && (
                <>
                <div className="text-center">
                  <h2 className="text-2xl font-extrabold text-slate-900">Reset Password</h2>
                  <p className="mt-2 text-sm text-slate-600">Enter your email or phone to receive an OTP.</p>
                </div>
                <form className="mt-8 space-y-6">
                    <input type="text" placeholder="Email or Phone" className="w-full border p-3 rounded" />
                    <button type="button" className="w-full bg-slate-800 text-white py-3 rounded font-bold" onClick={() => alert("OTP Sent to your device!")}>Send OTP</button>
                    <button type="button" onClick={() => setView('login')} className="w-full text-slate-500 text-sm">Back to Login</button>
                </form>
                </>
            )}
          </>
        )}
      </div>
    </div>
  );
};