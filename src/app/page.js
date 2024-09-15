import styles from './page.module.css'
import Link from 'next/link'

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <nav>
          <div className={styles.logo}>CookBuddy AI</div>
          <ul>
            <li><Link href="#features">Features</Link></li>
            <li><Link href="#recipes">Recipes</Link></li>
            <li><Link href="#meal-planning">Meal Planning</Link></li>
            <li><Link href="#tips">Cooking Tips</Link></li>
          </ul>
          <div className={styles.ctaButtons}>
            <Link href="/signin" className={`${styles.btn} ${styles.btnSecondary}`}>Sign in</Link>
            <Link href="/register" className={`${styles.btn} ${styles.btnPrimary}`}>Get started</Link>
          </div>
        </nav>
      </header>

      <section className={styles.hero}>
        <h1>Your Personal AI Cooking Assistant</h1>
        <p>Discover recipes, plan meals, and get cooking tips tailored to your preferences and dietary needs. Let AI transform your culinary experience!</p>
        <Link href="#start-cooking" className={`${styles.btn} ${styles.btnCta}`}>Start cooking with AI in 2 minutes</Link>
        <p className={styles.trustIndicator}>Trusted by 100,000+ home cooks and chefs. 10,000+ 5-star ratings.</p>
      </section>

      <section id="features" className={styles.features}>
        <h2>What CookBuddy AI Can Do For You</h2>
        <ul>
          <li>Personalized recipe recommendations</li>
          <li>Smart meal planning based on your dietary preferences</li>
          <li>Real-time cooking assistance and tips</li>
          <li>Ingredient substitution suggestions</li>
          <li>Nutritional information and calorie tracking</li>
        </ul>
      </section>

      <section id="testimonials" className={styles.testimonials}>
        <h2>What Our Users Say</h2>
        {/* Add testimonials here */}
      </section>
    </main>
  )
}