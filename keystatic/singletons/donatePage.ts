import { fields, singleton } from "@keystatic/core";

export const donatePageSingleton = singleton({
  label: "Donate page",
  path: "content/donate-page/",
  schema: {
    headline: fields.text({
      label: "Headline",
      validation: { isRequired: true, length: { min: 1 } },
    }),
    intro: fields.text({
      label: "Intro",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    monthlySuggestion: fields.integer({
      label: "Monthly suggestion (USD)",
      description: 'e.g. 30 — used in CTAs like "$30/month sponsors one student".',
      validation: { min: 0 },
    }),
    suggestedAmounts: fields.text({
      label: "Suggested donation amounts (USD, comma-separated)",
      description:
        'e.g. "15, 30, 60, 120, 250". Shown as quick-pick buttons on the Stripe donate form.',
      defaultValue: "15, 30, 60, 120, 250",
    }),
    transactionSource: fields.select({
      label: "Transaction source",
      description:
        "How donations flow today. 'Stripe' = real Stripe Checkout (requires STRIPE_SECRET_KEY in Vercel env). 'Givebutter' = legacy embed (deprecated). 'Mailto' = email-only fallback. 'Placeholder' = setup pending.",
      options: [
        { label: "Stripe Checkout (recommended)", value: "stripe" },
        { label: "Givebutter (legacy embed)", value: "givebutter" },
        { label: "Mailto fallback", value: "mailto" },
        { label: "Placeholder (setup pending)", value: "placeholder" },
      ],
      defaultValue: "stripe",
    }),
    // Legacy Givebutter fields — kept so existing content doesn't break,
    // can be deleted via Keystatic admin once Stripe is the only path.
    givebutterAccountId: fields.text({
      label: "Givebutter account ID (legacy)",
      description: "Only used when transactionSource = 'givebutter'.",
    }),
    givebutterCampaignId: fields.text({
      label: "Givebutter campaign ID (legacy)",
      description: "Only used when transactionSource = 'givebutter'.",
    }),
    afterDonateNote: fields.text({
      label: "After-donate note (live transaction path)",
      description: "Shown below the donate form when Stripe or Givebutter is configured.",
      multiline: true,
    }),
    afterDonateNoteFallback: fields.text({
      label: "After-donate note (mailto / placeholder path)",
      description: "Shown below the donate form when no live transaction source is configured.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    thankYouBody: fields.text({
      label: "Thank-you body (live path)",
      description:
        "Body copy for /donate/thank-you when Stripe / Givebutter is configured. Avoid assuming donation completion.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    thankYouBodyFallback: fields.text({
      label: "Thank-you body (mailto / placeholder path)",
      description: "Body copy for /donate/thank-you when no live transaction source.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    transactionSourceNote: fields.text({
      label: "Transaction-source note (above FAQ)",
      description:
        "Optional note shown above the FAQ when transactionSource is not the FAQ's authored path.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    faq: fields.array(
      fields.object({
        question: fields.text({
          label: "Question",
          validation: { isRequired: true, length: { min: 1 } },
        }),
        answer: fields.text({
          label: "Answer",
          multiline: true,
          validation: { isRequired: true, length: { min: 1 } },
        }),
      }),
      {
        label: "FAQ",
        description:
          "4–6 items on tax deductibility, processing fees, how the money is used, recurring cancellation, etc.",
        itemLabel: (props) => props.fields.question.value.slice(0, 80) || "Question",
      },
    ),
  },
});
