import React, { useState } from "react";
import { motion } from "framer-motion";

const sections = {
  terms: {
    title: "Terms of Service",
    lastUpdated: "April 4, 2026",
    content: [
      {
        heading: "1. Acceptance of Terms",
        body: `By accessing or using The Condition of Man ("the Site"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Site.`,
      },
      {
        heading: "2. Use of the Site",
        body: `You agree to use the Site only for lawful purposes and in a manner that respects the rights of others. You may not post content that is defamatory, harassing, obscene, hateful, or otherwise objectionable. The Condition of Man reserves the right to remove any content that violates these terms.`,
      },
      {
        heading: "3. User Accounts",
        body: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use.`,
      },
      {
        heading: "4. Community Standards",
        body: `This is a faith-based community. Members are expected to engage with respect, grace, and integrity. Content that contradicts these values — including profanity, hate speech, or harassment — may be removed and may result in account suspension.`,
      },
      {
        heading: "5. Intellectual Property",
        body: `All original content on this Site, including text, images, and design, is the property of The Condition of Man or its contributors. Users retain ownership of the content they post but grant the Site a non-exclusive license to display and distribute that content.`,
      },
      {
        heading: "6. Donations",
        body: `Donations made through this Site are voluntary and non-refundable unless required by law. We are not a registered 501(c)(3) organization unless explicitly stated. Please consult a tax advisor regarding deductibility.`,
      },
      {
        heading: "7. Disclaimers",
        body: `The Site is provided "as is" without warranties of any kind. We do not guarantee uninterrupted access or that information on the Site is always accurate, complete, or current.`,
      },
      {
        heading: "8. Limitation of Liability",
        body: `To the fullest extent permitted by law, The Condition of Man shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the Site.`,
      },
      {
        heading: "9. Changes to Terms",
        body: `We may update these Terms from time to time. Continued use of the Site after changes constitutes acceptance of the revised Terms.`,
      },
      {
        heading: "10. Contact",
        body: `For questions about these Terms, please reach out to us through the community forums or the contact information provided on the Site.`,
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "April 4, 2026",
    content: [
      {
        heading: "1. Information We Collect",
        body: `We collect information you provide directly (such as your name, email address, profile details, and posts), as well as usage data automatically collected when you visit the Site (such as IP address, browser type, and pages visited).`,
      },
      {
        heading: "2. How We Use Your Information",
        body: `We use your information to operate the Site, personalize your experience, send notifications, facilitate community interactions, and process donations. We do not sell your personal information to third parties.`,
      },
      {
        heading: "3. Community Content",
        body: `Content you post in the community feed or forums (including your display name and avatar) is visible to other users of the Site. Please do not share personally sensitive information in public posts.`,
      },
      {
        heading: "4. Direct Messages",
        body: `Direct messages between users are stored on our servers to facilitate the messaging feature. While we do not routinely read private messages, we may review them in response to reported violations of our community standards.`,
      },
      {
        heading: "5. Cookies & Tracking",
        body: `We use cookies and similar technologies to maintain your session, remember preferences, and analyze Site traffic. You may disable cookies in your browser settings, though some features may not function properly as a result.`,
      },
      {
        heading: "6. Third-Party Services",
        body: `We use third-party services including Stripe for payment processing and analytics providers. These services have their own privacy policies and may collect data independently. We encourage you to review their policies.`,
      },
      {
        heading: "7. Data Retention",
        body: `We retain your data as long as your account is active or as needed to provide services. You may request deletion of your account and associated data by contacting us.`,
      },
      {
        heading: "8. Security",
        body: `We take reasonable technical and organizational measures to protect your data. However, no method of transmission over the Internet is 100% secure.`,
      },
      {
        heading: "9. Children's Privacy",
        body: `This Site is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us.`,
      },
      {
        heading: "10. Your Rights",
        body: `Depending on your location, you may have rights to access, correct, or delete your personal data. Contact us to exercise these rights.`,
      },
      {
        heading: "11. Changes to This Policy",
        body: `We may update this Privacy Policy periodically. We will notify users of material changes by posting a notice on the Site.`,
      },
    ],
  },
  compliance: {
    title: "Legal & Compliance",
    lastUpdated: "April 4, 2026",
    content: [
      {
        heading: "Community Guidelines",
        body: `The Condition of Man is a faith-driven platform committed to respectful, Christ-centered discourse. All users are expected to treat one another with dignity. Violations — including harassment, hate speech, or explicit content — will result in content removal and may result in account termination.`,
      },
      {
        heading: "Content Moderation",
        body: `We employ automated profanity filtering and human moderation to maintain community standards. Users may report content that violates our guidelines using the reporting tools available on the platform.`,
      },
      {
        heading: "Copyright & DMCA",
        body: `We respect intellectual property rights. If you believe content on the Site infringes your copyright, please contact us with the details of the alleged infringement. We will respond in accordance with applicable law.`,
      },
      {
        heading: "Governing Law",
        body: `These terms are governed by and construed in accordance with the laws of the United States. Any disputes arising from use of the Site shall be resolved in the applicable courts of the United States.`,
      },
      {
        heading: "Accessibility",
        body: `We strive to make the Site accessible to all users. If you encounter accessibility barriers, please contact us so we can work to address them.`,
      },
      {
        heading: "Non-Discrimination",
        body: `The Condition of Man does not discriminate on the basis of race, color, national origin, sex, disability, age, or any other characteristic protected by law.`,
      },
      {
        heading: "Contact & Notices",
        body: `For legal notices, compliance inquiries, or to report violations, please contact us through the community forums or via the contact methods listed on the Site.`,
      },
    ],
  },
};

export default function Legal() {
  const params = new URLSearchParams(window.location.search);
  const defaultTab = params.get("tab") || "terms";
  const [activeTab, setActiveTab] = useState(defaultTab);

  const current = sections[activeTab];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-primary text-primary-foreground py-14 px-4 text-center">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Legal & Privacy</h1>
        <p className="font-body text-primary-foreground/70 text-sm max-w-xl mx-auto">
          Transparency and trust are at the heart of our community.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 flex gap-0">
          {Object.entries(sections).map(([key, { title }]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-4 font-body text-sm font-semibold border-b-2 transition-colors ${
                activeTab === key
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {title}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-1">{current.title}</h2>
            <p className="font-body text-xs text-muted-foreground">Last updated: {current.lastUpdated}</p>
          </div>

          <div className="space-y-8">
            {current.content.map((section) => (
              <div key={section.heading}>
                <h3 className="font-body font-semibold text-foreground mb-2">{section.heading}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}