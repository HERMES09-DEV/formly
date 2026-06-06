import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface FeedbackSubmissionSeed {
  daysAgo: number;
  hour: number;
  email: string;
  rating: string;
  comments?: string;
}

const feedbackSubmissions: FeedbackSubmissionSeed[] = [
  {
    daysAgo: 1,
    hour: 9,
    email: "maya.chen@example.com",
    rating: "5",
    comments: "Fast setup and a polished experience for our team.",
  },
  {
    daysAgo: 2,
    hour: 14,
    email: "owen.patel@example.com",
    rating: "4",
    comments: "The builder is simple and easy to hand off.",
  },
  {
    daysAgo: 4,
    hour: 11,
    email: "nina.garcia@example.com",
    rating: "5",
    comments: "Sharing forms with clients has been smooth.",
  },
  {
    daysAgo: 6,
    hour: 16,
    email: "eli.brooks@example.com",
    rating: "3",
    comments: "Would love more templates in the future.",
  },
  {
    daysAgo: 8,
    hour: 10,
    email: "ava.morgan@example.com",
    rating: "5",
  },
  {
    daysAgo: 10,
    hour: 13,
    email: "leo.wilson@example.com",
    rating: "4",
    comments: "CSV export saves us a lot of manual cleanup.",
  },
  {
    daysAgo: 12,
    hour: 15,
    email: "sofia.reed@example.com",
    rating: "5",
    comments: "Dark mode looks great during late review sessions.",
  },
  {
    daysAgo: 14,
    hour: 8,
    email: "ethan.kim@example.com",
    rating: "4",
  },
  {
    daysAgo: 16,
    hour: 12,
    email: "isla.turner@example.com",
    rating: "5",
    comments: "The response inbox is clear and quick to scan.",
  },
  {
    daysAgo: 18,
    hour: 17,
    email: "noah.king@example.com",
    rating: "2",
    comments: "The form loaded slowly on hotel Wi-Fi.",
  },
  {
    daysAgo: 20,
    hour: 10,
    email: "mia.carter@example.com",
    rating: "4",
    comments: "Nice balance of simple and useful.",
  },
  {
    daysAgo: 22,
    hour: 14,
    email: "lucas.scott@example.com",
    rating: "5",
  },
  {
    daysAgo: 24,
    hour: 11,
    email: "amelia.hall@example.com",
    rating: "3",
    comments: "A little more guidance on required fields would help.",
  },
  {
    daysAgo: 26,
    hour: 9,
    email: "henry.green@example.com",
    rating: "4",
    comments: "Analytics are easy for managers to understand.",
  },
  {
    daysAgo: 28,
    hour: 16,
    email: "zoe.adams@example.com",
    rating: "5",
    comments: "The public form feels trustworthy and clean.",
  },
];

function dateWithinLastThirtyDays(daysAgo: number, hour: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  return date;
}

async function main() {
  await prisma.org.deleteMany({
    where: {
      slug: "acme-corp",
    },
  });

  const user = await prisma.user.upsert({
    where: {
      email: "demo@formly.dev",
    },
    update: {
      name: "Demo User",
    },
    create: {
      email: "demo@formly.dev",
      name: "Demo User",
    },
  });

  const org = await prisma.org.create({
    data: {
      name: "Acme Corp",
      slug: "acme-corp",
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });

  const feedbackForm = await prisma.form.create({
    data: {
      orgId: org.id,
      title: "Customer Feedback",
      slug: "acme-customer-feedback",
      published: true,
      successMsg: "Thanks for your feedback!",
    },
  });

  const feedbackEmailField = await prisma.field.create({
    data: {
      formId: feedbackForm.id,
      type: "EMAIL",
      label: "Email",
      required: true,
      order: 0,
    },
  });

  const feedbackRatingField = await prisma.field.create({
    data: {
      formId: feedbackForm.id,
      type: "RATING",
      label: "How would you rate us?",
      required: true,
      order: 1,
    },
  });

  const feedbackCommentsField = await prisma.field.create({
    data: {
      formId: feedbackForm.id,
      type: "LONG_TEXT",
      label: "Any comments?",
      required: false,
      order: 2,
    },
  });

  await Promise.all(
    feedbackSubmissions.map((submission) =>
      prisma.submission.create({
        data: {
          formId: feedbackForm.id,
          createdAt: dateWithinLastThirtyDays(
            submission.daysAgo,
            submission.hour,
          ),
          answers: {
            create: [
              {
                fieldId: feedbackEmailField.id,
                value: submission.email,
              },
              {
                fieldId: feedbackRatingField.id,
                value: submission.rating,
              },
              ...(submission.comments
                ? [
                    {
                      fieldId: feedbackCommentsField.id,
                      value: submission.comments,
                    },
                  ]
                : []),
            ],
          },
        },
      }),
    ),
  );

  const jobApplicationForm = await prisma.form.create({
    data: {
      orgId: org.id,
      title: "Job Application",
      slug: "acme-job-application",
      published: false,
    },
  });

  await prisma.field.createMany({
    data: [
      {
        formId: jobApplicationForm.id,
        type: "TEXT",
        label: "Full name",
        required: true,
        order: 0,
      },
      {
        formId: jobApplicationForm.id,
        type: "EMAIL",
        label: "Email",
        required: true,
        order: 1,
      },
      {
        formId: jobApplicationForm.id,
        type: "DROPDOWN",
        label: "Which role?",
        required: true,
        options: ["Frontend", "Backend", "Design"],
        order: 2,
      },
      {
        formId: jobApplicationForm.id,
        type: "LONG_TEXT",
        label: "Cover letter",
        required: true,
        order: 3,
      },
    ],
  });
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Seed failed.";
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
