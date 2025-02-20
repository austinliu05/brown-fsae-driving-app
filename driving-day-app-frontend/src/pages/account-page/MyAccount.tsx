import { useState, useEffect } from 'react';
import {  signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { auth } from '../../api/firebaseConfig';

function MyAccount() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
        setUser(user); 
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('Login successful');
      setUser(result.user);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error('Login failed:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="page-content-main">
      <div className="flex justify-center py-16">
        <h1>My Account</h1>
      </div>
      <div className='text-center'>
        {!isLoggedIn ? (
          <>
            <h1 className="mb-4">Login</h1>
            <button
              onClick={handleGoogleLogin}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow hover:bg-gray-50 flex items-center justify-center gap-2 mx-auto"
            >
              <img 
                src="https://www.google.com/favicon.ico" 
                alt="Google" 
                className="w-5 h-5" 
              />
              Sign in with Google
            </button>
          </>
        ) : (
          <div>
            <h2>Welcome!</h2>
            <p>{user?.displayName || user?.email}</p>
            {user?.photoURL && (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-10 h-10 rounded-full mx-auto my-2"
                referrerPolicy="no-referrer"
              />
            )}
            <button
              onClick={handleLogout}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyAccount;


