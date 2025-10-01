import React from "react";
import { ProductDetails } from "@/components";

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { id } = React.use(params);
  return (
    <ProductDetails id={id} />
  );
}