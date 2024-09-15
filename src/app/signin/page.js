'use client';

import styles from './page.module.css'
import Link from 'next/link'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log('Attempting to sign in with:', formData.email);
      console.log('Password length:', formData.password.length);
      console.log('First 3 characters of password:', formData.password.substring(0, 3));
      
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      console.log('Sign-in result:', result);

      if (result?.error) {
        console.error('Sign-in error:', result.error);
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(`Authentication failed: ${result.error}`);
        }
      } else if (result?.ok) {
        console.log('Sign-in successful, redirecting to dashboard...');
        router.push('/dashboard');
      } else {
        setError('An unexpected error occurred');
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      setError(`An error occurred during sign-in: ${error.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome Back</h1>
        {error && <p className={styles.error}>{error}</p>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className={styles.button}>Sign In</button>
        </form>
        <p className={styles.registerLink}>
          Don't have an account? <Link href="/register">Register here</Link>
        </p>
        <Link href="/" className={styles.backLink}>Back to Home</Link>
      </main>
    </div>
  )
}