import { Footer } from "@/components/footer";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-4xl mx-auto py-12 px-4">
        <article className="prose dark:prose-invert max-w-none">
          <h1>Cookie Policy</h1>
          <p className="lead">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section>
            <h2>Introduction</h2>
            <p>
              This Cookie Policy explains how Learn Sensei ("we", "us", or "our") uses cookies and similar technologies
              to recognize and track your usage when you visit our website. This policy explains what these technologies are
              and why we use them, as well as your rights to control our use of them.
            </p>
          </section>

          <section>
            <h2>What are cookies?</h2>
            <p>
              Cookies are small data files that are placed on your computer or mobile device when you visit a website.
              They are widely used by website owners to make their websites work more efficiently and provide reporting
              information.
            </p>
          </section>

          <section>
            <h2>Types of Cookies We Use</h2>
            
            <h3>Essential Cookies</h3>
            <p>
              These cookies are strictly necessary for the website to function properly. They enable core functionality
              such as security, network management, and accessibility. You may disable these by changing your browser
              settings, but this may affect how the website functions.
            </p>

            <h3>Analytics Cookies</h3>
            <p>
              These cookies allow us to count visits and traffic sources so we can measure and improve the performance
              of our site. They help us to know which pages are the most and least popular and see how visitors move
              around the site.
            </p>

            <h3>Marketing Cookies</h3>
            <p>
              These cookies track your browsing habits to enable us to show advertising which is more likely to be of
              interest to you. They are also used to limit the number of times you see an advertisement and help
              measure the effectiveness of advertising campaigns.
            </p>
          </section>

          <section>
            <h2>Third-Party Cookies</h2>
            <p>
              In some special cases, we also use cookies provided by trusted third parties:
            </p>
            <ul>
              <li>Google Analytics cookies help us understand how you use the site and ways to improve your experience.</li>
              <li>YouTube cookies may be set if you view video content on our site.</li>
              <li>Social media cookies enable you to share content directly on social media platforms.</li>
            </ul>
          </section>

          <section>
            <h2>Managing Your Cookie Preferences</h2>
            <p>
              You can modify your cookie preferences at any time by clicking on the "Cookie Preferences" button in the
              footer of our website. You may also refuse to accept cookies by activating the appropriate setting on your
              browser. However, if you select this setting you may be unable to access certain parts of our site.
            </p>
          </section>

          <section>
            <h2>Your Rights Under GDPR and CCPA</h2>
            <p>
              Depending on where you live, you may have certain rights regarding your personal information, including:
            </p>
            <ul>
              <li>The right to access your personal information</li>
              <li>The right to delete your personal information</li>
              <li>The right to object to the processing of your personal information</li>
              <li>The right to withdraw consent</li>
            </ul>
          </section>

          <section>
            <h2>Contact Us</h2>
            <p>
              If you have any questions about our use of cookies or this Cookie Policy, please contact us at:{" "}
              <a href="mailto:privacy@learnsensei.com">privacy@learnsensei.com</a>
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
