import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Formly",
};

const lastUpdated = "June 8, 2026";
const legalProseClass =
  "space-y-5 text-sm leading-7 text-slate-700 dark:text-gray-300 [&_a]:font-medium [&_a]:text-slate-950 [&_a]:underline [&_a]:decoration-slate-300 [&_a]:underline-offset-4 hover:[&_a]:decoration-slate-950 dark:[&_a]:text-gray-100 dark:[&_a]:decoration-gray-600 dark:hover:[&_a]:decoration-gray-100 [&_h1]:font-display [&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-slate-950 dark:[&_h1]:text-gray-100 [&_h2]:pt-6 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-slate-950 dark:[&_h2]:text-gray-100 [&_li]:pl-1 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1";

export default function TermsPage() {
  return (
    <article className={legalProseClass}>
      <h1>Terms of Service</h1>
      <p className="text-sm text-slate-500 dark:text-gray-400">
        Last updated: {lastUpdated}
      </p>

      <p>
        By using Formly at formly-workspace.vercel.app, you agree to these
        terms. If you do not agree, do not use Formly.
      </p>

      <h2>What Formly is</h2>
      <p>
        Formly is a multi-tenant form builder that allows users to create forms,
        collect responses, and view analytics. It is a portfolio project
        operated by an independent developer and is provided free of charge.
      </p>

      <h2>Acceptable use</h2>
      <p>You may use Formly to:</p>
      <ul>
        <li>Create forms for legitimate personal, educational, or business purposes</li>
        <li>Collect responses from people who have consented to respond</li>
        <li>Share form links publicly or privately</li>
      </ul>
      <p>You may not use Formly to:</p>
      <ul>
        <li>Collect data from people without their knowledge or consent</li>
        <li>Create forms designed to phish, deceive, or defraud respondents</li>
        <li>
          Collect sensitive personal data, including passwords, financial
          details, or government IDs, without appropriate safeguards
        </li>
        <li>Send spam or unsolicited messages using the invite feature</li>
        <li>Attempt to gain unauthorized access to other users&apos; data</li>
        <li>Use Formly for any illegal purpose</li>
      </ul>

      <h2>Your data and content</h2>
      <p>
        You own the content you create on Formly, including your forms and
        responses. By using Formly, you grant us permission to store and display
        your content as necessary to provide the service.
      </p>
      <p>
        You are responsible for ensuring that your use of Formly, including the
        data you collect from respondents, complies with applicable law,
        including data protection laws in your jurisdiction.
      </p>

      <h2>Service availability</h2>
      <p>
        Formly is provided as-is, free of charge, as a portfolio project. We
        make no guarantees about uptime, data durability, or continued
        availability of the service. Back up any important data using the CSV
        export feature.
      </p>

      <h2>Termination</h2>
      <p>
        We reserve the right to suspend or terminate access to Formly for
        violations of these terms, without notice.
      </p>
      <p>You may delete your account at any time from Settings &rarr; Account.</p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Formly and its operator are not
        liable for any indirect, incidental, or consequential damages arising
        from your use of the service.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms occasionally. The last updated date reflects
        the most recent changes. Continued use after changes constitutes
        acceptance.
      </p>

      <h2>Contact</h2>
      <p>
        <a href="hermescollective@googlegroups.com">
          hermescollective@googlegroups.com
        </a>
      </p>
    </article>
  );
}
