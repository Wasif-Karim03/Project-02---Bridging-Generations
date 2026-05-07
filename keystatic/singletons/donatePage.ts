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
    givebutterAccountId: fields.text({
      label: "Givebutter account ID (acct= in embed code)",
      description:
        "From the Givebutter dashboard's embed snippet: the value in the acct= query param of the widget script URL. Both this and the campaign ID must be real before the donate form will mount — otherwise the site shows an email-us fallback.",
      validation: { isRequired: true, length: { min: 1 } },
    }),
    givebutterCampaignId: fields.text({
      label: "Givebutter campaign ID (widget id)",
      description:
        "From the Givebutter dashboard's embed snippet: the value on the <givebutter-widget id=...> element. A six-character code — verify it resolves at givebutter.com/<code> before pasting.",
      validation: { isRequired: true, length: { min: 1 } },
    }),
    monthlySuggestion: fields.integer({
      label: "Monthly suggestion (USD)",
      description: 'e.g. 30 — used in CTAs like "$30/month sponsors one student".',
      validation: { min: 0 },
    }),
    transactionSource: fields.select({
      label: "Transaction source",
      description:
        "How donations actually flow today. 'Givebutter' = embed IDs are real and the widget mounts; receipt-promise copy renders. 'Mailto' / 'Placeholder' = donations route through the contact email; receipt-promise copy is suppressed and the fallback copy below renders instead.",
      options: [
        { label: "Givebutter (live widget)", value: "givebutter" },
        { label: "Mailto fallback", value: "mailto" },
        { label: "Placeholder (setup pending)", value: "placeholder" },
      ],
      defaultValue: "placeholder",
    }),
    afterDonateNote: fields.text({
      label: "After-donate note (Givebutter path)",
      description: "Shown below the embed when transaction source is 'givebutter'.",
      multiline: true,
    }),
    afterDonateNoteFallback: fields.text({
      label: "After-donate note (mailto / placeholder path)",
      description:
        "Shown below the embed when transaction source is not 'givebutter'. Should describe the mailto path honestly.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    thankYouBody: fields.text({
      label: "Thank-you body (Givebutter path)",
      description:
        "Body copy for /donate/thank-you when transaction source is 'givebutter'. Avoid assuming donation completion — some visitors type the URL without donating.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    thankYouBodyFallback: fields.text({
      label: "Thank-you body (mailto / placeholder path)",
      description:
        "Body copy for /donate/thank-you when transaction source is not 'givebutter'. No Givebutter receipt promise.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    transactionSourceNote: fields.text({
      label: "Transaction-source note (above FAQ)",
      description:
        "Shown above the FAQ when transaction source is not 'givebutter' — flags that the FAQ describes the Givebutter path that isn't live yet.",
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
