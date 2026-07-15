import VerifyCertificatePageContent from "./VerifyCertificatePageContent";

type VerifyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { id } = await params;

  return (
    <VerifyCertificatePageContent
      id={id}
      backHref="/verify"
      backText="Back to Search"
      recordHrefBase="/verify"
    />
  );
}
