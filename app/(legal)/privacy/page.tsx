import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Formly",
};

const lastUpdated = "June 8, 2026";
const legalProseClass =
  "space-y-5 text-sm leading-7 text-slate-700 dark:text-gray-300 [&_a]:font-medium [&_a]:text-slate-950 [&_a]:underline [&_a]:decoration-slate-300 [&_a]:underline-offset-4 hover:[&_a]:decoration-slate-950 dark:[&_a]:text-gray-100 dark:[&_a]:decoration-gray-600 dark:hover:[&_a]:decoration-gray-100 [&_h1]:font-display [&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-slate-950 dark:[&_h1]:text-gray-100 [&_h2]:pt-6 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-slate-950 dark:[&_h2]:text-gray-100 [&_li]:pl-1 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1";

export default function PrivacyPage() {
  return (
    <article className={legalProseClass}>
      <h1>Privacy Policy</h1>
      <p className="text-sm text-slate-500 dark:text-gray-400">
        Last updated: {lastUpdated}
      </p>

      <p>
        Formly (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is operated
        by an independent developer. This policy explains what personal data we
        collect, why we collect it, and how it is handled when you use Formly
        at formly-workspace.vercel.app.
      </p>

      <h2>What data we collect</h2>
      <p>When you sign in with GitHub or Google, we receive and store:</p>
      <ul>
        <li>Your email address</li>
        <li>Your display name</li>
        <li>Your profile photo URL, if provided by your OAuth provider</li>
        <li>An OAuth account identifier from your provider</li>
      </ul>
      <p>
        This data is stored in a PostgreSQL database hosted on Neon (AWS Asia
        Pacific, Singapore).
      </p>
      <p>
        When you use Formly to collect form responses, the following is stored:
      </p>
      <ul>
        <li>Form structures you create, including titles, fields, and settings</li>
        <li>Responses submitted by your respondents, including text, files, and answers</li>
        <li>File uploads stored on Vercel Blob</li>
      </ul>
      <p>
        We do not collect payment information. We do not use advertising
        trackers. We do not sell your data to any third party.
      </p>

      <h2>Why we collect it</h2>
      <p>Your email and profile data are used solely for:</p>
      <ul>
        <li>Identifying your account and signing you in</li>
        <li>Sending workspace invite emails, if you use the invite feature</li>
      </ul>
      <p>
        We do not send marketing emails. We do not share your email with other
        users. It is never displayed in the product UI.
      </p>

      <h2>Who can see your data</h2>
      <ul>
        <li>You can see your own data in your account settings.</li>
        <li>
          The developer, as site operator, can access the database for
          maintenance and debugging purposes only.
        </li>
        <li>
          Vercel, our hosting provider, and Neon, our database provider, process
          data as part of infrastructure operation.
        </li>
        <li>No other third parties have access to your personal data.</li>
      </ul>

      <h2>Form respondents</h2>
      <p>
        If you use Formly to collect responses from other people, you are
        responsible for informing them about data collection and obtaining any
        consent required under applicable law. Formly is a tool &mdash; the data
        collected through your forms belongs to you.
      </p>

      <h2>Data retention</h2>
      <p>
        Your account data is retained until you delete your account. Form
        responses are retained until you delete the form or your account. You can
        delete your account at any time from Settings &rarr; Account.
      </p>

      <h2>Your rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you</li>
        <li>Request correction of inaccurate data</li>
        <li>Request deletion of your account and all associated data</li>
        <li>Export your form responses using CSV export in the dashboard</li>
      </ul>
      <p>
        To exercise any of these rights, use the account deletion feature in
        Settings, or contact us at the email below.
      </p>

      <h2>Cookies and sessions</h2>
      <p>
        Formly uses a single session cookie to keep you signed in. No
        advertising or tracking cookies are used.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy occasionally. The last updated date at the top
        of this page will reflect any changes. Continued use of Formly after
        changes constitutes acceptance of the updated policy.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy questions or data requests:{" "}
        <a href="mailto:gallendezmiguel@gmail.com">
          gallendezmiguel@gmail.com
        </a>
      </p>
    </article>
  );
}
