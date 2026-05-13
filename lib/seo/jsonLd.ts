type BreadcrumbItem = {
  name: string;
  url: string;
};

export function breadcrumbList(siteUrl: string, items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.url, siteUrl).toString(),
    })),
  };
}

type CollectionPageArgs = {
  siteUrl: string;
  url: string;
  name: string;
  description?: string;
};

export function collectionPage({ siteUrl, url, name, description }: CollectionPageArgs) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    url: new URL(url, siteUrl).toString(),
    name,
    ...(description ? { description } : {}),
  };
}

type ArticleArgs = {
  siteUrl: string;
  url: string;
  headline: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  imageUrl?: string;
  publisherName: string;
};

export function articleLd({
  siteUrl,
  url,
  headline,
  datePublished,
  dateModified,
  authorName,
  imageUrl,
  publisherName,
}: ArticleArgs) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    url: new URL(url, siteUrl).toString(),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    ...(authorName ? { author: { "@type": "Person", name: authorName } } : {}),
    ...(imageUrl ? { image: new URL(imageUrl, siteUrl).toString() } : {}),
    publisher: { "@type": "Organization", name: publisherName },
  };
}

type NonprofitOrganizationArgs = {
  siteUrl: string;
  url: string;
  orgName: string;
  foundingDate: string | number;
  taxID?: string;
  address?: string;
  email?: string;
  sameAs?: string[];
  boardMembers?: Array<{ name: string; jobTitle: string }>;
};

export function nonprofitOrganization({
  siteUrl,
  url,
  orgName,
  foundingDate,
  taxID,
  address,
  email,
  sameAs,
  boardMembers,
}: NonprofitOrganizationArgs) {
  const filteredSameAs = (sameAs ?? []).filter((s) => s.length > 0);
  const members = (boardMembers ?? []).map((m) => ({
    "@type": "Person" as const,
    name: m.name,
    jobTitle: m.jobTitle,
  }));
  return {
    "@context": "https://schema.org",
    "@type": "NonprofitOrganization",
    name: orgName,
    url: new URL(url, siteUrl).toString(),
    foundingDate: String(foundingDate),
    ...(taxID ? { taxID } : {}),
    ...(address ? { address: { "@type": "PostalAddress", streetAddress: address } } : {}),
    ...(email ? { email } : {}),
    ...(filteredSameAs.length > 0 ? { sameAs: filteredSameAs } : {}),
    ...(members.length > 0 ? { member: members } : {}),
  };
}
