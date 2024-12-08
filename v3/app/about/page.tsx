import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About • memeSRC",
  description: "Generated by create next app",
};

export default function SearchPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black-100">
      <p className="text-4xl font-bold text-white text-center">About Page</p>
      <p className="text-1xl text-white text-center">memeSRC V3 is a collaborative effort brought to you by Vibe House LLC. a subset of Superset LLC.</p>
    </div>
  );
}
