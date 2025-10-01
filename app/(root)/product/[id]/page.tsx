import React from "react";
import { ProductDetails } from "@/components";

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { id } = await params;
  return (
    <ProductDetails id={id} />
  );
}