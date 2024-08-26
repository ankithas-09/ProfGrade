import Head from 'next/head';
import { useRouter } from 'next/router';
import { UserButton, useAuth } from '@clerk/nextjs';
import styles from '../styles/Home.module.css';

export default function Home() {
  const { userId } = useAuth();
  const router = useRouter();

  const handleSignup = (path) => {
    router.push(path);
  }

  const handleNavigation = (path) => {
    router.push(path);
  };

  const handleFindProf = () => {
    router.push('/findProf');
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>ProfGrade | Home</title>
        <meta name="description" content="Welcome to ProfGrade, your ultimate resource for professor evaluations." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <div className={styles.logo}>ProfGrade</div>
        <nav className={styles.navbar}>
          <ul className={styles.navLinks}>
            <li><button className={styles.navLink} onClick={() => handleNavigation('/')}>Home</button></li>
            <li><button className={styles.navLink} onClick={() => handleNavigation('/findProf')}>Find Professors</button></li>
            <li><button className={styles.navLink} onClick={() => handleNavigation('/contact')}>Contact Us</button></li>
          </ul>
        </nav>

        <div className={styles.authButtons}>
          {userId ? (
            <UserButton />
          ) : (
            <>
              <button className={styles.authButton} onClick={() => handleNavigation('/signin')}>Login</button>
              <button className={styles.authButton} onClick={() => handleSignup('/signup')}>Signup</button>
            </>
          )}
        </div>
      </header>

      <main className={styles.mainContent}>
        <section className={styles.aboutSection}>
          <p>
            Unlock insightful, data-driven evaluations of your professors with AI Professors Rating! Our advanced AI platform allows you to effortlessly upload any professor's page, providing you with detailed, unbiased information about their teaching style, effectiveness, and student feedback. Whether you're choosing your next course or just curious about a professor, our AI-driven analysis delivers all the key insights you need to make informed decisions. Explore the power of AI in academia and take control of your educational journey today!
          </p>
        </section>

        <section className={styles.ctaSection}>
          <button className={styles.ctaButton} onClick={handleFindProf}>
            Find Your Professor
          </button>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2024 ProfGrade. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
