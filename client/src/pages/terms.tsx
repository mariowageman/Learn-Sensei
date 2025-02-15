import { Footer } from "@/components/footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-4xl mx-auto py-12 px-4">
        <article className="prose dark:prose-invert max-w-none">
          <h1>Terms of Service</h1>
          <p className="lead">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section>
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing and using Learn Sensei ("we," "our," or "us"), you agree to be bound by these Terms of Service
              and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited
              from using or accessing this website.
            </p>
          </section>

          <section>
            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily access the materials (information or software) on Learn Sensei's website
              for personal, non-commercial viewing only.
            </p>
            <p>This license shall automatically terminate if you violate any of these restrictions and may be terminated by
              Learn Sensei at any time.</p>
          </section>

          <section>
            <h2>3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide accurate, complete, and current information. You are
              responsible for safeguarding the password and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2>4. Educational Content</h2>
            <p>
              Our platform provides access to educational content from various sources. While we strive to ensure the
              quality and accuracy of this content, we make no warranties about its completeness or reliability.
            </p>
          </section>

          <section>
            <h2>5. AI-Powered Features</h2>
            <p>
              Our AI-powered features are designed to enhance your learning experience. These features are provided "as is,"
              and we do not guarantee their accuracy or availability at all times.
            </p>
          </section>

          <section>
            <h2>6. Intellectual Property</h2>
            <p>
              The content, features, and functionality of Learn Sensei are owned by us and are protected by international
              copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2>7. User Content</h2>
            <p>
              By posting content on our platform, you grant us a non-exclusive, worldwide, royalty-free license to use,
              modify, publicly display, reproduce, and distribute such content on our platform.
            </p>
          </section>

          <section>
            <h2>8. Termination</h2>
            <p>
              We may terminate or suspend your account and access to our services immediately, without prior notice or
              liability, for any reason, including but not limited to a breach of these Terms.
            </p>
          </section>

          <section>
            <h2>9. Limitation of Liability</h2>
            <p>
              In no event shall Learn Sensei, its directors, employees, partners, agents, suppliers, or affiliates be
              liable for any indirect, incidental, special, consequential, or punitive damages.
            </p>
          </section>

          <section>
            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. Changes will be effective immediately upon
              posting to the website. Your continued use of the platform following any changes indicates your acceptance of
              such changes.
            </p>
          </section>

          <section>
            <h2>Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:{" "}
              <a href="mailto:support@learnsensei.com">support@learnsensei.com</a>
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
