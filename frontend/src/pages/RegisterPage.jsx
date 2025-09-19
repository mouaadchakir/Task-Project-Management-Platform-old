import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const { register, errors, setErrors } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear errors when the component unmounts
    return () => {
      if (errors) {
        setErrors(null);
      }
    };
  }, [errors, setErrors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, passwordConfirmation);
      navigate('/'); // Navigate to dashboard on successful registration
    } catch (error) {
      // Errors are set in the AuthContext, so we don't need to do anything here
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Create a new account</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors?.name ? 'border-red-500' : 'border-gray-300'}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors?.name && <p className="mt-2 text-sm text-red-600">{errors.name[0]}</p>}
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors?.email ? 'border-red-500' : 'border-gray-300'}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors?.email && <p className="mt-2 text-sm text-red-600">{errors.email[0]}</p>}
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors?.password ? 'border-red-500' : 'border-gray-300'}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors?.password && <p className="mt-2 text-sm text-red-600">{errors.password[0]}</p>}
          </div>

          <div>
            <label htmlFor="password-confirmation" className="text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="password-confirmation"
              name="password_confirmation"
              type="password"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign up
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
