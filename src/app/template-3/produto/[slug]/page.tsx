import { TplProductPage, tplProductMetadata } from '@/templates/ProductPage';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return tplProductMetadata((await params).slug);
}

export default async function Page({ params }: Props) {
  return <TplProductPage n={3} slug={(await params).slug} />;
}
