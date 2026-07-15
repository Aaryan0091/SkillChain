import VerifyCertificatePageContent from "@/app/verify/[id]/VerifyCertificatePageContent";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DashboardVerifyCertificatePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <VerifyCertificatePageContent
      id={id}
      backHref="/dashboard/verify"
      backText="Back to Verify"
      recordHrefBase="/dashboard/verify"
      showInlineBackButton={false}
      showPageBackButton={false}
    />
  );
}
