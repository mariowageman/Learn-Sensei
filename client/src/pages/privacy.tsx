import { Footer } from "@/components/footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-4xl mx-auto py-12 px-4">
        <article className="prose dark:prose-invert max-w-none">
          <h1>Privacy Policy</h1>
          <p className="lead">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section>
            <h2>Introduction</h2>
            <p>
              At Learn Sensei, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our website and services.
            </p>
          </section>

          <section>
            <h2>Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>
              We may collect personal information that you voluntarily provide, including but not limited to:
            </p>
            <ul>
              <li>Name and email address</li>
              <li>Account credentials</li>
              <li>Profile information</li>
              <li>Learning preferences and history</li>
            </ul>

            <h3>Usage Information</h3>
            <p>
              We automatically collect certain information when you visit, use, or navigate our platform:
            </p>
            <ul>
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Usage patterns and preferences</li>
              <li>Learning progress and interaction data</li>
            </ul>
          </section>

          <section>
            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and maintain our services</li>
              <li>Personalize your learning experience</li>
              <li>Improve our AI recommendations</li>
              <li>Communicate with you about our services</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2>Information Sharing</h2>
            <p>
              We may share your information with:
            </p>
            <ul>
              <li>Service providers and business partners</li>
              <li>Analytics providers</li>
              <li>Law enforcement when required by law</li>
            </ul>
            <p>
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2>Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information.
              However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2>Your Privacy Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            <ul>
              <li>Right to access your personal data</li>
              <li>Right to correct inaccurate data</li>
              <li>Right to request deletion of your data</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
            </ul>
          </section>

          <section>
            <h2>Children's Privacy</h2>
            <p>
              Our services are not intended for children under 13. We do not knowingly collect personal information
              from children under 13.
            </p>
          </section>

          <section>
            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the
              new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2>Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:{" "}
              <a href="mailto:support@learnsensei.com">support@learnsensei.com</a>
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
