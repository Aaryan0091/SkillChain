import CertificateDetailClient from "./CertificateDetailClient";

type CertificatePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DashboardCertificatePage({
  params,
}: CertificatePageProps) {
  const { id } = await params;
  return <CertificateDetailClient certificateId={id} />;
}
